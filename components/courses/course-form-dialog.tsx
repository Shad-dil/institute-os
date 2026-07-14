"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil } from "lucide-react";
import { createCourse, updateCourse } from "@/lib/action/courses-actions";
import { toast } from "sonner";
import type { CourseSummary } from "@/types/courses";

interface CourseFormDialogProps {
  course?: CourseSummary; // omit for "create" mode
}

export function CourseFormDialog({ course }: CourseFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState(
    course?.billingCycle ?? "ONE_TIME",
  );
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(course);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("billingCycle", billingCycle);

    startTransition(async () => {
      const result =
        isEdit && course
          ? await updateCourse(course.id, formData)
          : await createCourse(formData);
      if (result.success) {
        toast.success(isEdit ? "Course updated" : "Course created");
        setOpen(false);
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {isEdit ? (
          <Button variant="ghost" size="sm" className="gap-1.5 text-slate-500">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        ) : (
          <Button className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Course
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Course" : "Add Course"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the course details."
              : "Add a new course students can be admitted into."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Course Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={course?.name}
              placeholder="e.g. Physics — Class 12"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Billing</Label>
            <Select
              value={billingCycle}
              onValueChange={(v) => setBillingCycle(v as typeof billingCycle)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ONE_TIME">
                  One-time fee for the whole course
                </SelectItem>
                <SelectItem value="MONTHLY">
                  Monthly — bills automatically every month
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-400">
              {billingCycle === "MONTHLY"
                ? "A new invoice is generated automatically each month for every active student in this course."
                : "One invoice is created when a student is admitted, covering the full course."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fees">
                {billingCycle === "MONTHLY"
                  ? "Monthly Fee (₹)"
                  : "Total Fee (₹)"}
              </Label>
              <Input
                id="fees"
                name="fees"
                type="number"
                min={1}
                defaultValue={course?.fees}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                name="duration"
                defaultValue={course?.duration}
                placeholder="e.g. 3 Months"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : isEdit ? "Save Changes" : "Add Course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
