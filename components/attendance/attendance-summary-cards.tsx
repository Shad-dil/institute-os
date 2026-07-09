import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AttendanceSummary } from "@/types/attendance";

export function AttendanceSummaryCards({ summary }: { summary: AttendanceSummary }) {
  const cards = [
    { label: "Present", value: summary.present, accent: "text-green-600 bg-green-50" },
    { label: "Absent", value: summary.absent, accent: "text-red-600 bg-red-50" },
    { label: "Late", value: summary.late, accent: "text-amber-600 bg-amber-50" },
    { label: "Not Marked", value: summary.notMarked, accent: "text-slate-500 bg-slate-100" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">{c.label}</p>
          <p className={cn("mt-1 inline-flex rounded-md px-1.5 text-2xl font-semibold", c.accent)}>
            {c.value}
          </p>
        </Card>
      ))}
    </div>
  );
}
