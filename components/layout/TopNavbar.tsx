"use client";

import { Bell, Menu, Plus, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { usePathname } from "next/navigation";
import { LogoutButton } from "../auth/logout-button";
// import { NotificationBell } from "../notifications/notification-bell";

interface TopNavbarProps {
  onOpenSidebar: () => void;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/students": "Students",
  "/dashboard/admissions": "Admissions",
  "/dashboard/attendance": "Attendance",
  "/dashboard/billing": "Fees",
  "/dashboard/teachers": "Teachers",
  "/dashboard/courses": "Courses",
  "/dashboard/reports": "Reports",
  "/dashboard/settings": "Settings",
};

export default function TopNavbar({ onOpenSidebar }: TopNavbarProps) {
  const pathname = usePathname();

  const title = pageTitles[pathname] ?? "Dashboard";

  return (
    <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        {/* LEFT */}

        <div className="flex items-center gap-3">
          {/* Mobile menu */}

          <Button
            size="icon"
            variant="ghost"
            className="lg:hidden"
            onClick={onOpenSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div>
            <h1 className="text-xl font-bold">{title}</h1>

            <p className="hidden text-sm text-slate-500 md:block">
              Welcome back 👋
            </p>
          </div>
        </div>

        {/* CENTER */}

        {/* RIGHT */}

        <div className="flex items-center gap-2">
          {/* Mobile Search */}

          {/* Quick Add */}
          {/* <NotificationBell /> */}

          <LogoutButton />

          {/* Mobile Add */}

          {/* Notification */}

          {/* Profile */}

          <button className="flex items-center gap-2 rounded-xl p-2 hover:bg-slate-100">
            <Avatar className="h-9 w-9">
              <AvatarFallback>OS</AvatarFallback>
            </Avatar>
          </button>
        </div>
      </div>
    </header>
  );
}
