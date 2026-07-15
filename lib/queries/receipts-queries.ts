import { prisma } from "@/lib/prisma";

export interface ReceiptData {
  receiptNumber: string;
  paidAt: string;
  amount: number;
  method: string;
  studentName: string;
  studentPhone: string;
  courseName: string;
  invoiceTotal: number;
  invoicePaidToDate: number;
  invoiceBalance: number;
  instituteName: string;
  instituteEmail: string;
  logoUrl: string | null;
  signatureUrl: string | null;
  signatoryName: string | null;
}

export async function getReceiptData(paymentId: string, instituteId: string): Promise<ReceiptData | null> {
  const payment = await prisma.payment.findFirst({
    // The tenant check: this payment's invoice's student must belong to
    // the calling institute. Nothing renders otherwise.
    where: { id: paymentId, invoice: { student: { instituteId } } },
    select: {
      receiptNumber: true,
      amount: true,
      method: true,
      paidAt: true,
      invoice: {
        select: {
          amount: true,
          amountPaid: true,
          student: {
            select: {
              name: true,
              phone: true,
              course: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!payment || !payment.receiptNumber) return null;

  const institute = await prisma.institute.findUnique({
    where: { id: instituteId },
    select: { name: true, email: true, logoUrl: true, signatureUrl: true, signatoryName: true },
  });
  if (!institute) return null;

  const invoiceTotal = Number(payment.invoice.amount);
  const invoicePaidToDate = Number(payment.invoice.amountPaid);

  return {
    receiptNumber: payment.receiptNumber,
    paidAt: payment.paidAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    amount: Number(payment.amount),
    method: payment.method,
    studentName: payment.invoice.student.name,
    studentPhone: payment.invoice.student.phone,
    courseName: payment.invoice.student.course.name,
    invoiceTotal,
    invoicePaidToDate,
    invoiceBalance: invoiceTotal - invoicePaidToDate,
    instituteName: institute.name,
    instituteEmail: institute.email,
    logoUrl: institute.logoUrl,
    signatureUrl: institute.signatureUrl,
    signatoryName: institute.signatoryName,
  };
}
