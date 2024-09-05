/*
  Warnings:

  - You are about to drop the column `stock_quantity` on the `Ticket` table. All the data in the column will be lost.
  - Added the required column `remaining_quantity` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "stock_quantity",
ADD COLUMN     "remaining_quantity" INTEGER NOT NULL;
