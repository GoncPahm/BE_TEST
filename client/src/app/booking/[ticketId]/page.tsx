import axios from "axios";
import BookingClient from "./BookingClient";

interface BookingPageProps {
    params: {
        ticketId: string;
    };
}

const Booking = async ({ params }: BookingPageProps) => {
    const { ticketId } = params;
    const res = await axios(`http://localhost:8000/api/ticket/get_ticket/${ticketId}`);
    const ticket = res.data.ticket;
    if (!ticket) {
        alert("Not found ticket");
    }

    return (
        <div className="bg-white h-full flex flex-col gap-3 justify-start items-center pt-20">
            <h1 className="font-bold text-blue-300 text-2xl">Booking Ticket</h1>
            <div className="border p-10 rounded-lg flex flex-col gap-3">
                <h1 className="text-xl font-semibold">
                    Name: <span className="text-blue-600">{ticket.name}</span>
                </h1>
                <h1 className="text-xl font-semibold">
                    Price:<span className="text-black"> ${ticket.price}</span>
                </h1>
                <h1 className="text-xl font-semibold">Remaining: {ticket.remainingQuantity} tickets </h1>
                <h1 className="text-xl font-semibold">
                    Status:{" "}
                    <span className={`text-base ${ticket.status === "AVAILABLE" ? "text-green-500" : "text-red-500"}`}>
                        {ticket.status}
                    </span>
                </h1>
            </div>
            <BookingClient ticket={ticket} />
        </div>
    );
};

export default Booking;
