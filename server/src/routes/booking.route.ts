import { Router } from "express";
import { autoCancelBooking, createNewBooking, getAllBooking, getBookingByID } from "../controllers/booking.controller";

const router = Router();

router.post("/create_new_order", createNewBooking);
router.get("/get_booking/:orderId", getBookingByID);
router.get("/get_all", getAllBooking);
router.post("/auto_cancel", autoCancelBooking);

export default router;
