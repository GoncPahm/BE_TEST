import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import dotenv from "dotenv";
import { scheduleOrderCancellation } from "../cron/cronJob";
dotenv.config();
const prisma = new PrismaClient();

export interface CreateOrderProps {
    ticketId: string;
    quantity: number;
    total: number;
    bookingId: string;
}

export const createNewBooking = async (req: Request, res: Response): Promise<void> => {
    const { userId, ticketId, quantity, total, updateAt } = req.body;
    console.log(req.body);

    const clientUpdateAt = new Date(updateAt).getTime();
    try {
        const ticket = await prisma.ticket.findUnique({
            where: {
                ticketId: ticketId,
            },
        });

        if (!ticket) {
            res.status(400).json({
                message: "Ticket is sold out!!!",
            });
            return;
        }

        if (ticket.updateAt.getTime() !== clientUpdateAt) {
            if (ticket.remainingQuantity < 1 || ticket.remainingQuantity < parseInt(quantity)) {
                res.status(400).json({
                    message: "Tickets remaining is not enough!!!",
                });
                return;
            }
        }

        const newBooking = await prisma.order.create({
            data: {
                userId: userId,
                quantity: parseInt(quantity),
                total: parseInt(total),
                ticketId: ticketId,
                captureId: "capture",
            },
        });

        const updateTicket = await prisma.ticket.update({
            where: {
                ticketId: ticketId,
            },
            data: {
                remainingQuantity: ticket?.remainingQuantity - parseInt(quantity),
            },
        });

        scheduleOrderCancellation(newBooking.orderId, ticket.ticketId, newBooking.quantity);

        res.status(200).json(newBooking);
    } catch (error) {
        res.status(500).json({
            message: error,
        });
    }
};

export const getBookingByID = async (req: Request, res: Response): Promise<void> => {
    const { orderId } = req.params;

    const booking = await prisma.order.findUnique({
        where: {
            orderId: orderId,
        },
    });

    res.status(200).json(booking);
};

export const getAllBooking = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.body;

    const bookings = await prisma.order.findMany({
        where: {
            userId: userId,
        },
        include: {
            ticket: true,
        },
    });

    res.status(200).json(bookings);
};

export const autoCancelBooking = async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderId, ticketId, quantity } = req.body;

        const order = await prisma.order.findUnique({
            where: { orderId },
        });

        if (!order) {
            res.status(404).json({ message: "Order not found." });
        }

        // Hủy đơn hàng
        await prisma.order.update({
            where: { orderId },
            data: {
                status: "CANCEL",
            },
        });

        // Cập nhật số lượng vé
        const ticket = await prisma.ticket.findUnique({
            where: { ticketId },
        });

        if (ticket) {
            await prisma.ticket.update({
                where: { ticketId },
                data: {
                    remainingQuantity: ticket.remainingQuantity + parseInt(quantity),
                },
            });
        } else {
            res.status(404).json({ message: "Ticket not found." });
        }

        res.status(200).json({
            message: "Order cancelled and ticket quantity updated successfully.",
            status: true,
        });
    } catch (error) {
        console.error("Error during order cancellation:", error);
        res.status(500).json({ message: error });
    }
};
