"use client";
import { useAppSelector } from "@/redux";
import { useCancelBookingMutation, useGetAllBookingQuery } from "@/state/api";
import axios from "axios";
import { stringify } from "querystring";
import React, { useEffect } from "react";

const History = () => {
    const userId = useAppSelector((state) => state.global.userId);
    const { data: bookings, isLoading, refetch } = useGetAllBookingQuery(userId);
    console.log(bookings);
    const [cancelMutation] = useCancelBookingMutation();
    useEffect(() => {
        refetch();
    }, [refetch]);

    const handleCancel = async (captureId: string, orderId: string) => {
        // await cancelMutation({ bookingId: orderId });
        try {
            const res = await axios.post(`http://localhost:8000/api/paypal/cancel_order`, { captureId: captureId, orderId: orderId });
            alert("Booking is cancelled, the system will refund 90% value for you!!")
            refetch()
        } catch (error) {
            console.log(error);
        }
    };

    if (isLoading) {
        return <div>Loading....</div>;
    }

    return (
        <div className="h-full bg-white pt-10 px-20 pb-20">
            <ul className="grid grid-cols-2 gap-6 h-full overflow-auto">
                {bookings?.map((booking) => (
                    <li
                        key={booking.orderId}
                        className="py-6 bg-gray-100 rounded-lg shadow-md px-6 flex justify-between items-center gap-6 text-base"
                    >
                        <h1 className="max-w-[200px]">Ticket: {booking.ticket.name}</h1>
                        <span>Quantity: {booking.quantity}</span>
                        <span>Total: {booking.total}</span>
                        <span>Status: {booking.status}</span>
                        <span>Date booking: {new Date(booking.orderedAt).toISOString()}</span>
                        <button
                            className={`p-3 rounded-md text-white ${
                                booking.status === "PENDING" || booking.status === "CANCEL"
                                    ? "bg-gray-500 pointer-events-none"
                                    : "bg-red-500"
                            }`}
                            onClick={() => {
                                handleCancel(booking.captureId, booking.orderId);
                            }}
                        >
                            Cancel
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default History;
