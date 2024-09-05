import { PrismaClient, Ticket } from "@prisma/client";
import { Request, Response } from "express";
import dotenv from "dotenv";
import { CreateOrderProps } from "./booking.controller";
import cron from "node-cron";
import { log } from "util";
dotenv.config();
const prisma = new PrismaClient();

const generateAccessToken = async () => {
    try {
        const response = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
            method: "POST",
            headers: {
                Authorization: `Basic ${Buffer.from(`${process.env.CLIENT_ID}:${process.env.SECRET_KEY}`).toString(
                    "base64"
                )}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "client_credentials",
            }),
        });

        if (!response.ok) {
            throw new Error(`Error fetching access token: ${response.statusText}`);
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
};

const createOrder = async (createProps: CreateOrderProps) => {
    const access_token = await generateAccessToken();

    try {
        const ticket = await prisma.ticket.findUnique({
            where: {
                ticketId: createProps.ticketId,
            },
        });
        if (!ticket) {
            throw new Error("Ticket is not found!!");
        }

        const response = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${access_token}`,
            },
            body: JSON.stringify({
                intent: "CAPTURE",
                purchase_units: [
                    {
                        items: [
                            {
                                name: ticket.name,
                                unit_amount: {
                                    currency_code: "USD",
                                    value: ticket.price,
                                },
                                quantity: createProps.quantity,
                            },
                        ],
                        amount: {
                            currency_code: "USD",
                            value: createProps.total,
                            breakdown: {
                                item_total: {
                                    currency_code: "USD",
                                    value: createProps.total,
                                },
                                shipping: {
                                    currency_code: "USD",
                                    value: 0,
                                },
                            },
                        },
                    },
                ],
                application_context: {
                    return_url: "http://localhost:3000",
                },
            }),
        });

        // const responseText = await response.text();
        // console.log("PayPal Response:", responseText);

        if (!response.ok) {
            throw new Error(`Error creating PayPal order: ${response.statusText}`);
        }

        const result = await response.json();
        return result.id;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
};

const captureOrder = async (orderId: string) => {
    const access_token = await generateAccessToken();
    console.log(orderId);

    try {
        const response = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${access_token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("PayPal Error Details:", errorData);
            throw new Error(`Error capturing PayPal order: ${response.statusText}`);
        }

        const result = await response.json();

        return result;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
};

const refundOrder = async (paypalId: string, refundAmount: number) => {
    const access_token = await generateAccessToken();

    try {
        const response = await fetch(`https://api-m.sandbox.paypal.com/v2/payments/captures/${paypalId}/refund`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${access_token}`,
            },
            body: JSON.stringify({
                amount: {
                    currency_code: "USD",
                    value: refundAmount * 0.9,
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("PayPal Error Details:", errorData);
            throw new Error(`Error refunding PayPal order: ${response.statusText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
};

export const purchaseBooking = async (req: Request, res: Response) => {
    const { bookingId } = req.body;

    try {
        const paypalId = await createOrder(req.body);
        res.status(200).json({
            paypalId: paypalId,
            bookingId: bookingId,
        });
    } catch (error) {
        res.status(500).json({
            message: error,
        });
    }
};

export const confirmBooking = async (req: Request, res: Response) => {
    try {
        const { paypalId, bookingId } = req.body;
        const result = await captureOrder(paypalId);
        console.log(result);

        if (result.status === "COMPLETED") {
            await prisma.order.update({
                where: {
                    orderId: bookingId,
                },
                data: {
                    status: "SUCCESS",
                    captureId: result.id,
                },
            });
        }
        res.status(200).json({
            booking: bookingId,
            status: true,
        });
    } catch (error) {
        res.status(500).json({ message: error });
    }
};

const getOrderDetails = async (captureId: string) => {
    const access_token = await generateAccessToken();

    const response = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${captureId}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });

    const orderDetails = await response.json();
    return orderDetails;
};

export const cancelBooking = async (req: Request, res: Response) => {
    try {
        const { captureId, orderId } = req.body;
        console.log(captureId);
        const orderDetails = await getOrderDetails(captureId);
        // if (orderDetails) {
        //     console.log(orderDetails.purchase_units[0].payments.captures[0].id);
        // }
        const paypalId = orderDetails.purchase_units[0].payments.captures[0].id;
        const booking = await prisma.order.findUnique({
            where: {
                captureId: captureId,
                orderId: orderId,
            },
        });

        if (!booking) {
            res.status(400).json({
                message: "Booking not found",
            });
        } else {
            const result = await refundOrder(paypalId, booking?.total);
            if (result) {
                await prisma.order.update({
                    where: {
                        captureId: captureId,
                        orderId: orderId,
                    },
                    data: {
                        status: "CANCEL",
                    },
                });
                res.status(200).json({
                    booking: orderId,
                });
            }
        }
    } catch (error) {
        res.status(500).json({ message: error });
    }
};
