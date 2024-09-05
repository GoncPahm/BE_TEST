import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const scheduleOrderCancellation = (bookingId: string, ticketId: string, quantity: number) => {
    const task = cron.schedule('*/1 * * * *', async () => {
        try {
            const order = await prisma.order.findUnique({
                where: { orderId: bookingId },
            });

            if (order?.status === 'PENDING') {
                
                await prisma.order.update({
                    where: { orderId: bookingId },
                    data: { status: 'CANCEL' },
                });

                // Hoàn lại số vé
                const ticket = await prisma.ticket.findUnique({
                    where: { ticketId: ticketId },
                });

                if (ticket) {
                    await prisma.ticket.update({
                        where: { ticketId: ticketId },
                        data: {
                            remainingQuantity: ticket.remainingQuantity + parseInt(quantity.toString()),
                        },
                    });
                }

                console.log(`Order ${bookingId} has been cancelled due to no payment.`);
            }

            // Dừng task sau khi hoàn thành
            task.stop();
        } catch (error) {
            console.error('Error in cron job:', error);
        }
    });

    task.start();
};
