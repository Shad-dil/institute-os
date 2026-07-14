import { prisma } from "@/lib/prisma";
import type { CourseSummary, BatchSummary } from "@/types/courses";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

export async function getCourses(instituteId: string): Promise<CourseSummary[]> {
  const courses = await prisma.course.findMany({
    where: { instituteId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      fees: true,
      duration: true,
      billingCycle: true,
      students: { select: { id: true } },
      batches: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          schedule: true,
          facultyName: true,
          capacity: true,
          startDate: true,
          students: { select: { id: true } },
        },
      },
    },
  });

  return courses.map((c) => ({
    id: c.id,
    name: c.name,
    fees: toNumber(c.fees),
    duration: c.duration,
    billingCycle: c.billingCycle,
    studentCount: c.students.length,
    batches: c.batches.map((b) => mapBatch(b)),
  }));
}

function mapBatch(b: {
  id: string;
  name: string;
  schedule: string;
  facultyName: string | null;
  capacity: number | null;
  startDate: Date | null;
  students: { id: string }[];
}): BatchSummary {
  return {
    id: b.id,
    name: b.name,
    schedule: b.schedule,
    facultyName: b.facultyName,
    capacity: b.capacity,
    startDate: b.startDate
      ? b.startDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
      : null,
    studentCount: b.students.length,
    seatsLeft: b.capacity !== null ? Math.max(b.capacity - b.students.length, 0) : null,
  };
}

export async function getBatchesForCourse(courseId: string): Promise<BatchSummary[]> {
  const batches = await prisma.batch.findMany({
    where: { courseId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      schedule: true,
      facultyName: true,
      capacity: true,
      startDate: true,
      students: { select: { id: true } },
    },
  });

  return batches.map(mapBatch);
}
