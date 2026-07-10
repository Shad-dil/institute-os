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
import { Plus, Pencil } from "lucide-react";
import { createBatch, updateBatch } from "@/lib/action/courses-actions";
import { toast } from "sonner";
import type { BatchSummary } from "@/types/courses";

interface BatchFormDialogProps {
  courseId: string;
  batch?: BatchSummary; // omit for "create" mode
}

export function BatchFormDialog({ courseId, batch }: BatchFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(batch);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("courseId", courseId);

    startTransition(async () => {
      const result =
        isEdit && batch
          ? await updateBatch(batch.id, formData)
          : await createBatch(formData);
      if (result.success) {
        toast.success(isEdit ? "Batch updated" : "Batch created");
        setOpen(false);
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        variant={isEdit ? "ghost" : "outline"}
        size="sm"
        className={isEdit ? "h-7 gap-1 px-2 text-xs text-slate-500" : "gap-1.5"}
      >
        {isEdit ? (
          <Pencil className="h-3 w-3" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
        {isEdit ? "Edit" : "Add Batch"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Batch" : "Add Batch"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this batch's details."
              : "Create a new batch under this course."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Batch Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={batch?.name}
              placeholder="e.g. Morning Batch A"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="schedule">Schedule</Label>
            <Input
              id="schedule"
              name="schedule"
              defaultValue={batch?.schedule}
              placeholder="e.g. Mon, Wed, Fri · 6:00–7:30 PM"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="facultyName">Faculty (optional)</Label>
              <Input
                id="facultyName"
                name="facultyName"
                defaultValue={batch?.facultyName ?? ""}
                placeholder="e.g. Amit Deshmukh"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="capacity">Capacity (optional)</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min={1}
                defaultValue={batch?.capacity ?? ""}
                placeholder="e.g. 30"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="startDate">Start Date (optional)</Label>
            <Input id="startDate" name="startDate" type="date" />
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
              {isPending ? "Saving…" : isEdit ? "Save Changes" : "Add Batch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
