import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Megaphone } from "lucide-react";
import { ANNOUNCEMENTS } from "@/constants/dashboard-data";
import type { Announcement } from "@/types/dashboard";

const TAG_STYLE: Record<Announcement["tag"], string> = {
  urgent: "bg-red-50 text-red-600 border-red-100",
  event: "bg-blue-50 text-blue-600 border-blue-100",
  info: "bg-slate-100 text-slate-600 border-slate-200",
};

export function AnnouncementsCard() {
  return (
    <Card className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Megaphone className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-900">Announcements</h3>
      </div>

      <ul className="mt-4 space-y-4">
        {ANNOUNCEMENTS.map((item) => (
          <li key={item.id}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900">{item.title}</p>
              <Badge
                variant="outline"
                className={cn("text-[10px] font-medium capitalize", TAG_STYLE[item.tag])}
              >
                {item.tag}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
            <p className="mt-1 text-[11px] text-slate-400">{item.postedAt}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
