import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getAllTicket = async (req: Request, res: Response): Promise<void> => {
    try {
        const tickets = await prisma.ticket.findMany();
        res.status(200).json({
            tickets: tickets,
        });
    } catch (error) {
        res.status(500).json({
            message: error,
        });
    }
};

export const getTicketByID = async (req: Request, res: Response): Promise<void> => {
    const { ticketId } = req.params;
    try {
        const ticket = await prisma.ticket.findUnique({
            where: {
                ticketId: ticketId,
            },
        });
        res.status(200).json({
            ticket: ticket,
        });
    } catch (error) {
        res.status(500).json({
            message: error,
        });
    }
};
