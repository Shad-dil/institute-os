import { Badge } from "@/components/ui/badge";
import { FeeStatusBadge } from "@/components/fees/fee-status-badge";
import type { FeeStatus } from "@/types/fees";

export function StudentFeeStatusBadge({ status }: { status: FeeStatus | "NO_INVOICE" }) {
  if (status === "NO_INVOICE") {
    return (
      <Badge variant="outline" className="border-slate-200 text-slate-400">
        No fee set
      </Badge>
    );
  }
  return <FeeStatusBadge status={status} />;
}
