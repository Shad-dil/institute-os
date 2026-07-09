"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { Plus } from "lucide-react";
import { createTest } from "@/lib/action/test-actions";
import { toast } from "sonner";
import type { CourseOption } from "@/types/tests";

interface NewTestDialogProps {
  courses: CourseOption[];
}

export function NewTestDialog({ courses }: NewTestDialogProps) {
  const [open, setOpen] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!courseId) {
      toast.error("Please select a course");
      return;
    }
    const formData = new FormData(e.currentTarget);
    formData.set("courseId", courseId);

    startTransition(async () => {
      const result = await createTest(formData);
      if (result.success && result.testId) {
        toast.success("Test created — now enter marks");
        setOpen(false);
        router.push(`/tests/${result.testId}`);
      } else {
        toast.error(result.error ?? "Couldn't create the test");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="h-4 w-4" />
          New Test
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Test</DialogTitle>
          <DialogDescription>
            Create a test, then enter marks for the whole class.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Test Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Physics Unit Test 3"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="courseId">Course / Batch</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger id="courseId">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="maxMarks">Max Marks</Label>
              <Input
                id="maxMarks"
                name="maxMarks"
                type="number"
                min={1}
                placeholder="100"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="testDate">Test Date</Label>
              <Input
                id="testDate"
                name="testDate"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
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
              {isPending ? "Creating…" : "Create Test"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
