"use client";
import React from "react";
import PayPal from "../../(components)/Paypal";
import { useGetBookingByIDQuery } from "@/state/api";
import { useParams } from "next/navigation";

const Confirm = () => {
    const { orderId } = useParams();
    const { data: booking, isLoading } = useGetBookingByIDQuery(orderId as string);

    if (isLoading) {
        return <div>Loading....</div>;
    }

    return (
        <div className="fixed inset-y-0 inset-x-0 bg-black bg-opacity-70 flex justify-center items-center">
            <div className="bg-white w-[500px] h-[300px] rounded-lg p-5 text-center flex flex-col justify-center gap-2">
                <h1 className="text-center font-bold text-xl">Confirm Booking Ticket</h1>
                <p>You have 5 minutes to purchase the booking</p>
                <p className="text-red-600 font-semibold">
                    After 5 minutes of non-payment, your order will be cancelled
                </p>
                <p className="text-xl">Click to purchase</p>
                <PayPal
                    data={{
                        orderId: orderId as string,
                        ticketId: booking ? booking.ticketId : "",
                        quantity: booking ? booking.quantity : 1,
                        total: booking ? booking.total : 1,
                        bookingId: booking ? booking.orderId : "",
                    }}
                />
            </div>
        </div>
    );
};

export default Confirm;
