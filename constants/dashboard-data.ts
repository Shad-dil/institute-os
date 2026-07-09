import { Wallet, UserPlus, ClipboardCheck, Award, UserCog } from "lucide-react";
import type {
  StatCardData,
  RevenuePoint,
  AdmissionsPoint,
  AttendancePoint,
  CourseDistributionSlice,
  ActivityItem,
  UpcomingFeeDue,
  UpcomingBatch,
  Announcement,
  QuickAction,
} from "@/types/dashboard";

export const STAT_CARDS: StatCardData[] = [
  {
    id: "total-students",
    label: "Total Students",
    value: "350",
    change: 8.2,
    direction: "up",
    icon: "students",
    accent: "blue",
    sparkline: [28, 32, 30, 34, 38, 36, 40],
  },
  {
    id: "todays-attendance",
    label: "Today's Attendance",
    value: "91%",
    change: 2.4,
    direction: "up",
    icon: "attendance",
    accent: "green",
    sparkline: [86, 88, 87, 89, 90, 89, 91],
  },
  {
    id: "pending-fees",
    label: "Pending Fees",
    value: "₹1,18,500",
    change: 5.1,
    direction: "down",
    icon: "pendingFees",
    accent: "amber",
    sparkline: [140, 135, 128, 130, 122, 120, 118],
  },
  {
    id: "monthly-revenue",
    label: "Monthly Revenue",
    value: "₹4,25,000",
    change: 12.6,
    direction: "up",
    icon: "revenue",
    accent: "violet",
    sparkline: [32, 34, 33, 36, 38, 40, 42],
  },
  {
    id: "new-admissions",
    label: "New Admissions",
    value: "24",
    change: 4.3,
    direction: "up",
    icon: "admissions",
    accent: "red",
    sparkline: [14, 16, 15, 18, 20, 22, 24],
  },
];

export const REVENUE_TREND: RevenuePoint[] = [
  { month: "Jan", revenue: 312000, target: 300000 },
  { month: "Feb", revenue: 328000, target: 310000 },
  { month: "Mar", revenue: 345000, target: 320000 },
  { month: "Apr", revenue: 337000, target: 330000 },
  { month: "May", revenue: 361000, target: 340000 },
  { month: "Jun", revenue: 389000, target: 350000 },
  { month: "Jul", revenue: 425000, target: 360000 },
];

export const ADMISSIONS_TREND: AdmissionsPoint[] = [
  { month: "Jan", admissions: 18 },
  { month: "Feb", admissions: 22 },
  { month: "Mar", admissions: 19 },
  { month: "Apr", admissions: 26 },
  { month: "May", admissions: 21 },
  { month: "Jun", admissions: 28 },
  { month: "Jul", admissions: 24 },
];

export const ATTENDANCE_WEEK: AttendancePoint[] = [
  { day: "Mon", present: 312, absent: 38 },
  { day: "Tue", present: 320, absent: 30 },
  { day: "Wed", present: 305, absent: 45 },
  { day: "Thu", present: 318, absent: 32 },
  { day: "Fri", present: 322, absent: 28 },
  { day: "Sat", present: 300, absent: 50 },
];

export const COURSE_DISTRIBUTION: CourseDistributionSlice[] = [
  { name: "Web Development", value: 96, color: "#2563EB" },
  { name: "Spoken English", value: 74, color: "#22C55E" },
  { name: "Tally & Accounts", value: 58, color: "#F59E0B" },
  { name: "Python & Data", value: 64, color: "#8B5CF6" },
  { name: "Office Automation", value: 58, color: "#EF4444" },
];

export const RECENT_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    type: "admission",
    title: "Ananya Sharma",
    subtitle: "Enrolled in Web Development — Batch B3",
    timestamp: "10 min ago",
    avatarInitials: "AS",
  },
  {
    id: "act-2",
    type: "payment",
    title: "Rohit Verma",
    subtitle: "Paid pending fee installment",
    timestamp: "42 min ago",
    amount: "₹6,500",
    avatarInitials: "RV",
  },
  {
    id: "act-3",
    type: "attendance",
    title: "Batch A2 — Spoken English",
    subtitle: "Attendance marked by Priya Nair",
    timestamp: "1 hr ago",
    avatarInitials: "PN",
  },
  {
    id: "act-4",
    type: "admission",
    title: "Karan Mehta",
    subtitle: "Enrolled in Python & Data — Batch C1",
    timestamp: "2 hr ago",
    avatarInitials: "KM",
  },
  {
    id: "act-5",
    type: "payment",
    title: "Sneha Patil",
    subtitle: "Partial payment received",
    timestamp: "3 hr ago",
    amount: "₹3,000",
    avatarInitials: "SP",
  },
  {
    id: "act-6",
    type: "attendance",
    title: "Batch D1 — Tally & Accounts",
    subtitle: "Attendance marked by Suresh Iyer",
    timestamp: "4 hr ago",
    avatarInitials: "SI",
  },
];

export const UPCOMING_FEE_DUES: UpcomingFeeDue[] = [
  {
    id: "due-1",
    studentName: "Aditya Kulkarni",
    course: "Web Development",
    amount: "₹4,500",
    dueDate: "Tomorrow",
    avatarInitials: "AK",
  },
  {
    id: "due-2",
    studentName: "Neha Joshi",
    course: "Spoken English",
    amount: "₹2,800",
    dueDate: "9 Jul 2026",
    avatarInitials: "NJ",
  },
  {
    id: "due-3",
    studentName: "Vikram Singh",
    course: "Tally & Accounts",
    amount: "₹3,200",
    dueDate: "11 Jul 2026",
    avatarInitials: "VS",
  },
  {
    id: "due-4",
    studentName: "Pooja Reddy",
    course: "Python & Data",
    amount: "₹5,000",
    dueDate: "12 Jul 2026",
    avatarInitials: "PR",
  },
];

export const UPCOMING_BATCHES: UpcomingBatch[] = [
  {
    id: "batch-1",
    batchName: "Batch B3",
    course: "Web Development",
    time: "Today, 4:00 PM",
    faculty: "Amit Deshmukh",
    seatsLeft: 4,
  },
  {
    id: "batch-2",
    batchName: "Batch A2",
    course: "Spoken English",
    time: "Today, 6:00 PM",
    faculty: "Priya Nair",
    seatsLeft: 2,
  },
  {
    id: "batch-3",
    batchName: "Batch C1",
    course: "Python & Data",
    time: "Tomorrow, 10:00 AM",
    faculty: "Suresh Iyer",
    seatsLeft: 6,
  },
];

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-1",
    title: "Mid-term exams from 15 Jul",
    description: "Schedule shared with all batch coordinators.",
    postedAt: "Today",
    tag: "urgent",
  },
  {
    id: "ann-2",
    title: "New batch: Advanced Excel",
    description: "Admissions open from 10 Jul, limited seats.",
    postedAt: "Yesterday",
    tag: "event",
  },
  {
    id: "ann-3",
    title: "Fee receipt format updated",
    description: "GST details now included automatically.",
    postedAt: "2 days ago",
    tag: "info",
  },
];

export const QUICK_ACTIONS: QuickAction[] = [
  { id: "qa-1", label: "Add Student", icon: UserPlus, href: "/students/new" },
  { id: "qa-2", label: "Collect Fee", icon: Wallet, href: "/fees/collect" },
  { id: "qa-3", label: "Take Attendance", icon: ClipboardCheck, href: "/attendance" },
  { id: "qa-4", label: "Generate Certificate", icon: Award, href: "/certificates/new" },
  { id: "qa-5", label: "Add Teacher", icon: UserCog, href: "/teachers/new" },
];
