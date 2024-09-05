import { Router } from "express";
import { cancelBooking, confirmBooking, purchaseBooking } from "../controllers/paypal.controller";

const router = Router();

router.post("/create_order", purchaseBooking);
router.post("/capture_order", confirmBooking);
router.post("/cancel_order", cancelBooking);

export default router;
