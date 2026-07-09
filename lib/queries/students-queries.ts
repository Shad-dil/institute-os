import { prisma } from "@/lib/prisma";
import type {
  StudentRow,
  StudentProfile,
  StudentAttendanceRecord,
  StudentInvoiceSummary,
  StudentTestResultSummary,
} from "@/types/students";
import type { FeeStatus } from "@/types/fees";

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

function effectiveStatus(status: FeeStatus, dueDate: Date): FeeStatus {
  if (status === "PENDING" && dueDate.getTime() < Date.now()) return "OVERDUE";
  return status;
}

/** Worst-status-wins across a student's invoices — a student with even
 *  one overdue invoice should show as overdue at a glance, not "mostly
 *  paid". */
function worstStatus(statuses: FeeStatus[]): FeeStatus | "NO_INVOICE" {
  if (statuses.length === 0) return "NO_INVOICE";
  const priority: FeeStatus[] = ["OVERDUE", "PARTIAL", "PENDING", "PAID"];
  for (const s of priority) {
    if (statuses.includes(s)) return s;
  }
  return statuses[0];
}

export async function getStudents(instituteId: string): Promise<StudentRow[]> {
  const students = await prisma.student.findMany({
    where: { instituteId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      phone: true,
      joinedAt: true,
      course: { select: { name: true } },
      attendance: { select: { status: true } },
      invoices: {
        select: { status: true, dueDate: true, amount: true, amountPaid: true },
      },
    },
  });

  return students.map((s) => {
    const totalMarks = s.attendance.length;
    const presentMarks = s.attendance.filter(
      (a) => a.status === "PRESENT" || a.status === "LATE",
    ).length;
    const attendancePct =
      totalMarks > 0 ? Math.round((presentMarks / totalMarks) * 100) : null;

    const statuses = s.invoices.map((inv) =>
      effectiveStatus(inv.status as FeeStatus, inv.dueDate),
    );
    const balanceDue = s.invoices.reduce(
      (sum, inv) => sum + (toNumber(inv.amount) - toNumber(inv.amountPaid)),
      0,
    );

    return {
      id: s.id,
      name: s.name,
      avatarInitials: initials(s.name),
      course: s.course.name,
      phone: s.phone,
      attendancePct,
      feeStatus: worstStatus(statuses),
      balanceDue,
      joinedAt: s.joinedAt.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
  });
}

export async function getStudentProfile(
  studentId: string,
): Promise<StudentProfile | null> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      parentName: true,
      parentPhone: true,
      joinedAt: true,
      course: { select: { name: true, duration: true } },
      attendance: {
        select: { date: true, status: true },
        orderBy: { date: "desc" },
        take: 30,
      },
      invoices: {
        select: {
          id: true,
          amount: true,
          amountPaid: true,
          dueDate: true,
          status: true,
        },
        orderBy: { dueDate: "asc" },
      },
      testResults: {
        select: {
          marksObtained: true,
          test: {
            select: { id: true, name: true, testDate: true, maxMarks: true },
          },
        },
        orderBy: { test: { testDate: "desc" } },
      },
      note: {
        select: { id: true, content: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!student) return null;

  const totalMarks = student.attendance.length;
  const presentMarks = student.attendance.filter(
    (a) => a.status === "PRESENT" || a.status === "LATE",
  ).length;
  const attendancePct =
    totalMarks > 0 ? Math.round((presentMarks / totalMarks) * 100) : null;

  const attendanceRecords: StudentAttendanceRecord[] = student.attendance.map(
    (a) => ({
      date: a.date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
      status: a.status as StudentAttendanceRecord["status"],
    }),
  );

  const invoices: StudentInvoiceSummary[] = student.invoices.map((inv) => {
    const totalAmount = toNumber(inv.amount);
    const amountPaid = toNumber(inv.amountPaid);
    return {
      id: inv.id,
      totalAmount,
      amountPaid,
      balanceDue: totalAmount - amountPaid,
      dueDate: inv.dueDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      status: effectiveStatus(inv.status as FeeStatus, inv.dueDate),
    };
  });

  // For ranking we'd need every other student's marks for the same test,
  // which is a heavier query — the Tests page already computes rank
  // properly. Here we surface score/percentage only, with a link out to
  // the full ranked test if the person wants the rank.
  const testResults: StudentTestResultSummary[] = student.testResults.map(
    (tr) => {
      const maxMarks = toNumber(tr.test.maxMarks);
      const marksObtained = toNumber(tr.marksObtained);
      return {
        testId: tr.test.id,
        testName: tr.test.name,
        testDate: tr.test.testDate.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        marksObtained,
        maxMarks,
        percentage:
          maxMarks > 0 ? Math.round((marksObtained / maxMarks) * 1000) / 10 : 0,
        rank: null,
      };
    },
  );

  return {
    id: student.id,
    name: student.name,
    avatarInitials: initials(student.name),
    email: student.email,
    phone: student.phone,
    parentName: student.parentName,
    parentPhone: student.parentPhone,
    course: student.course.name,
    courseDuration: student.course.duration,
    joinedAt: student.joinedAt.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    attendancePct,
    attendanceRecords,
    invoices,
    testResults,
    notes: student.note.map((n) => ({
      id: n.id,
      content: n.content,
      createdAt: n.createdAt.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    })),
  };
}
