"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Clock, IndianRupee, Trash2, Repeat } from "lucide-react";
import { CourseFormDialog } from "@/components/courses/course-form-dialog";
import { BatchFormDialog } from "@/components/courses/batch-form-dialog";
import { ConfirmationDialog } from "@/components/ui-extra/confirmation-dialog";
import { deleteCourse, deleteBatch } from "@/lib/action/courses-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { CourseSummary, BatchSummary } from "@/types/courses";

interface CourseCardProps {
  course: CourseSummary;
}

export function CourseCard({ course }: CourseCardProps) {
  const [confirmDeleteCourse, setConfirmDeleteCourse] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<BatchSummary | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDeleteCourse() {
    startTransition(async () => {
      const result = await deleteCourse(course.id);
      if (result.success) {
        toast.success(`${course.name} deleted`);
        setConfirmDeleteCourse(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Couldn't delete course");
      }
    });
  }

  function handleDeleteBatch() {
    if (!batchToDelete) return;
    startTransition(async () => {
      const result = await deleteBatch(batchToDelete.id);
      if (result.success) {
        toast.success(`${batchToDelete.name} deleted`);
        setBatchToDelete(null);
        router.refresh();
      } else {
        toast.error(result.error ?? "Couldn't delete batch");
      }
    });
  }

  return (
    <>
      <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-start justify-between p-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900">{course.name}</h3>
              {course.billingCycle === "MONTHLY" && (
                <Badge
                  variant="outline"
                  className="gap-1 border-blue-200 bg-blue-50 text-[10px] font-medium text-blue-700"
                >
                  <Repeat className="h-2.5 w-2.5" />
                  Monthly
                </Badge>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <IndianRupee className="h-3 w-3" /> ₹
                {course.fees.toLocaleString("en-IN")}
                {course.billingCycle === "MONTHLY" && "/mo"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {course.duration}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" /> {course.studentCount} student
                {course.studentCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <CourseFormDialog course={course} />
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={() => setConfirmDeleteCourse(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="border-t border-slate-100 p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Batches ({course.batches.length})
            </p>
            <BatchFormDialog courseId={course.id} />
          </div>

          {course.batches.length === 0 ? (
            <p className="text-sm text-slate-400">
              No batches yet — students admitted into this course won&apos;t be
              assigned to a specific batch until you add one.
            </p>
          ) : (
            <ul className="space-y-2">
              {course.batches.map((batch) => (
                <li
                  key={batch.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {batch.name}
                    </p>
                    <p className="text-xs text-slate-500">{batch.schedule}</p>
                    {batch.facultyName && (
                      <p className="text-xs text-slate-400">
                        Faculty: {batch.facultyName}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-slate-200 text-xs font-normal text-slate-500"
                    >
                      {batch.studentCount}
                      {batch.capacity !== null ? `/${batch.capacity}` : ""}{" "}
                      enrolled
                    </Badge>
                    <BatchFormDialog courseId={course.id} batch={batch} />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => setBatchToDelete(batch)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <ConfirmationDialog
        open={confirmDeleteCourse}
        onOpenChange={setConfirmDeleteCourse}
        title={`Delete ${course.name}?`}
        description={
          course.studentCount > 0
            ? `This course has ${course.studentCount} enrolled student${course.studentCount === 1 ? "" : "s"} — you'll need to move or remove them first.`
            : "This can't be undone."
        }
        confirmLabel="Delete"
        destructive
        isPending={isPending}
        onConfirm={handleDeleteCourse}
      />

      <ConfirmationDialog
        open={batchToDelete !== null}
        onOpenChange={(open) => !open && setBatchToDelete(null)}
        title={`Delete ${batchToDelete?.name}?`}
        description="Students in this batch will be unassigned, not deleted — they'll stay enrolled in the course."
        confirmLabel="Delete"
        destructive
        isPending={isPending}
        onConfirm={handleDeleteBatch}
      />
    </>
  );
}
