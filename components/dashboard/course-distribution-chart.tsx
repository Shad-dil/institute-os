import type { CourseDistributionSlice } from "@/types/dashboard";

interface CourseDistributionChartProps {
  data: CourseDistributionSlice[];
}

export function CourseDistributionChart({ data }: CourseDistributionChartProps) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0) || 1;
  const sorted = [...data].sort((a, b) => b.value - a.value);

  if (sorted.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-slate-400">
        No students enrolled yet — add a course and a few students to see this.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {sorted.map((slice) => {
        const percent = Math.round((slice.value / total) * 100);
        return (
          <li key={slice.name}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-900">{slice.name}</span>
              <span className="text-slate-500">
                {slice.value} student{slice.value === 1 ? "" : "s"} · {percent}%
              </span>
            </div>
            <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full"
                style={{ width: `${percent}%`, backgroundColor: slice.color }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
