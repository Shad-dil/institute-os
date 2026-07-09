import { prisma } from "@/lib/prisma";
import type { FeeOverview, InvoiceRow, PaymentRecord, FeeStatus } from "@/types/fees";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Invoice.status is denormalized for fast filtering, but "OVERDUE" also
 *  depends on today's date vs dueDate — a PENDING invoice past its due
 *  date should read as overdue even before a cron job flips the stored
 *  status. This derives the *effective* status for display. */
function effectiveStatus(status: FeeStatus, dueDate: Date): FeeStatus {
  if (status === "PENDING" && dueDate.getTime() < Date.now()) return "OVERDUE";
  return status;
}

export async function getFeeOverview(instituteId: string): Promise<FeeOverview> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [collectedAgg, invoices] = await Promise.all([
    prisma.payment.aggregate({
      where: { paidAt: { gte: monthStart }, invoice: { student: { instituteId } } },
      _sum: { amount: true },
    }),
    prisma.invoice.findMany({
      where: { status: { in: ["PENDING", "OVERDUE", "PARTIAL"] }, student: { instituteId } },
      select: { amount: true, amountPaid: true, dueDate: true, status: true },
    }),
  ]);

  let pendingAmount = 0;
  let overdueAmount = 0;
  let overdueCount = 0;

  for (const inv of invoices) {
    const balance = toNumber(inv.amount) - toNumber(inv.amountPaid);
    const status = effectiveStatus(inv.status as FeeStatus, inv.dueDate);
    pendingAmount += balance;
    if (status === "OVERDUE") {
      overdueAmount += balance;
      overdueCount += 1;
    }
  }

  return {
    collectedThisMonth: toNumber(collectedAgg._sum.amount),
    pendingAmount,
    overdueAmount,
    overdueCount,
  };
}

export async function getInvoices(instituteId: string): Promise<InvoiceRow[]> {
  const invoices = await prisma.invoice.findMany({
    where: { student: { instituteId } },
    orderBy: { dueDate: "asc" },
    select: {
      id: true,
      amount: true,
      amountPaid: true,
      dueDate: true,
      status: true,
      student: {
        select: { id: true, name: true, phone: true, course: { select: { name: true } } },
      },
    },
  });

  return invoices.map((inv) => {
    const totalAmount = toNumber(inv.amount);
    const amountPaid = toNumber(inv.amountPaid);
    return {
      id: inv.id,
      studentId: inv.student.id,
      studentName: inv.student.name,
      studentPhone: inv.student.phone,
      course: inv.student.course.name,
      totalAmount,
      amountPaid,
      balanceDue: totalAmount - amountPaid,
      dueDate: inv.dueDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      status: effectiveStatus(inv.status as FeeStatus, inv.dueDate),
      avatarInitials: initials(inv.student.name),
    };
  });
}

export async function getPaymentHistory(invoiceId: string): Promise<PaymentRecord[]> {
  const payments = await prisma.payment.findMany({
    where: { invoiceId },
    orderBy: { paidAt: "desc" },
    select: { id: true, amount: true, method: true, paidAt: true },
  });

  return payments.map((p) => ({
    id: p.id,
    amount: toNumber(p.amount),
    method: p.method,
    paidAt: p.paidAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
  }));
}
