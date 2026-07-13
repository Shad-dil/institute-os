import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { InquiryStatus } from "@/types/inquiries";

const STATUS_STYLE: Record<InquiryStatus, string> = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  CONTACTED: "bg-slate-100 text-slate-600 border-slate-200",
  INTERESTED: "bg-amber-50 text-amber-700 border-amber-200",
  NOT_INTERESTED: "bg-slate-100 text-slate-500 border-slate-200",
  CONVERTED: "bg-green-50 text-green-700 border-green-200",
  LOST: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABEL: Record<InquiryStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  NOT_INTERESTED: "Not Interested",
  CONVERTED: "Converted",
  LOST: "Lost",
};

export function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  return (
    <Badge variant="outline" className={cn("font-medium", STATUS_STYLE[status])}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
