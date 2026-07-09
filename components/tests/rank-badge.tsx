import { cn } from "@/lib/utils";

export function RankBadge({ rank }: { rank: number | null }) {
  if (rank === null) {
    return <span className="text-sm text-slate-300">—</span>;
  }

  const medalStyle =
    rank === 1
      ? "bg-amber-100 text-amber-700"
      : rank === 2
      ? "bg-slate-200 text-slate-600"
      : rank === 3
      ? "bg-orange-100 text-orange-700"
      : "bg-slate-50 text-slate-500";

  return (
    <span
      className={cn(
        "inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm font-semibold",
        medalStyle
      )}
    >
      {rank}
    </span>
  );
}
