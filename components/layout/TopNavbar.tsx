"use client";

import { Bell, Menu, Plus, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { usePathname } from "next/navigation";

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

        <div className="hidden lg:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              placeholder="Search student, fee, batch..."
              className="w-80 pl-10"
            />
          </div>
        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-2">
          {/* Mobile Search */}

          <Button variant="ghost" size="icon" className="lg:hidden">
            <Search className="h-5 w-5" />
          </Button>

          {/* Quick Add */}

          <Button className="hidden md:flex rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            Quick Add
          </Button>

          {/* Mobile Add */}

          <Button size="icon" className="md:hidden">
            <Plus className="h-4 w-4" />
          </Button>

          {/* Notification */}

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </Button>

          {/* Profile */}

          <button className="flex items-center gap-2 rounded-xl p-2 hover:bg-slate-100">
            <Avatar className="h-9 w-9">
              <AvatarFallback>RK</AvatarFallback>
            </Avatar>

            <div className="hidden text-left xl:block">
              <p className="text-sm font-semibold">Ravi Kumar</p>

              <p className="text-xs text-slate-500">Admin</p>
            </div>

            <ChevronDown className="hidden h-4 w-4 text-slate-500 xl:block" />
          </button>
        </div>
      </div>
    </header>
  );
}
