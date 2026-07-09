export type DeltaTone = "positive" | "negative" | "neutral";

export type StatIconName = "students" | "attendance" | "pendingFees" | "revenue" | "admissions";

export interface StatCardData {
  id: string;
  label: string;
  value: string;
  // Plain-language change instead of a percentage — e.g. "5 new this
  // month", "Same as yesterday", "+₹5,500 vs last month". Tier-3-city
  // institute owners read "5 more students" instantly; "+100%" from a
  // base of near-zero students just confuses.
  deltaText: string;
  deltaTone: DeltaTone;
  icon: StatIconName;
  accent: "blue" | "green" | "amber" | "red" | "violet";
}

export interface RevenuePoint {
  month: string;
  revenue: number;
}

export interface AdmissionsPoint {
  month: string;
  admissions: number;
}

export interface AttendancePoint {
  day: string;
  present: number;
  absent: number;
}

export interface CourseDistributionSlice {
  name: string;
  value: number;
  color: string;
}

export type ActivityType = "admission" | "payment" | "attendance";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  timestamp: string;
  amount?: string;
  avatarInitials: string;
}

export interface UpcomingFeeDue {
  id: string;
  studentName: string;
  course: string;
  amount: string;
  dueDate: string;
  avatarInitials: string;
}

export interface UpcomingBatch {
  id: string;
  batchName: string;
  course: string;
  time: string;
  faculty: string;
  seatsLeft: number;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  postedAt: string;
  tag: "info" | "urgent" | "event";
}

export interface QuickAction {
  id: string;
  label: string;
  href: string;
}
