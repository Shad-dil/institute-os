import type { FeeStatus } from "@/types/fees";

export interface StudentRow {
  id: string;
  name: string;
  avatarInitials: string;
  course: string;
  phone: string;
  attendancePct: number | null;
  feeStatus: FeeStatus | "NO_INVOICE";
  balanceDue: number;
  joinedAt: string;
}

export interface StudentAttendanceRecord {
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE";
}

export interface StudentInvoiceSummary {
  id: string;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  dueDate: string;
  status: FeeStatus;
}

export interface StudentTestResultSummary {
  testId: string;
  testName: string;
  testDate: string;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  rank: number | null;
}

export interface StudentNote {
  id: string;
  content: string;
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  avatarInitials: string;
  email: string | null;
  phone: string;
  photoUrl: string | null;
  parentName: string | null;
  parentPhone: string | null;
  course: string;
  courseDuration: string;
  joinedAt: string;
  attendancePct: number | null;
  attendanceRecords: StudentAttendanceRecord[];
  invoices: StudentInvoiceSummary[];
  testResults: StudentTestResultSummary[];
  notes: StudentNote[];
}
