import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Users } from "lucide-react";
import { UPCOMING_BATCHES } from "@/constants/dashboard-data";
import type { UpcomingFeeDue } from "@/types/dashboard";

interface UpcomingPanelProps {
  fees: UpcomingFeeDue[];
}

export function UpcomingPanel({ fees }: UpcomingPanelProps) {
  return (
    <div className="space-y-6">
      <Card className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">
          Upcoming Fee Dues
        </h3>
        {fees.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No pending dues 🎉</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {fees.map((due) => (
              <li key={due.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-amber-50 text-[11px] font-medium text-amber-700">
                    {due.avatarInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {due.studentName}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {due.course}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {due.amount}
                  </p>
                  <p className="text-[11px] text-slate-400">{due.dueDate}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* TODO: no Batch model in the schema yet — this section is still
          mock data. Add a Batch model (name, course, schedule, faculty,
          capacity) and swap this for a real query when it exists. */}
      {/* <Card className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Upcoming Batches</h3>
          <Badge variant="outline" className="border-slate-200 text-[10px] font-normal text-slate-400">
            Sample data
          </Badge>
        </div>
        <ul className="mt-4 space-y-3">
          {UPCOMING_BATCHES.map((batch) => (
            <li
              key={batch.id}
              className="rounded-lg border border-slate-100 p-3 transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-900">{batch.batchName}</p>
                <Badge variant="outline" className="border-slate-200 text-[11px] font-normal text-slate-500">
                  {batch.seatsLeft} seats left
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{batch.course}</p>
              <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {batch.time}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" /> {batch.faculty}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Card> */}
    </div>
  );
}
