import { prisma } from "@/lib/prisma";
import type {
  InquiryRow,
  InquiryDetail,
  InquiryFunnelStats,
  InquiryStatus,
  InquirySource,
} from "@/types/inquiries";

function formatDate(date: Date | null): string | null {
  if (!date) return null;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function getInquiries(instituteId: string): Promise<InquiryRow[]> {
  const inquiries = await prisma.inquiry.findMany({
    where: { instituteId },
    orderBy: [{ nextFollowUpAt: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      phone: true,
      source: true,
      status: true,
      referredByName: true,
      nextFollowUpAt: true,
      createdAt: true,
      course: { select: { name: true } },
    },
  });

  const now = Date.now();

  return inquiries.map((i) => ({
    id: i.id,
    name: i.name,
    phone: i.phone,
    courseName: i.course?.name ?? null,
    source: i.source as InquirySource,
    status: i.status as InquiryStatus,
    referredByName: i.referredByName,
    nextFollowUpAt: formatDate(i.nextFollowUpAt),
    isFollowUpOverdue:
      i.nextFollowUpAt !== null &&
      i.nextFollowUpAt.getTime() < now &&
      i.status !== "CONVERTED" &&
      i.status !== "LOST",
    createdAt: formatDate(i.createdAt) ?? "",
  }));
}

export async function getFunnelStats(
  instituteId: string,
): Promise<InquiryFunnelStats> {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [thisMonth, allOpen, sourceGroups] = await Promise.all([
    prisma.inquiry.findMany({
      where: { instituteId, createdAt: { gte: monthStart } },
      select: { status: true },
    }),
    prisma.inquiry.count({
      where: { instituteId, status: { notIn: ["CONVERTED", "LOST"] } },
    }),
    prisma.inquiry.groupBy({
      by: ["source"],
      where: { instituteId, createdAt: { gte: monthStart } },
      _count: { source: true },
    }),
  ]);

  const totalThisMonth = thisMonth.length;
  const convertedThisMonth = thisMonth.filter(
    (i) => i.status === "CONVERTED",
  ).length;
  const lostThisMonth = thisMonth.filter((i) => i.status === "LOST").length;
  // Conversion rate is measured against *resolved* leads (converted + lost),
  // not total inquiries — a lead still sitting in "New" hasn't failed to
  // convert, it just hasn't been decided yet. Dividing by total would make
  // the rate look artificially low early in the month.
  const resolved = convertedThisMonth + lostThisMonth;

  return {
    totalThisMonth,
    convertedThisMonth,
    lostThisMonth,
    openCount: allOpen,
    conversionRatePct:
      resolved > 0 ? Math.round((convertedThisMonth / resolved) * 100) : 0,
    bySource: sourceGroups.map((g) => ({
      source: g.source as InquirySource,
      count: g._count.source,
    })),
  };
}

export async function getInquiryDetail(
  inquiryId: string,
  instituteId: string,
): Promise<InquiryDetail | null> {
  const inquiry = await prisma.inquiry.findFirst({
    where: { id: inquiryId, instituteId },
    select: {
      id: true,
      name: true,
      phone: true,
      courseId: true,
      source: true,
      status: true,
      referredByName: true,
      nextFollowUpAt: true,
      convertedStudentId: true,
      course: { select: { name: true } },
      followUps: {
        orderBy: { createdAt: "desc" },
        select: { id: true, note: true, createdAt: true },
      },
    },
  });

  if (!inquiry) return null;

  return {
    id: inquiry.id,
    name: inquiry.name,
    phone: inquiry.phone,
    courseId: inquiry.courseId,
    courseName: inquiry.course?.name ?? null,
    source: inquiry.source as InquirySource,
    status: inquiry.status as InquiryStatus,
    referredByName: inquiry.referredByName,
    nextFollowUpAt: inquiry.nextFollowUpAt
      ? inquiry.nextFollowUpAt.toISOString().split("T")[0]
      : "",
    convertedStudentId: inquiry.convertedStudentId,
    followUps: inquiry.followUps.map((f) => ({
      id: f.id,
      note: f.note,
      createdAt: formatDate(f.createdAt) ?? "",
    })),
  };
}
