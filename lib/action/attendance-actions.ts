"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { normalizeDate } from "@/lib/queries/attendance-queries";

const markSchema = z.object({
  studentId: z.string().min(1),
  date: z.coerce.date(),
  status: z.enum(["PRESENT", "ABSENT", "LATE"]),
});

export interface MarkAttendanceResult {
  success: boolean;
  error?: string;
}

export async function markAttendance(
  studentId: string,
  dateISO: string,
  status: "PRESENT" | "ABSENT" | "LATE"
): Promise<MarkAttendanceResult> {
  const parsed = markSchema.safeParse({ studentId, date: dateISO, status });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const date = normalizeDate(parsed.data.date);

  try {
    await prisma.attendance.upsert({
      where: { studentId_date: { studentId: parsed.data.studentId, date } },
      update: { status: parsed.data.status },
      create: { studentId: parsed.data.studentId, date, status: parsed.data.status },
    });

    revalidatePath("/attendance");
    revalidatePath("/students");
    revalidatePath("/dashboard");

    return { success: true };
  } catch {
    return { success: false, error: "Couldn't save attendance. Please try again." };
  }
}

export interface MarkAllPresentResult {
  success: boolean;
  error?: string;
  markedCount?: number;
}

export async function markAllPresent(
  courseId: string,
  dateISO: string,
  batchId?: string
): Promise<MarkAllPresentResult> {
  const parsedDate = z.coerce.date().safeParse(dateISO);
  if (!parsedDate.success) {
    return { success: false, error: "Invalid date" };
  }
  const date = normalizeDate(parsedDate.data);

  try {
    const students = await prisma.student.findMany({
      where: batchId ? { batchId } : { courseId },
      select: { id: true },
    });

    const existing = await prisma.attendance.findMany({
      where: { date, studentId: { in: students.map((s) => s.id) } },
      select: { studentId: true },
    });
    const alreadyMarked = new Set(existing.map((e) => e.studentId));
    const toMark = students.filter((s) => !alreadyMarked.has(s.id));

    if (toMark.length > 0) {
      await prisma.$transaction(
        toMark.map((s) =>
          prisma.attendance.create({
            data: { studentId: s.id, date, status: "PRESENT" },
          })
        )
      );
    }

    revalidatePath("/attendance");
    revalidatePath("/students");
    revalidatePath("/dashboard");

    return { success: true, markedCount: toMark.length };
  } catch {
    return { success: false, error: "Couldn't mark attendance. Please try again." };
  }
}
