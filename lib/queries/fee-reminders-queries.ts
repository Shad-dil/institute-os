import { prisma } from "@/lib/prisma";

export interface FeeReminderNoticeRow {
  id: string;
  invoiceId: string;
  studentName: string;
  amount: number;
  studentPhone: string;
  parentPhone: string | null;
  dueDate: string;
}

export async function getUnreadFeeReminders(instituteId: string): Promise<FeeReminderNoticeRow[]> {
  const notices = await prisma.feeReminderNotice.findMany({
    where: { instituteId, isRead: false },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      invoiceId: true,
      studentName: true,
      amount: true,
      invoice: {
        select: {
          dueDate: true,
          student: { select: { phone: true, parentPhone: true } },
        },
      },
    },
  });

  return notices.map((n) => ({
    id: n.id,
    invoiceId: n.invoiceId,
    studentName: n.studentName,
    amount: Number(n.amount),
    studentPhone: n.invoice.student.phone,
    parentPhone: n.invoice.student.parentPhone,
    dueDate: n.invoice.dueDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
  }));
}
