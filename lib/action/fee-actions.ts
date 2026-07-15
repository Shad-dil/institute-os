"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentInstituteId } from "@/lib/queries/institute";

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

    const paymentId = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findFirst({
        where: { id: invoiceId, student: { instituteId } },
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

      // NEW — atomically claim the next receipt number. This is a real
      // UPDATE ... SET n = n + 1 at the database level, so two payments
      // recorded at the exact same instant still each get a unique,
      // sequential number — no race condition, no gap-filling needed.
      const institute = await tx.institute.update({
        where: { id: instituteId },
        data: { nextReceiptNumber: { increment: 1 } },
      });
      const receiptNumber = `RCP-${String(institute.nextReceiptNumber - 1).padStart(4, "0")}`;

      const payment = await tx.payment.create({
        data: { invoiceId, amount, method, receiptNumber },
      });

      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          amountPaid: newAmountPaid,
          status: newAmountPaid >= totalAmount ? "PAID" : "PARTIAL",
          paidAt: new Date(),
        },
      });

      return payment.id;
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
