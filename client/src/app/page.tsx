"use client";
import { useGetTicketMetricsQuery } from "@/state/api";
import { BadgeCheck, BadgeX, CircleArrowRight, Package } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function Home() {
    const { data: ticketsMetrics, isLoading, refetch } = useGetTicketMetricsQuery();

    useEffect(() => {
        refetch();
    }, [refetch]);

    if (isLoading) return <div className="pt-10 text-center">Loading...</div>;
    return (
        <div className="bg-white h-full pt-10 pb-20">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-6 overflow-auto h-full px-20">
                {ticketsMetrics?.tickets.map((ticket) => (
                    <div
                        key={ticket.ticketId}
                        className="bg-gray-100 relative flex flex-col justify-between gap-3 hover:shadow-md transition-all duration-200 cursor-pointer p-3 rounded-lg"
                    >
                        <div className="absolute top-2 right-2" title={ticket.status}>
                            {ticket.status === "AVAILABLE" ? <BadgeCheck /> : <BadgeX />}
                        </div>
                        <h1 className="font-semibold text-xl hover:text-blue-300">{ticket.name}</h1>
                        <div className="flex flex-col gap-3 items-start xl:flex-row xl:justify-between">
                            <span className="text-base italic text-gray-500">${ticket.price}</span>
                            <div className="flex items-center gap-2">
                                <Package /> <span>{ticket.remainingQuantity} tickets remaining</span>
                            </div>
                        </div>

                        <Link
                            href={`/booking/${ticket.ticketId}`}
                            className={`bg-blue-200 text-center font-semibold py-2 rounded-full flex justify-center items-center`}
                        >
                            <CircleArrowRight />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
