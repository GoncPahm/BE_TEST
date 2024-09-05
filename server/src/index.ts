import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import ticketRoute from "./routes/ticket.route";
import bookingRoute from "./routes/booking.route";
import paypalRoute from "./routes/paypal.route";
dotenv.config();

const port = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);

app.use("/api/ticket", ticketRoute);
app.use("/api/booking", bookingRoute);
app.use("/api/paypal", paypalRoute);

app.listen(port, () => {
    console.log("Server is running on port 8000");
});
