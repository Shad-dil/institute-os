import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Run once a month (see vercel.json). For every student who is:
 *   - enrollmentStatus ACTIVE (this is the whole reason that field
 *     exists — a paused/left student is simply skipped, no invoice,
 *     no reminder, no manual "please stop billing them" step needed)
 *   - enrolled in a course with billingCycle MONTHLY
 *   - hasn't already been billed THIS calendar month
 * ...create their next invoice, plus a FeeReminderNotice pointing at it.
 *
 * "Hasn't already been billed this month" also naturally covers a
 * student's very first month — Admission already creates their first
 * invoice, so this job correctly skips them until next month.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const students = await prisma.student.findMany({
    where: {
      enrollmentStatus: "ACTIVE",
      course: { billingCycle: "MONTHLY" },
    },
    select: {
      id: true,
      name: true,
      instituteId: true,
      course: { select: { fees: true } },
      invoices: {
        where: { createdAt: { gte: monthStart } },
        select: { id: true },
        take: 1,
      },
    },
  });

  let invoicesCreated = 0;

  for (const student of students) {
    if (student.invoices.length > 0) continue; // already billed this month

    const amount = student.course.fees;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // one week to pay, adjust if you want a different grace period

    await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          amount,
          amountPaid: 0,
          dueDate,
          status: "PENDING",
          studentId: student.id,
        },
      });

      await tx.feeReminderNotice.create({
        data: {
          instituteId: student.instituteId,
          invoiceId: invoice.id,
          studentName: student.name,
          amount,
        },
      });
    });

    invoicesCreated++;
  }

  return NextResponse.json({ studentsChecked: students.length, invoicesCreated });
}
