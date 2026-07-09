"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentInstituteId } from "@/lib/queries/institute";

const admissionSchema = z.object({
  name: z.string().min(2, "Enter the student's full name"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit phone number"),
  parentName: z.string().optional().or(z.literal("")),
  parentPhone: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^\d{10}$/.test(v), "Enter a valid 10-digit phone number"),
  courseId: z.string().min(1, "Select a course"),
  batchId: z.string().optional().or(z.literal("")),
  feeAmount: z.coerce.number().positive("Fee must be greater than 0"),
  dueDate: z.coerce.date(),
  advanceAmount: z.coerce.number().min(0).default(0),
  advanceMethod: z.enum(["CASH", "UPI", "CARD", "BANK_TRANSFER", "OTHER"]).default("CASH"),
});

export interface CreateAdmissionResult {
  success: boolean;
  error?: string;
  studentId?: string;
}

export async function createAdmission(input: unknown): Promise<CreateAdmissionResult> {
  const parsed = admissionSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const data = parsed.data;

  if (data.advanceAmount > data.feeAmount) {
    return { success: false, error: "Advance paid can't be more than the total fee." };
  }

  try {
    const instituteId = await getCurrentInstituteId();

    const studentId = await prisma.$transaction(async (tx) => {
      const student = await tx.student.create({
        data: {
          name: data.name,
          email: data.email || null,
          phone: data.phone,
          parentName: data.parentName || null,
          parentPhone: data.parentPhone || null,
          instituteId,
          courseId: data.courseId,
          batchId: data.batchId || null,
        },
      });

      const hasAdvance = data.advanceAmount > 0;
      const isFullyPaid = data.advanceAmount >= data.feeAmount;

      const invoice = await tx.invoice.create({
        data: {
          amount: data.feeAmount,
          amountPaid: data.advanceAmount,
          dueDate: data.dueDate,
          status: isFullyPaid ? "PAID" : hasAdvance ? "PARTIAL" : "PENDING",
          paidAt: hasAdvance ? new Date() : null,
          studentId: student.id,
        },
      });

      if (hasAdvance) {
        await tx.payment.create({
          data: {
            invoiceId: invoice.id,
            amount: data.advanceAmount,
            method: data.advanceMethod,
          },
        });
      }

      return student.id;
    });

    revalidatePath("/students");
    revalidatePath("/fees");
    revalidatePath("/dashboard");
    revalidatePath("/admissions");
    revalidatePath("/courses");

    return { success: true, studentId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Couldn't complete the admission. Please try again.",
    };
  }
}
