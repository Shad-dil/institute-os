import { prisma } from "@/lib/prisma";
import type { CourseOption, TestSummary, TestDetail, TestResultRow } from "@/types/tests";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export async function getCourseOptions(instituteId: string): Promise<CourseOption[]> {
  const courses = await prisma.course.findMany({
    where: { instituteId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return courses;
}

export async function getTests(instituteId: string): Promise<TestSummary[]> {
  const tests = await prisma.test.findMany({
    where: { instituteId },
    orderBy: { testDate: "desc" },
    select: {
      id: true,
      name: true,
      maxMarks: true,
      testDate: true,
      course: { select: { name: true, _count: { select: { students: true } } } },
      _count: { select: { results: true } },
    },
  });

  return tests.map((t) => ({
    id: t.id,
    name: t.name,
    courseName: t.course.name,
    testDate: t.testDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    maxMarks: toNumber(t.maxMarks),
    totalStudents: t.course._count.students,
    marksEntered: t._count.results,
  }));
}

function assignRanks(rows: TestResultRow[]): TestResultRow[] {
  const withMarks = rows.filter((r) => r.marksObtained !== null);
  const withoutMarks = rows.filter((r) => r.marksObtained === null);

  withMarks.sort((a, b) => (b.marksObtained as number) - (a.marksObtained as number));

  let rank = 0;
  let previousMarks: number | null = null;
  withMarks.forEach((row, index) => {
    if (row.marksObtained !== previousMarks) {
      rank = index + 1;
      previousMarks = row.marksObtained;
    }
    row.rank = rank;
  });

  return [...withMarks, ...withoutMarks];
}

/**
 * instituteId is now required and enforced in the query itself — a test
 * ID belonging to a different institute simply won't match `findFirst`
 * here, so this returns null exactly like "test doesn't exist" would.
 * The page calling this should treat null as notFound(), which doesn't
 * leak whether the ID exists for someone else.
 */
export async function getTestDetail(testId: string, instituteId: string): Promise<TestDetail | null> {
  const test = await prisma.test.findFirst({
    where: { id: testId, instituteId },
    select: {
      id: true,
      name: true,
      maxMarks: true,
      testDate: true,
      course: {
        select: {
          name: true,
          students: {
            select: { id: true, name: true, phone: true, parentPhone: true },
            orderBy: { name: "asc" },
          },
        },
      },
      institute: { select: { name: true } },
      results: { select: { studentId: true, marksObtained: true } },
    },
  });

  if (!test) return null;

  const maxMarks = toNumber(test.maxMarks);
  const resultsByStudent = new Map(test.results.map((r) => [r.studentId, toNumber(r.marksObtained)]));

  const rows: TestResultRow[] = test.course.students.map((student) => {
    const marksObtained = resultsByStudent.has(student.id) ? resultsByStudent.get(student.id)! : null;
    return {
      studentId: student.id,
      studentName: student.name,
      avatarInitials: initials(student.name),
      studentPhone: student.phone,
      parentPhone: student.parentPhone,
      marksObtained,
      percentage: marksObtained !== null && maxMarks > 0 ? Math.round((marksObtained / maxMarks) * 1000) / 10 : null,
      rank: null,
    };
  });

  return {
    id: test.id,
    name: test.name,
    courseName: test.course.name,
    testDate: test.testDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    maxMarks,
    instituteName: test.institute.name,
    results: assignRanks(rows),
  };
}
