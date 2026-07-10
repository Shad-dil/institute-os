"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { MessageCircle, Check, X, Clock } from "lucide-react";
// import { markAttendance, markAllPresent } from "@/lib/actions/attendance-actions";
import { buildAbsentNotification } from "@/components/attendance/whatsapp-absent";
import { SimplePagination } from "@/components/ui-extra/simple-pagination";
import { toast } from "sonner";
import type {
  AttendanceStudentRow,
  AttendanceStatus,
} from "@/types/attendance";
import {
  markAttendance,
  markAllPresent,
} from "@/lib/action/attendance-actions";

interface AttendanceBoardProps {
  courseId: string;
  batchId?: string;
  dateISO: string;
  dateLabel: string;
  instituteName: string;
  initialStudents: AttendanceStudentRow[];
}

const STATUS_CONFIG: {
  status: AttendanceStatus;
  label: string;
  icon: typeof Check;
}[] = [
  { status: "PRESENT", label: "Present", icon: Check },
  { status: "ABSENT", label: "Absent", icon: X },
  { status: "LATE", label: "Late", icon: Clock },
];

const STATUS_ACTIVE_STYLE: Record<AttendanceStatus, string> = {
  PRESENT: "bg-green-600 text-white border-green-600",
  ABSENT: "bg-red-600 text-white border-red-600",
  LATE: "bg-amber-500 text-white border-amber-500",
};

const PAGE_SIZE = 15;

export function AttendanceBoard({
  courseId,
  batchId,
  dateISO,
  dateLabel,
  instituteName,
  initialStudents,
}: AttendanceBoardProps) {
  const [students, setStudents] = useState(initialStudents);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [isBulkPending, startBulkTransition] = useTransition();
  const [page, setPage] = useState(0);
  const router = useRouter();

  const pageCount = Math.max(Math.ceil(students.length / PAGE_SIZE), 1);
  const visibleStudents = useMemo(
    () => students.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [students, page],
  );

  function setPending(id: string, on: boolean) {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleMark(student: AttendanceStudentRow, status: AttendanceStatus) {
    if (status === "ABSENT") {
      const notification = buildAbsentNotification({
        studentName: student.studentName,
        studentPhone: student.studentPhone,
        parentPhone: student.parentPhone,
        dateLabel,
        instituteName,
      });
      if (notification) {
        window.open(notification.href, "_blank", "noopener,noreferrer");
      } else {
        toast.error(
          `No phone number on file for ${student.studentName} — attendance saved, but no message sent`,
        );
      }
    }

    setStudents((prev) =>
      prev.map((s) =>
        s.studentId === student.studentId ? { ...s, status } : s,
      ),
    );
    setPending(student.studentId, true);

    markAttendance(student.studentId, dateISO, status).then((result) => {
      setPending(student.studentId, false);
      if (!result.success) {
        setStudents((prev) =>
          prev.map((s) =>
            s.studentId === student.studentId
              ? { ...s, status: student.status }
              : s,
          ),
        );
        toast.error(result.error ?? "Couldn't save attendance");
      }
    });
  }

  function handleResendNotification(student: AttendanceStudentRow) {
    const notification = buildAbsentNotification({
      studentName: student.studentName,
      studentPhone: student.studentPhone,
      parentPhone: student.parentPhone,
      dateLabel,
      instituteName,
    });
    if (notification)
      window.open(notification.href, "_blank", "noopener,noreferrer");
  }

  function handleMarkAllPresent() {
    // This queries and marks the FULL roster server-side, not just the
    // page currently visible — pagination is a display concern only,
    // and this bulk action shouldn't silently skip students who happen
    // to be on page 2.
    startBulkTransition(async () => {
      const result = await markAllPresent(courseId, dateISO, batchId);
      if (result.success) {
        toast.success(
          `Marked ${result.markedCount} student${result.markedCount === 1 ? "" : "s"} present`,
        );
        router.refresh();
      } else {
        toast.error(result.error ?? "Couldn't mark attendance");
      }
    });
  }

  if (students.length === 0) {
    return (
      <Card className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <p className="text-sm text-slate-400">
          No students in this course yet.
        </p>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <p className="text-sm text-slate-500">
          Marking absent opens WhatsApp to the guardian automatically.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllPresent}
          disabled={isBulkPending}
        >
          {isBulkPending ? "Marking…" : "Mark Unmarked as Present"}
        </Button>
      </div>

      <ul className="divide-y divide-slate-50">
        {visibleStudents.map((student) => {
          const isPending = pendingIds.has(student.studentId);
          return (
            <li
              key={student.studentId}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-slate-100 text-xs font-medium text-slate-600">
                    {student.avatarInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {student.studentName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {student.monthAttendancePct !== null
                      ? `${student.monthAttendancePct}% this month`
                      : "No history yet"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {student.status === "ABSENT" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 border-green-200 text-green-700 hover:bg-green-50"
                    onClick={() => handleResendNotification(student)}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Notify Again
                  </Button>
                )}

                <div className="flex overflow-hidden rounded-lg border border-slate-200">
                  {STATUS_CONFIG.map(({ status, label, icon: Icon }, idx) => (
                    <button
                      key={status}
                      onClick={() => handleMark(student, status)}
                      disabled={isPending}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
                        idx > 0 && "border-l border-slate-200",
                        student.status === status
                          ? STATUS_ACTIVE_STYLE[status]
                          : "bg-white text-slate-500 hover:bg-slate-50",
                        isPending && "opacity-50",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <SimplePagination
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        totalItems={students.length}
        pageSize={PAGE_SIZE}
      />
    </Card>
  );
}
