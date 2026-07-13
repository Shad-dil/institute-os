"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentInstituteId } from "@/lib/queries/institute";
import { createNotification } from "@/lib/notifications/create-notification";

const admissionSchema = z.object({
  name: z.string().min(2, "Enter the student's full name"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit phone number"),
  photoUrl: z.string().optional().or(z.literal("")),
  parentName: z.string().optional().or(z.literal("")),
  parentPhone: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || /^\d{10}$/.test(v),
      "Enter a valid 10-digit phone number",
    ),
  courseId: z.string().min(1, "Select a course"),
  batchId: z.string().optional().or(z.literal("")),
  feeAmount: z.coerce.number().positive("Fee must be greater than 0"),
  dueDate: z.coerce.date(),
  advanceAmount: z.coerce.number().min(0).default(0),
  advanceMethod: z
    .enum(["CASH", "UPI", "CARD", "BANK_TRANSFER", "OTHER"])
    .default("CASH"),
  inquiryId: z.string().optional().or(z.literal("")),
});

export interface CreateAdmissionResult {
  success: boolean;
  error?: string;
  studentId?: string;
}

export async function createAdmission(
  input: unknown,
): Promise<CreateAdmissionResult> {
  const parsed = admissionSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ??
        "Please check the form and try again.",
    };
  }

  const data = parsed.data;

  if (data.advanceAmount > data.feeAmount) {
    return {
      success: false,
      error: "Advance paid can't be more than the total fee.",
    };
  }

  try {
    const instituteId = await getCurrentInstituteId();
    if (data.inquiryId) {
      const inquiry = await prisma.inquiry.findFirst({
        where: { id: data.inquiryId, instituteId },
        select: { id: true },
      });
      if (!inquiry) {
        return { success: false, error: "That inquiry wasn't found." };
      }
    }
    const { studentId, courseName } = await prisma.$transaction(async (tx) => {
      const course = await tx.course.findFirst({
        where: { id: data.courseId, instituteId },
        select: { name: true },
      });
      if (!course) throw new Error("That course wasn't found.");

      const student = await tx.student.create({
        data: {
          name: data.name,
          email: data.email || null,
          phone: data.phone,
          photoUrl: data.photoUrl?.trim() || null,
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
      if (data.inquiryId) {
        await tx.inquiry.update({
          where: { id: data.inquiryId },
          data: { status: "CONVERTED", convertedStudentId: student.id },
        });
      }
      return { studentId: student.id, courseName: course.name };
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
      error:
        error instanceof Error
          ? error.message
          : "Couldn't complete the admission. Please try again.",
    };
  }
}
