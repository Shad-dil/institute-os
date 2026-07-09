export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

export interface AttendanceStudentRow {
  studentId: string;
  studentName: string;
  avatarInitials: string;
  studentPhone: string;
  parentPhone: string | null;
  status: AttendanceStatus | null;
  monthAttendancePct: number | null;
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  notMarked: number;
  total: number;
}

export interface AttendanceBoardData {
  students: AttendanceStudentRow[];
  summary: AttendanceSummary;
}
