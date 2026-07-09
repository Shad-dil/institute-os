import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FeeStatus } from "@/types/fees";

const STATUS_STYLE: Record<FeeStatus, string> = {
  PAID: "bg-green-50 text-green-700 border-green-200",
  PARTIAL: "bg-amber-50 text-amber-700 border-amber-200",
  PENDING: "bg-slate-100 text-slate-600 border-slate-200",
  OVERDUE: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABEL: Record<FeeStatus, string> = {
  PAID: "Paid",
  PARTIAL: "Partial",
  PENDING: "Pending",
  OVERDUE: "Overdue",
};

export function FeeStatusBadge({ status }: { status: FeeStatus }) {
  return (
    <Badge variant="outline" className={cn("font-medium", STATUS_STYLE[status])}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
