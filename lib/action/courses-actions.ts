"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentInstituteId } from "@/lib/queries/institute";

interface ActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

// ---------------------------------------------------------------------------
// Course — only change from before: billingCycle added to the schema and
// both create/update calls. Batch actions below are completely unchanged.
// ---------------------------------------------------------------------------

const courseSchema = z.object({
  name: z.string().min(2, "Course name is required"),
  fees: z.coerce.number().positive("Fee must be greater than 0"),
  duration: z.string().min(1, "Duration is required"),
  billingCycle: z.enum(["ONE_TIME", "MONTHLY"]).default("ONE_TIME"),
});

export async function createCourse(formData: FormData): Promise<ActionResult> {
  const parsed = courseSchema.safeParse({
    name: formData.get("name"),
    fees: formData.get("fees"),
    duration: formData.get("duration"),
    billingCycle: formData.get("billingCycle") || "ONE_TIME",
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const instituteId = await getCurrentInstituteId();
    const course = await prisma.course.create({ data: { ...parsed.data, instituteId } });
    revalidatePath("/courses");
    return { success: true, id: course.id };
  } catch {
    return { success: false, error: "Couldn't create the course. Please try again." };
  }
}

export async function updateCourse(courseId: string, formData: FormData): Promise<ActionResult> {
  const parsed = courseSchema.safeParse({
    name: formData.get("name"),
    fees: formData.get("fees"),
    duration: formData.get("duration"),
    billingCycle: formData.get("billingCycle") || "ONE_TIME",
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await prisma.course.update({ where: { id: courseId }, data: parsed.data });
    revalidatePath("/courses");
    return { success: true };
  } catch {
    return { success: false, error: "Couldn't update the course. Please try again." };
  }
}

export async function deleteCourse(courseId: string): Promise<ActionResult> {
  try {
    const studentCount = await prisma.student.count({ where: { courseId } });
    if (studentCount > 0) {
      return {
        success: false,
        error: `This course has ${studentCount} enrolled student${studentCount === 1 ? "" : "s"} — move or remove them first.`,
      };
    }

    await prisma.course.delete({ where: { id: courseId } });
    revalidatePath("/courses");
    return { success: true };
  } catch {
    return { success: false, error: "Couldn't delete the course. Please try again." };
  }
}

// ---------------------------------------------------------------------------
// Batch — UNCHANGED from before, included only so this file is complete
// and drop-in safe.
// ---------------------------------------------------------------------------

const batchSchema = z.object({
  courseId: z.string().min(1),
  name: z.string().min(1, "Batch name is required"),
  schedule: z.string().min(1, "Schedule is required (e.g. 'Mon, Wed, Fri · 6–7:30 PM')"),
  facultyName: z.string().optional().or(z.literal("")),
  capacity: z.union([z.coerce.number().positive(), z.literal("")]).optional(),
  startDate: z.string().optional().or(z.literal("")),
});

export async function createBatch(formData: FormData): Promise<ActionResult> {
  const parsed = batchSchema.safeParse({
    courseId: formData.get("courseId"),
    name: formData.get("name"),
    schedule: formData.get("schedule"),
    facultyName: formData.get("facultyName") || "",
    capacity: formData.get("capacity") || "",
    startDate: formData.get("startDate") || "",
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const instituteId = await getCurrentInstituteId();
    const data = parsed.data;
    const batch = await prisma.batch.create({
      data: {
        courseId: data.courseId,
        instituteId,
        name: data.name,
        schedule: data.schedule,
        facultyName: data.facultyName || null,
        capacity: data.capacity ? Number(data.capacity) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
      },
    });
    revalidatePath("/courses");
    return { success: true, id: batch.id };
  } catch {
    return { success: false, error: "Couldn't create the batch. Please try again." };
  }
}

export async function updateBatch(batchId: string, formData: FormData): Promise<ActionResult> {
  const parsed = batchSchema.omit({ courseId: true }).safeParse({
    name: formData.get("name"),
    schedule: formData.get("schedule"),
    facultyName: formData.get("facultyName") || "",
    capacity: formData.get("capacity") || "",
    startDate: formData.get("startDate") || "",
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const data = parsed.data;
    await prisma.batch.update({
      where: { id: batchId },
      data: {
        name: data.name,
        schedule: data.schedule,
        facultyName: data.facultyName || null,
        capacity: data.capacity ? Number(data.capacity) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
      },
    });
    revalidatePath("/courses");
    return { success: true };
  } catch {
    return { success: false, error: "Couldn't update the batch. Please try again." };
  }
}

export async function deleteBatch(batchId: string): Promise<ActionResult> {
  try {
    await prisma.batch.delete({ where: { id: batchId } });
    revalidatePath("/courses");
    revalidatePath("/attendance");
    return { success: true };
  } catch {
    return { success: false, error: "Couldn't delete the batch. Please try again." };
  }
}
