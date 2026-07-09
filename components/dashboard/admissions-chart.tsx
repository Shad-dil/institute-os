"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList, Cell } from "recharts";
import type { AdmissionsPoint } from "@/types/dashboard";

interface AdmissionsChartProps {
  data: AdmissionsPoint[];
}

export function AdmissionsChart({ data }: AdmissionsChartProps) {
  const hasAnyData = data.some((point) => point.admissions > 0);
  const maxIndex = data.length - 1;

  if (!hasAnyData) {
    return (
      <p className="py-10 text-center text-sm text-slate-400">
        No admissions yet — new students will show up here.
      </p>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 24, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748B", fontSize: 13 }}
          />
          <YAxis hide />
          <Bar dataKey="admissions" radius={[6, 6, 0, 0]} maxBarSize={44}>
            {data.map((_, index) => (
              <Cell key={index} fill={index === maxIndex ? "#2563EB" : "#BFDBFE"} />
            ))}
            <LabelList
              dataKey="admissions"
              position="top"
              formatter={(value: number) => (value > 0 ? String(value) : "")}
              style={{ fill: "#334155", fontSize: 13, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
