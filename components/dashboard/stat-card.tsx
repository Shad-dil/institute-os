import { Card } from "@/components/ui/card";
import {
  Users,
  CalendarCheck,
  Wallet,
  IndianRupee,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatCardData, StatIconName } from "@/types/dashboard";

const ICON_MAP: Record<StatIconName, typeof Users> = {
  students: Users,
  attendance: CalendarCheck,
  pendingFees: Wallet,
  revenue: IndianRupee,
  admissions: UserPlus,
};

const ACCENT_STYLES: Record<
  StatCardData["accent"],
  { icon: string; ring: string }
> = {
  blue: { icon: "bg-blue-50 text-blue-600", ring: "ring-blue-100" },
  green: { icon: "bg-green-50 text-green-600", ring: "ring-green-100" },
  amber: { icon: "bg-amber-50 text-amber-600", ring: "ring-amber-100" },
  red: { icon: "bg-red-50 text-red-600", ring: "ring-red-100" },
  violet: { icon: "bg-violet-50 text-violet-600", ring: "ring-violet-100" },
};

const TONE_STYLES: Record<NonNullable<StatCardData["deltaTone"]>, string> = {
  positive: "text-green-600",
  negative: "text-red-600",
  neutral: "text-slate-500",
};

interface StatCardProps {
  data: StatCardData;
}

export function StatCard({ data }: StatCardProps) {
  const accent = ACCENT_STYLES[data.accent];
  const Icon = ICON_MAP[data.icon];

  return (
    <Card className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-lg ring-4",
          accent.icon,
          accent.ring,
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>

      <p className="mt-4 text-sm font-medium text-slate-500">{data.label}</p>
      <h3 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
        {data.value}
      </h3>
      <p
        className={cn(
          "mt-1.5 text-sm font-medium",
          data.deltaTone ? TONE_STYLES[data.deltaTone] : undefined,
        )}
      >
        {data.deltaText}
      </p>
    </Card>
  );
}
