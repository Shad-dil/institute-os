"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentInstituteId } from "@/lib/queries/institute";

const statusSchema = z.enum(["ACTIVE", "PAUSED", "LEFT"]);

export async function updateEnrollmentStatus(studentId: string, status: string): Promise<{ success: boolean; error?: string }> {
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return { success: false, error: "Invalid status" };

  try {
    const instituteId = await getCurrentInstituteId();
    const result = await prisma.student.updateMany({
      where: { id: studentId, instituteId },
      data: { enrollmentStatus: parsed.data },
    });
    if (result.count === 0) return { success: false, error: "Student not found" };

    revalidatePath("/students");
    revalidatePath(`/students/${studentId}`);
    return { success: true };
  } catch {
    return { success: false, error: "Couldn't update enrollment status. Please try again." };
  }
}
