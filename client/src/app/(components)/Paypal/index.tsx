"use client";
import { PurchasePaypalProps, PurchasePaypalRes } from "@/state/api";
import { PayPalButtons, PayPalButtonsComponentProps, PayPalScriptProvider } from "@paypal/react-paypal-js";
import axios from "axios";
import { useRouter } from "next/navigation";
import React from "react";

const PayPal = ({ data }: { data: PurchasePaypalProps }) => {
    const router = useRouter();

    const initialOptions = {
        clientId: "AaH-Ma_yIEXI_ptG8LVPc4qAIven4Ve-Jd4aZq-UTT-GJfSbWVT9SrWiMcN5Ofo_3ZJQWWxmz6fwUEZn",
        currency: "USD",
        intent: "capture",
    };

    const createOrder: PayPalButtonsComponentProps["createOrder"] = async () => {
        const res = await axios.post(`http://localhost:8000/api/paypal/create_order`, data);
        const paypalData = res.data;
        return paypalData.paypalId;
    };

    const onApprove: PayPalButtonsComponentProps["onApprove"] = async (capture, actions) => {
        const res = await axios.post(`http://localhost:8000/api/paypal/capture_order`, {
            paypalId: capture.orderID,
            bookingId: data.bookingId,
        });

        const captureData = res.data;

        if (captureData.status) {
            router.push("/history");
        }
    };

    return (
        <PayPalScriptProvider options={initialOptions}>
            <PayPalButtons style={{ layout: "horizontal" }} createOrder={createOrder} onApprove={onApprove} />
        </PayPalScriptProvider>
    );
};

export default PayPal;
