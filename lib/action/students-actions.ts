"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const addNoteSchema = z.object({
  studentId: z.string().min(1),
  content: z.string().min(1, "Note can't be empty").max(1000),
});

export interface AddNoteResult {
  success: boolean;
  error?: string;
}

export async function addNote(studentId: string, content: string): Promise<AddNoteResult> {
  const parsed = addNoteSchema.safeParse({ studentId, content });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await prisma.note.create({ data: parsed.data });
    revalidatePath(`/students`);
    return { success: true };
  } catch {
    return { success: false, error: "Couldn't save the note. Please try again." };
  }
}

export interface DeleteStudentsResult {
  success: boolean;
  error?: string;
  deletedCount?: number;
}

/** Deletes students and, via onDelete: Cascade on every related model
 *  (Attendance, Invoice → Payment, TestResult, Note), everything tied to
 *  them. This is genuinely destructive — the confirmation dialog on the
 *  client side is doing real work here, not just decoration. */
export async function deleteStudents(studentIds: string[]): Promise<DeleteStudentsResult> {
  if (studentIds.length === 0) {
    return { success: false, error: "No students selected" };
  }

  try {
    const result = await prisma.student.deleteMany({ where: { id: { in: studentIds } } });
    revalidatePath("/students");
    revalidatePath("/dashboard");
    revalidatePath("/fees");
    return { success: true, deletedCount: result.count };
  } catch {
    return { success: false, error: "Couldn't delete the selected students. Please try again." };
  }
}
