export type FeeStatus = "PAID" | "PARTIAL" | "PENDING" | "OVERDUE";
export type PaymentMethod = "CASH" | "UPI" | "CARD" | "BANK_TRANSFER" | "OTHER";

export interface FeeOverview {
  collectedThisMonth: number;
  pendingAmount: number;
  overdueAmount: number;
  overdueCount: number;
}

export interface InvoiceRow {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  course: string;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  dueDate: string; // formatted, display-ready
  status: FeeStatus;
  avatarInitials: string;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string; // formatted, display-ready
}
