import { Router } from "express";
import { getAllTicket, getTicketByID } from "../controllers/ticket.controller";

const router = Router();

router.get("/get_all_ticket", getAllTicket);
router.get("/get_ticket/:ticketId", getTicketByID);

export default router;
