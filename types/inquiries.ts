export type InquiryStatus = "NEW" | "CONTACTED" | "INTERESTED" | "NOT_INTERESTED" | "CONVERTED" | "LOST";
export type InquirySource = "WALK_IN" | "PHONE_CALL" | "WHATSAPP" | "REFERRAL" | "SOCIAL_MEDIA" | "OTHER";

export interface InquiryRow {
  id: string;
  name: string;
  phone: string;
  courseName: string | null;
  source: InquirySource;
  status: InquiryStatus;
  referredByName: string | null;
  nextFollowUpAt: string | null;
  isFollowUpOverdue: boolean;
  createdAt: string;
}

export interface InquiryFollowUpEntry {
  id: string;
  note: string;
  createdAt: string;
}

export interface InquiryDetail {
  id: string;
  name: string;
  phone: string;
  courseId: string | null;
  courseName: string | null;
  source: InquirySource;
  status: InquiryStatus;
  referredByName: string | null;
  nextFollowUpAt: string; // "" if unset, else yyyy-mm-dd for date input
  convertedStudentId: string | null;
  followUps: InquiryFollowUpEntry[];
}

export interface SourceBreakdown {
  source: InquirySource;
  count: number;
}

export interface InquiryFunnelStats {
  totalThisMonth: number;
  convertedThisMonth: number;
  lostThisMonth: number;
  openCount: number; // not yet converted or lost
  conversionRatePct: number;
  bySource: SourceBreakdown[];
}
