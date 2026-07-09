import { prisma } from "@/lib/prisma";
import type { CourseFeeOption } from "@/types/admission";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

export async function getAdmissionCourseOptions(instituteId: string): Promise<CourseFeeOption[]> {
  const courses = await prisma.course.findMany({
    where: { instituteId },
    select: {
      id: true,
      name: true,
      fees: true,
      duration: true,
      batches: {
        orderBy: { name: "asc" },
        select: { id: true, name: true, schedule: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return courses.map((c) => ({
    id: c.id,
    name: c.name,
    fees: toNumber(c.fees),
    duration: c.duration,
    batches: c.batches,
  }));
}
