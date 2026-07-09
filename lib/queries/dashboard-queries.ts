import { prisma } from "@/lib/prisma";
import type {
  StatCardData,
  RevenuePoint,
  AdmissionsPoint,
  AttendancePoint,
  CourseDistributionSlice,
  ActivityItem,
  UpcomingFeeDue,
  DeltaTone,
} from "@/types/dashboard";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const COURSE_COLORS = ["#2563EB", "#22C55E", "#F59E0B", "#8B5CF6", "#EF4444", "#0EA5E9"];

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

function monthRange(monthsAgo: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 1);
  return { start, end };
}

function dayRange(daysAgo: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

/** Plain-language count delta, e.g. "5 new this month" / "Same as last
 *  month" / "3 fewer than last month". `higherIsGood` flips the tone —
 *  more pending fees is bad, more admissions is good. */
function countDelta(
  current: number,
  previous: number,
  unitPlural: string,
  higherIsGood = true
): { deltaText: string; deltaTone: DeltaTone } {
  const diff = current - previous;
  if (diff === 0) return { deltaText: "Same as last month", deltaTone: "neutral" };
  if (previous === 0) {
    return { deltaText: `${current} new this month`, deltaTone: higherIsGood ? "positive" : "neutral" };
  }
  const isGood = higherIsGood ? diff > 0 : diff < 0;
  const word = diff > 0 ? "more" : "fewer";
  return {
    deltaText: `${Math.abs(diff)} ${word} ${unitPlural} than last month`,
    deltaTone: isGood ? "positive" : "negative",
  };
}

function rupeeDelta(current: number, previous: number): { deltaText: string; deltaTone: DeltaTone } {
  const diff = current - previous;
  if (previous === 0 && current === 0) return { deltaText: "No collections yet", deltaTone: "neutral" };
  if (previous === 0) return { deltaText: "First month of collection", deltaTone: "positive" };
  if (diff === 0) return { deltaText: "Same as last month", deltaTone: "neutral" };
  const sign = diff > 0 ? "+" : "-";
  return {
    deltaText: `${sign}₹${Math.abs(diff).toLocaleString("en-IN")} vs last month`,
    deltaTone: diff > 0 ? "positive" : "negative",
  };
}

// ---------------------------------------------------------------------------
// Stat cards
// ---------------------------------------------------------------------------

export async function getStatCards(instituteId: string): Promise<StatCardData[]> {
  const { start: thisMonthStart } = monthRange(0);
  const { start: lastMonthStart, end: lastMonthEnd } = monthRange(1);
  const { start: todayStart, end: todayEnd } = dayRange(0);
  const { start: yesterdayStart, end: yesterdayEnd } = dayRange(1);

  const [
    totalStudents,
    todayAttendance,
    yesterdayAttendance,
    pendingAgg,
    studentsWithPendingCount,
    revenueThisMonthAgg,
    revenueLastMonthAgg,
    admissionsThisMonth,
    admissionsLastMonth,
  ] = await Promise.all([
    prisma.student.count({ where: { instituteId } }),
    prisma.attendance.findMany({
      where: { date: { gte: todayStart, lt: todayEnd }, student: { instituteId } },
      select: { status: true },
    }),
    prisma.attendance.findMany({
      where: { date: { gte: yesterdayStart, lt: yesterdayEnd }, student: { instituteId } },
      select: { status: true },
    }),
    prisma.invoice.aggregate({
      where: { status: { in: ["PENDING", "OVERDUE"] }, student: { instituteId } },
      _sum: { amount: true },
    }),
    prisma.student.count({
      where: { instituteId, invoices: { some: { status: { in: ["PENDING", "OVERDUE"] } } } },
    }),
    prisma.invoice.aggregate({
      where: { status: "PAID", paidAt: { gte: thisMonthStart }, student: { instituteId } },
      _sum: { amount: true },
    }),
    prisma.invoice.aggregate({
      where: { status: "PAID", paidAt: { gte: lastMonthStart, lt: lastMonthEnd }, student: { instituteId } },
      _sum: { amount: true },
    }),
    prisma.student.count({ where: { instituteId, joinedAt: { gte: thisMonthStart } } }),
    prisma.student.count({ where: { instituteId, joinedAt: { gte: lastMonthStart, lt: lastMonthEnd } } }),
  ]);

  const attendancePct = (records: { status: string }[]) => {
    if (records.length === 0) return 0;
    const present = records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
    return Math.round((present / records.length) * 100);
  };

  const todayPct = attendancePct(todayAttendance);
  const yesterdayPct = attendancePct(yesterdayAttendance);
  const attendancePointDiff = todayPct - yesterdayPct;

  let attendanceDelta: { deltaText: string; deltaTone: DeltaTone };
  if (todayAttendance.length === 0) {
    attendanceDelta = { deltaText: "Not marked yet today", deltaTone: "neutral" };
  } else if (attendancePointDiff === 0) {
    attendanceDelta = { deltaText: "Same as yesterday", deltaTone: "neutral" };
  } else {
    attendanceDelta = {
      deltaText: `${Math.abs(attendancePointDiff)}% ${attendancePointDiff > 0 ? "better" : "lower"} than yesterday`,
      deltaTone: attendancePointDiff > 0 ? "positive" : "negative",
    };
  }

  const pendingAmount = toNumber(pendingAgg._sum.amount);
  const pendingDelta: { deltaText: string; deltaTone: DeltaTone } =
    pendingAmount === 0
      ? { deltaText: "All fees collected", deltaTone: "positive" }
      : {
          deltaText: `${studentsWithPendingCount} student${studentsWithPendingCount === 1 ? "" : "s"} pending`,
          deltaTone: "neutral",
        };

  const revenueThisMonth = toNumber(revenueThisMonthAgg._sum.amount);
  const revenueLastMonth = toNumber(revenueLastMonthAgg._sum.amount);

  return [
    {
      id: "total-students",
      label: "Total Students",
      value: totalStudents.toLocaleString("en-IN"),
      deltaText:
        admissionsThisMonth > 0
          ? `${admissionsThisMonth} new this month`
          : "No new admissions this month",
      deltaTone: admissionsThisMonth > 0 ? "positive" : "neutral",
      icon: "students",
      accent: "blue",
    },
    {
      id: "todays-attendance",
      label: "Today's Attendance",
      value: todayAttendance.length === 0 ? "—" : `${todayPct}%`,
      deltaText: attendanceDelta.deltaText,
      deltaTone: attendanceDelta.deltaTone,
      icon: "attendance",
      accent: "green",
    },
    {
      id: "pending-fees",
      label: "Pending Fees",
      value: `₹${pendingAmount.toLocaleString("en-IN")}`,
      deltaText: pendingDelta.deltaText,
      deltaTone: pendingDelta.deltaTone,
      icon: "pendingFees",
      accent: "amber",
    },
    {
      id: "monthly-revenue",
      label: "Monthly Collection",
      value: `₹${revenueThisMonth.toLocaleString("en-IN")}`,
      ...rupeeDelta(revenueThisMonth, revenueLastMonth),
      icon: "revenue",
      accent: "violet",
    },
    {
      id: "new-admissions",
      label: "New Admissions",
      value: admissionsThisMonth.toLocaleString("en-IN"),
      ...countDelta(admissionsThisMonth, admissionsLastMonth, "admissions"),
      icon: "admissions",
      accent: "red",
    },
  ];
}

// ---------------------------------------------------------------------------
// Monthly collection — last N months, PAID invoices grouped by month
// ---------------------------------------------------------------------------

export async function getRevenueTrend(instituteId: string, months = 6): Promise<RevenuePoint[]> {
  const points: RevenuePoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const { start, end } = monthRange(i);
    const agg = await prisma.invoice.aggregate({
      where: { status: "PAID", paidAt: { gte: start, lt: end }, student: { instituteId } },
      _sum: { amount: true },
    });
    points.push({ month: MONTH_LABELS[start.getMonth()], revenue: toNumber(agg._sum.amount) });
  }

  return points;
}

// ---------------------------------------------------------------------------
// Admissions trend
// ---------------------------------------------------------------------------

export async function getAdmissionsTrend(instituteId: string, months = 6): Promise<AdmissionsPoint[]> {
  const points: AdmissionsPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const { start, end } = monthRange(i);
    const count = await prisma.student.count({
      where: { instituteId, joinedAt: { gte: start, lt: end } },
    });
    points.push({ month: MONTH_LABELS[start.getMonth()], admissions: count });
  }

  return points;
}

// ---------------------------------------------------------------------------
// Attendance for the last 6 days
// ---------------------------------------------------------------------------

export async function getAttendanceWeek(instituteId: string, days = 6): Promise<AttendancePoint[]> {
  const points: AttendancePoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const { start, end } = dayRange(i);
    const records = await prisma.attendance.findMany({
      where: { date: { gte: start, lt: end }, student: { instituteId } },
      select: { status: true },
    });
    const present = records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
    const absent = records.filter((r) => r.status === "ABSENT").length;
    points.push({ day: DAY_LABELS[start.getDay()], present, absent });
  }

  return points;
}

// ---------------------------------------------------------------------------
// Course distribution — student count per course
// ---------------------------------------------------------------------------

export async function getCourseDistribution(instituteId: string): Promise<CourseDistributionSlice[]> {
  const courses = await prisma.course.findMany({
    where: { instituteId },
    select: { name: true, _count: { select: { students: true } } },
    orderBy: { students: { _count: "desc" } },
  });

  return courses
    .filter((c) => c._count.students > 0)
    .map((c, index) => ({
      name: c.name,
      value: c._count.students,
      color: COURSE_COLORS[index % COURSE_COLORS.length],
    }));
}

// ---------------------------------------------------------------------------
// Recent activity — merges recent admissions, payments, attendance marks
// ---------------------------------------------------------------------------

export async function getRecentActivity(instituteId: string, limit = 8): Promise<ActivityItem[]> {
  const [recentStudents, recentPayments, recentAttendance] = await Promise.all([
    prisma.student.findMany({
      where: { instituteId },
      orderBy: { joinedAt: "desc" },
      take: limit,
      select: { id: true, name: true, joinedAt: true, course: { select: { name: true } } },
    }),
    prisma.invoice.findMany({
      where: { status: "PAID", paidAt: { not: null }, student: { instituteId } },
      orderBy: { paidAt: "desc" },
      take: limit,
      select: { id: true, amount: true, paidAt: true, student: { select: { name: true } } },
    }),
    prisma.attendance.findMany({
      where: { student: { instituteId } },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, status: true, createdAt: true, student: { select: { name: true } } },
    }),
  ]);

  const items: (ActivityItem & { sortKey: string })[] = [
    ...recentStudents.map((s) => ({
      id: `admission-${s.id}`,
      type: "admission" as const,
      title: s.name,
      subtitle: `Enrolled in ${s.course.name}`,
      timestamp: s.joinedAt.toISOString(),
      sortKey: s.joinedAt.toISOString(),
      avatarInitials: initials(s.name),
    })),
    ...recentPayments.map((p) => ({
      id: `payment-${p.id}`,
      type: "payment" as const,
      title: p.student.name,
      subtitle: "Paid fee installment",
      timestamp: (p.paidAt ?? new Date()).toISOString(),
      sortKey: (p.paidAt ?? new Date()).toISOString(),
      amount: `₹${toNumber(p.amount).toLocaleString("en-IN")}`,
      avatarInitials: initials(p.student.name),
    })),
    ...recentAttendance.map((a) => ({
      id: `attendance-${a.id}`,
      type: "attendance" as const,
      title: a.student.name,
      subtitle: `Marked ${a.status.charAt(0)}${a.status.slice(1).toLowerCase()}`,
      timestamp: a.createdAt.toISOString(),
      sortKey: a.createdAt.toISOString(),
      avatarInitials: initials(a.student.name),
    })),
  ];

  return items
    .sort((a, b) => new Date(b.sortKey).getTime() - new Date(a.sortKey).getTime())
    .slice(0, limit)
    .map(({ sortKey: _sortKey, ...item }) => ({ ...item, timestamp: formatRelativeTime(item.timestamp) }));
}

function formatRelativeTime(isoTimestamp: string): string {
  const diffMs = Date.now() - new Date(isoTimestamp).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ---------------------------------------------------------------------------
// Upcoming fee dues
// ---------------------------------------------------------------------------

export async function getUpcomingFeeDues(instituteId: string, limit = 5): Promise<UpcomingFeeDue[]> {
  const invoices = await prisma.invoice.findMany({
    where: { status: { in: ["PENDING", "OVERDUE"] }, student: { instituteId } },
    orderBy: { dueDate: "asc" },
    take: limit,
    select: {
      id: true,
      amount: true,
      dueDate: true,
      student: { select: { name: true, course: { select: { name: true } } } },
    },
  });

  return invoices.map((inv) => ({
    id: inv.id,
    studentName: inv.student.name,
    course: inv.student.course.name,
    amount: `₹${toNumber(inv.amount).toLocaleString("en-IN")}`,
    dueDate: inv.dueDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    avatarInitials: initials(inv.student.name),
  }));
}
