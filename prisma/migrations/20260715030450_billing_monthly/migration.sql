/*
  Warnings:

  - A unique constraint covering the columns `[receiptNumber]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Institute" ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "nextReceiptNumber" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "signatoryName" TEXT,
ADD COLUMN     "signatureUrl" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "receiptNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_receiptNumber_key" ON "Payment"("receiptNumber");
