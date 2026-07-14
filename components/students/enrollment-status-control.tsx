"use client";

import { useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateEnrollmentStatus } from "@/lib/action/enrollment-actions";
import { toast } from "sonner";

interface EnrollmentStatusControlProps {
  studentId: string;
  currentStatus: "ACTIVE" | "PAUSED" | "LEFT";
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active",
  PAUSED: "Paused",
  LEFT: "Left",
};

/**
 * Deliberately minimal — a single flag, not a full enrollment-history
 * model. This is enough to answer "should the monthly billing job charge
 * this student this month," which is the actual problem it needs to
 * solve right now. A proper multi-period enrollment history (so you can
 * see exactly when someone paused and resumed) is a real upgrade later,
 * not required to unblock monthly billing today.
 */
export function EnrollmentStatusControl({
  studentId,
  currentStatus,
}: EnrollmentStatusControlProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  function handleChange(
    value: "ACTIVE" | "PAUSED" | "LEFT" | null,
    // eventDetails arg exists on the Select change handler but we don't use it
    _eventDetails?: any,
  ) {
    if (value === null) return;
    const previous = status;
    setStatus(value);
    startTransition(async () => {
      const result = await updateEnrollmentStatus(studentId, value);
      if (result.success) {
        toast.success(`Marked ${STATUS_LABEL[value]}`);
      } else {
        setStatus(previous);
        toast.error(result.error ?? "Couldn't update status");
      }
    });
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="h-8 w-32 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ACTIVE">Active</SelectItem>
        <SelectItem value="PAUSED">Paused</SelectItem>
        <SelectItem value="LEFT">Left</SelectItem>
      </SelectContent>
    </Select>
  );
}
