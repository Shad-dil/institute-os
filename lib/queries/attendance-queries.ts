import { prisma } from "@/lib/prisma";
import type { AttendanceBoardData, AttendanceStudentRow, AttendanceStatus } from "@/types/attendance";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function normalizeDate(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export async function getAttendanceBoard(
  courseId: string,
  date: Date,
  batchId?: string
): Promise<AttendanceBoardData> {
  const day = normalizeDate(date);
  const monthStart = new Date(day.getFullYear(), day.getMonth(), 1);
  const rangeEnd = new Date(day);
  rangeEnd.setDate(rangeEnd.getDate() + 1);

  const students = await prisma.student.findMany({
    // batchId, when set, narrows the roster to just that batch. Left
    // unset (or "all"), it falls back to every student in the course —
    // which also covers students admitted before batches existed and
    // never got assigned one.
    where: batchId ? { batchId } : { courseId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      phone: true,
      parentPhone: true,
      attendance: {
        where: { date: { gte: monthStart, lt: rangeEnd } },
        select: { date: true, status: true },
      },
    },
  });

  const rows: AttendanceStudentRow[] = students.map((s) => {
    const todayRecord = s.attendance.find((a) => a.date.getTime() === day.getTime());
    const monthRecords = s.attendance;
    const presentCount = monthRecords.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
    const monthAttendancePct =
      monthRecords.length > 0 ? Math.round((presentCount / monthRecords.length) * 100) : null;

    return {
      studentId: s.id,
      studentName: s.name,
      avatarInitials: initials(s.name),
      studentPhone: s.phone,
      parentPhone: s.parentPhone,
      status: (todayRecord?.status as AttendanceStatus) ?? null,
      monthAttendancePct,
    };
  });

  const summary = {
    present: rows.filter((r) => r.status === "PRESENT").length,
    absent: rows.filter((r) => r.status === "ABSENT").length,
    late: rows.filter((r) => r.status === "LATE").length,
    notMarked: rows.filter((r) => r.status === null).length,
    total: rows.length,
  };

  return { students: rows, summary };
}
