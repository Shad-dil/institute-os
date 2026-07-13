"use client";

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CourseOption } from "@/types/tests";
import type { BatchOption } from "@/types/admission";
import { Label } from "../ui/label";

interface AttendanceFiltersProps {
  courses: CourseOption[];
  batches: BatchOption[];
  courseId: string;
  batchId: string; // "" = all batches in the course
  dateISO: string;
}

export function AttendanceFilters({
  courses,
  batches,
  courseId,
  batchId,
  dateISO,
}: AttendanceFiltersProps) {
  const router = useRouter();

  function updateParams(next: {
    courseId?: string;
    batchId?: string;
    date?: string;
  }) {
    const params = new URLSearchParams({
      courseId: next.courseId ?? courseId,
      // Switching course invalidates whatever batch was selected — it
      // belonged to the old course's batch list.
      batchId: next.courseId ? "" : (next.batchId ?? batchId),
      date: next.date ?? dateISO,
    });
    router.push(`/dashboard/attendance?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row ">
      <div className="w-full sm:w-56 ">
        <Label>Select Course</Label>
        <Select
          items={courses.map((c) => ({ value: c.id, label: c.name }))}
          value={courseId}
          onValueChange={(v) => {
            if (v === null) return;
            updateParams({ courseId: v });
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {batches.length > 0 && (
        <div className="w-full sm:w-56">
          <Label>Select Batch</Label>
          <Select
            items={batches.map((c) => ({ value: c.id, label: c.name }))}
            value={batchId || "all"}
            onValueChange={(v) => {
              if (v === null) return;
              updateParams({ batchId: v === "all" ? "" : v });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a batch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All batches in course</SelectItem>
              {batches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div>
        <Label>{"Select Date "}</Label>
        <Input
          type="date"
          value={dateISO}
          onChange={(e) => updateParams({ date: e.target.value })}
          className="w-full sm:w-48"
        />
      </div>
    </div>
  );
}
