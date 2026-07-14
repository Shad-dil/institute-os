-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('ONE_TIME', 'MONTHLY');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'PAUSED', 'LEFT');

-- CreateTable
CREATE TABLE "FeeReminderNotice" (
    "id" TEXT NOT NULL,
    "instituteId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeReminderNotice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeeReminderNotice_invoiceId_key" ON "FeeReminderNotice"("invoiceId");

-- AddForeignKey
ALTER TABLE "FeeReminderNotice" ADD CONSTRAINT "FeeReminderNotice_instituteId_fkey" FOREIGN KEY ("instituteId") REFERENCES "Institute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeReminderNotice" ADD CONSTRAINT "FeeReminderNotice_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
