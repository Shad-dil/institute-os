export interface BatchOption {
  id: string;
  name: string;
  schedule: string;
}

export interface CourseFeeOption {
  id: string;
  name: string;
  fees: number;
  duration: string;
  batches: BatchOption[];
}

export interface AdmissionFormValues {
  name: string;
  email: string;
  phone: string;
  photo?: File | null;
  photoUrl?: string;
  parentName: string;
  parentPhone: string;
  courseId: string;
  batchId: string; // "" means unassigned — valid, not every course has batches yet
  feeAmount: number;
  dueDate: string;
  advanceAmount: number;
  advanceMethod: "CASH" | "UPI" | "CARD" | "BANK_TRANSFER" | "OTHER";
  inquiryId?: string;
}

export const ADMISSION_STEPS = [
  "Student",
  "Guardian",
  "Course & Fees",
  "Review",
] as const;
export type AdmissionStep = (typeof ADMISSION_STEPS)[number];
