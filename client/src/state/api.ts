import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Ticket {
    ticketId: string;
    name: string;
    price: number;
    remainingQuantity: number;
    status: "AVAILABLE" | "UNAVAILABLE";
    updateAt: string;
}

export interface TicketMetrics {
    tickets: Ticket[];
}

export interface Booking {
    orderId: string;
    userId: string;
    ticketId: string;
    quantity: number;
    captureId: string;
    total: number;
    ticket: Ticket;
    status: "PENDING" | "SUCCESS" | "CANCEL";
    orderedAt: string;
    updateAt: string;
}

export interface CreateBookingProps {
    userId: string;
    ticketId: string;
    quantity: number;
    total: number;
    updateAt: string;
}

export interface PurchasePaypalProps {
    orderId: string;
    ticketId: string;
    quantity: number;
    total: number;
    bookingId: string;
}

export interface PurchasePaypalRes {
    orderId: string;
    bookingId: string;
}
export interface ConfirmPaypalRes {
    booking: string;
}


export const api = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_BASE_URL }),
    reducerPath: "api",
    tagTypes: [
        "TicketMetrics",
        "GetTicket",
        "CreateBooking",
        "GetBooking",
        "GetAllBooking",
        "PurchaseBooking",
        "ConfirmBooking",
        "CancelBooking",
    ],
    endpoints: (build) => ({
        getTicketMetrics: build.query<TicketMetrics, void>({
            query: () => "/api/ticket/get_all_ticket",
            providesTags: ["TicketMetrics"],
        }),
        getTicketById: build.query<Ticket, String>({
            query: (ticketId) => `/api/ticket/get_ticket/${ticketId}`,
            providesTags: ["GetTicket"],
        }),
        createNewBooking: build.mutation<Booking, CreateBookingProps>({
            query: (newBooking) => ({
                url: "/api/booking/create_new_order",
                method: "POST",
                body: newBooking,
            }),
            invalidatesTags: ["CreateBooking"],
        }),
        getBookingByID: build.query<Booking, String>({
            query: (orderId) => `/api/booking/get_booking/${orderId}`,
            providesTags: ["GetBooking"],
        }),
        getAllBooking: build.query<Booking[], String>({
            query: (userId) => `/api/booking/get_all`,
            providesTags: ["GetAllBooking"],
        }),
        cancelBooking: build.mutation<ConfirmPaypalRes, { bookingId: string }>({
            query: (newBooking) => ({
                url: "/api/booking/cancel_order",
                method: "POST",
                body: newBooking,
            }),
            invalidatesTags: ["CancelBooking"],
        }),
    }),
});

export const {
    useGetTicketMetricsQuery,
    useCreateNewBookingMutation,
    useGetTicketByIdQuery,
    useGetBookingByIDQuery,
    useGetAllBookingQuery,
    useCancelBookingMutation,
} = api;
