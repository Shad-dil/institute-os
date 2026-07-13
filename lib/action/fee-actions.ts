"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentInstituteId } from "@/lib/queries/institute";
import { createNotification } from "@/lib/notifications/create-notification";

const recordPaymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  method: z.enum(["CASH", "UPI", "CARD", "BANK_TRANSFER", "OTHER"]).default("CASH"),
});

export interface RecordPaymentResult {
  success: boolean;
  error?: string;
  paymentId?: string;
}

export async function recordPayment(formData: FormData): Promise<RecordPaymentResult> {
  const parsed = recordPaymentSchema.safeParse({
    invoiceId: formData.get("invoiceId"),
    amount: formData.get("amount"),
    method: formData.get("method") || "CASH",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { invoiceId, amount, method } = parsed.data;

  try {
    const instituteId = await getCurrentInstituteId();

    const { paymentId, studentName } = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findFirst({
        where: { id: invoiceId, student: { instituteId } },
        include: { student: { select: { name: true } } },
      });
      if (!invoice) throw new Error("Invoice not found");

      const totalAmount = Number(invoice.amount);
      const alreadyPaid = Number(invoice.amountPaid);
      const newAmountPaid = alreadyPaid + amount;

      if (newAmountPaid > totalAmount + 0.01) {
        throw new Error(
          `This payment (₹${amount}) would exceed the remaining balance (₹${(totalAmount - alreadyPaid).toFixed(2)}).`
        );
      }

      const payment = await tx.payment.create({
        data: { invoiceId, amount, method },
      });

      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          amountPaid: newAmountPaid,
          status: newAmountPaid >= totalAmount ? "PAID" : "PARTIAL",
          paidAt: new Date(),
        },
      });

      return { paymentId: payment.id, studentName: invoice.student.name };
    });

    // Immediate event — a real, one-off thing just happened, so no
    // dedupKey needed here (contrast with the cron-computed
    // notifications, which need one to avoid re-firing daily).
    await createNotification({
      instituteId,
      type: "PAYMENT_RECEIVED",
      title: "Payment received",
      message: `₹${amount.toLocaleString("en-IN")} from ${studentName}`,
      link: "/fees",
    });

    revalidatePath("/fees");
    revalidatePath("/dashboard");

    return { success: true, paymentId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong recording this payment.",
    };
  }
}
