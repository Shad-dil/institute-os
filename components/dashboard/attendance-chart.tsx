"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import type { AttendancePoint } from "@/types/dashboard";

interface AttendanceChartProps {
  data: AttendancePoint[];
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  const hasAnyData = data.some((point) => point.present + point.absent > 0);

  if (!hasAnyData) {
    return (
      <p className="py-10 text-center text-sm text-slate-400">
        No attendance marked yet this week.
      </p>
    );
  }

  return (
    <div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 13 }}
            />
            <YAxis hide />
            <Bar dataKey="present" stackId="a" fill="#22C55E" maxBarSize={32} />
            <Bar dataKey="absent" stackId="a" fill="#FCA5A5" radius={[6, 6, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Static caption instead of a hover-dependent recharts legend */}
      <div className="mt-2 flex items-center justify-center gap-5 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Present
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-300" /> Absent
        </span>
      </div>
    </div>
  );
}
