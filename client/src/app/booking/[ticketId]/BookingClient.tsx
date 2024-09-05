"use client";
import { useAppSelector } from "@/redux";
import { CreateBookingProps, Ticket, useCreateNewBookingMutation } from "@/state/api";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const BookingClient = ({ ticket }: { ticket: Ticket }) => {
    const userId = useAppSelector((state) => state.global.userId);
    const router = useRouter();
    const [createBookingMutation, { isLoading: createLoading }] = useCreateNewBookingMutation();
    const [quantity, setQuantity] = useState(1);
    const handleCreateNewBooking = async (createBookingProps: CreateBookingProps) => {
        const order = await createBookingMutation(createBookingProps).unwrap();
        console.log(order);
        
        if (order && order.orderId) {
            router.push(`/confirm/${order.orderId}`);
        }
    };

    return (
        <div className="flex flex-col gap-5">
            <input
                type="number"
                className="outline-none border border-blue-300 rounded-md py-2 text-base px-5"
                placeholder="Quantity"
                value={quantity}
                min={1}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
            />
            <button
                className="py-3 px-10 rounded-full bg-blue-500 text-white text-base mt-4 flex justify-center items-center"
                disabled={createLoading}
                onClick={() => {
                    const createBookingProps: CreateBookingProps = {
                        userId: userId,
                        ticketId: ticket.ticketId,
                        quantity: quantity,
                        total: ticket.price * quantity,
                        updateAt: ticket.updateAt.toString(),
                    };
                    console.log(createBookingProps);
                    if (ticket.status === "AVAILABLE") {
                        handleCreateNewBooking(createBookingProps);
                    } else {
                        alert("Sorry, Ticket is unvailable!!!");
                    }
                }}
            >
                {createLoading ? <Loader className="animate-spin" /> : "Booking"}
            </button>
        </div>
    );
};

export default BookingClient;
