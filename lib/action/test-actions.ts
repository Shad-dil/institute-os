"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentInstituteId } from "@/lib/queries/institute";

const createTestSchema = z.object({
  courseId: z.string().min(1),
  name: z.string().min(1, "Test name is required"),
  maxMarks: z.coerce.number().positive("Max marks must be greater than 0"),
  testDate: z.coerce.date(),
});

export interface CreateTestResult {
  success: boolean;
  error?: string;
  testId?: string;
}

export async function createTest(formData: FormData): Promise<CreateTestResult> {
  const parsed = createTestSchema.safeParse({
    courseId: formData.get("courseId"),
    name: formData.get("name"),
    maxMarks: formData.get("maxMarks"),
    testDate: formData.get("testDate"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    // instituteId comes from the session, never from the client — this
    // used to accept it via formData, which meant anyone could edit the
    // form and create a test under a tenant that wasn't theirs.
    const instituteId = await getCurrentInstituteId();

    // Also verify the chosen course actually belongs to this institute —
    // otherwise a client-supplied courseId could still attach a test to
    // another tenant's course even with instituteId now correct.
    const course = await prisma.course.findFirst({
      where: { id: parsed.data.courseId, instituteId },
      select: { id: true },
    });
    if (!course) {
      return { success: false, error: "That course wasn't found." };
    }

    const test = await prisma.test.create({
      data: { ...parsed.data, instituteId },
    });
    revalidatePath("/tests");
    return { success: true, testId: test.id };
  } catch {
    return { success: false, error: "Couldn't create the test. Please try again." };
  }
}

const marksEntrySchema = z.object({
  studentId: z.string().min(1),
  marksObtained: z.number().min(0),
});

const saveMarksSchema = z.object({
  testId: z.string().min(1),
  maxMarks: z.number().positive(),
  entries: z.array(marksEntrySchema).min(1, "Enter at least one student's marks"),
});

export interface SaveMarksResult {
  success: boolean;
  error?: string;
  savedCount?: number;
}

export async function saveMarks(
  testId: string,
  maxMarks: number,
  entries: { studentId: string; marksObtained: number }[]
): Promise<SaveMarksResult> {
  const parsed = saveMarksSchema.safeParse({ testId, maxMarks, entries });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const overMax = parsed.data.entries.find((e) => e.marksObtained > parsed.data.maxMarks);
  if (overMax) {
    return { success: false, error: `Marks can't exceed the maximum (${parsed.data.maxMarks}).` };
  }

  try {
    // Ownership check: this test must belong to the caller's institute.
    const instituteId = await getCurrentInstituteId();
    const test = await prisma.test.findFirst({
      where: { id: parsed.data.testId, instituteId },
      select: { id: true },
    });
    if (!test) {
      return { success: false, error: "Test not found." };
    }

    await prisma.$transaction(
      parsed.data.entries.map((entry) =>
        prisma.testResult.upsert({
          where: { testId_studentId: { testId: parsed.data.testId, studentId: entry.studentId } },
          update: { marksObtained: entry.marksObtained },
          create: {
            testId: parsed.data.testId,
            studentId: entry.studentId,
            marksObtained: entry.marksObtained,
          },
        })
      )
    );

    revalidatePath(`/tests/${testId}`);
    revalidatePath("/tests");

    return { success: true, savedCount: parsed.data.entries.length };
  } catch {
    return { success: false, error: "Couldn't save marks. Please try again." };
  }
}
