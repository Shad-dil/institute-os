"use client";

import { Bell, ChevronDown, Moon, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export default function TopNavbar() {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-8">
        {/* Left Side */}

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              placeholder="Search students, fees, attendance..."
              className="w-[340px] rounded-xl border-slate-200 bg-slate-50 pl-10 pr-16 focus-visible:ring-blue-500"
            />

            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border bg-white px-1.5 py-0.5 text-xs text-slate-500">
              Ctrl K
            </kbd>
          </div>
        </div>

        {/* Right Side */}

        <div className="flex items-center gap-3">
          {/* Quick Add */}

          <Button className="rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            Quick Add
          </Button>

          {/* Notification */}

          <Button variant="ghost" size="icon" className="relative rounded-xl">
            <Bell className="h-5 w-5" />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </Button>

          {/* Theme */}

          <Button variant="ghost" size="icon" className="rounded-xl">
            <Moon className="h-5 w-5" />
          </Button>

          {/* Divider */}

          <div className="mx-2 h-8 w-px bg-slate-200" />

          {/* User */}

          <button className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-100">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-600 text-white">
                RK
              </AvatarFallback>
            </Avatar>

            <div className="hidden text-left lg:block">
              <p className="text-sm font-semibold">Ravi Kumar</p>

              <p className="text-xs text-slate-500">Administrator</p>
            </div>

            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>
        </div>
      </div>
    </header>
  );
}
