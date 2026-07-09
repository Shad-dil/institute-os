"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { UserPlus, Wallet, ClipboardCheck } from "lucide-react";
import type { ActivityItem, ActivityType } from "@/types/dashboard";

interface RecentActivityFeedProps {
  items: ActivityItem[];
}

const FILTERS: { label: string; value: ActivityType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Admissions", value: "admission" },
  { label: "Payments", value: "payment" },
  { label: "Attendance", value: "attendance" },
];

const TYPE_ICON: Record<ActivityType, typeof UserPlus> = {
  admission: UserPlus,
  payment: Wallet,
  attendance: ClipboardCheck,
};

const TYPE_STYLE: Record<ActivityType, string> = {
  admission: "bg-blue-50 text-blue-600",
  payment: "bg-green-50 text-green-600",
  attendance: "bg-amber-50 text-amber-600",
};

export function RecentActivityFeed({ items: allItems }: RecentActivityFeedProps) {
  const [filter, setFilter] = useState<ActivityType | "all">("all");

  const items = filter === "all" ? allItems : allItems.filter((item) => item.type === filter);

  return (
    <Card className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                filter === item.value
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">No activity yet.</p>
      ) : (
        <ul className="mt-4 space-y-1">
          {items.map((item) => {
            const Icon = TYPE_ICON[item.type];
            return (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-slate-50"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-slate-100 text-xs font-medium text-slate-600">
                    {item.avatarInitials}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{item.title}</p>
                  <p className="truncate text-xs text-slate-500">{item.subtitle}</p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-md",
                      TYPE_STYLE[item.type]
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[11px] text-slate-400">{item.timestamp}</span>
                </div>

                {item.amount && (
                  <span className="ml-1 shrink-0 text-sm font-semibold text-slate-900">
                    {item.amount}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
