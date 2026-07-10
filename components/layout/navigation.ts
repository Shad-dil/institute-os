import {
  LayoutDashboard,
  Users,
  UserPlus,
  CalendarCheck,
  Wallet,
  GraduationCap,
  BookOpen,
  FileBarChart,
  Settings,
  Notebook,
} from "lucide-react";

export const navigation = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Students",
    href: "/dashboard/students",
    icon: Users,
  },
  {
    title: "Admissions",
    href: "/dashboard/admissions",
    icon: UserPlus,
  },
  {
    title: "Attendance",
    href: "/dashboard/attendance",
    icon: CalendarCheck,
  },
  {
    title: "Fees",
    href: "/dashboard/billing",
    icon: Wallet,
  },
  {
    title: "Courses",
    href: "/dashboard/courses",
    icon: Notebook,
  },
  {
    title: "Tests",
    href: "/dashboard/tests",
    icon: BookOpen,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileBarChart,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];
