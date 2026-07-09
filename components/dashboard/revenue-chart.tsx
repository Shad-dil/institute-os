"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList, Cell } from "recharts";
import type { RevenuePoint } from "@/types/dashboard";

interface RevenueChartProps {
  data: RevenuePoint[];
}

function formatCompact(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${Math.round(value / 1000)}k`;
  return `₹${value}`;
}

export function RevenueChart({ data }: RevenueChartProps) {
  const hasAnyData = data.some((point) => point.revenue > 0);
  const lastIndex = data.length - 1;

  if (!hasAnyData) {
    return (
      <p className="py-10 text-center text-sm text-slate-400">
        No fees collected yet — this will fill in as payments come in.
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
          <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={44}>
            {data.map((_, index) => (
              <Cell key={index} fill={index === lastIndex ? "#2563EB" : "#BFDBFE"} />
            ))}
            <LabelList
              dataKey="revenue"
              position="top"
              formatter={(value: number) => (value > 0 ? formatCompact(value) : "")}
              style={{ fill: "#334155", fontSize: 13, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
