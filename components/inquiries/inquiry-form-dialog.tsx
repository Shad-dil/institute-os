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
import { Plus } from "lucide-react";
import { createInquiry } from "@/lib/action/inquiries-actions";
import { toast } from "sonner";
import type { CourseOption } from "@/types/tests";

interface InquiryFormDialogProps {
  courses: CourseOption[];
}

export function InquiryFormDialog({ courses }: InquiryFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [courseId, setCourseId] = useState("none");
  const [source, setSource] = useState("WALK_IN");
  const [isPending, startTransition] = useTransition();

  function handleCourseChange(value: string | null) {
    setCourseId(value ?? "none");
  }

  function handleSourceChange(value: string | null) {
    setSource(value ?? "WALK_IN");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("courseId", courseId === "none" ? "" : courseId);
    formData.set("source", source);

    startTransition(async () => {
      const result = await createInquiry(formData);
      if (result.success) {
        toast.success("Inquiry added");
        setOpen(false);
        setCourseId("none");
        setSource("WALK_IN");
      } else {
        toast.error(result.error ?? "Couldn't add this inquiry");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="gap-1.5">
        <Plus className="h-4 w-4" />
        Add Inquiry
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Inquiry</DialogTitle>
          <DialogDescription>
            Log a lead — this doesn&apos;t create a student yet.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Anil Kumar"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="10-digit number"
              maxLength={10}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Interested Course</Label>
              <Select value={courseId} onValueChange={handleCourseChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not sure yet</SelectItem>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Source</Label>
              <Select value={source} onValueChange={handleSourceChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WALK_IN">Walk-in</SelectItem>
                  <SelectItem value="PHONE_CALL">Phone Call</SelectItem>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  <SelectItem value="REFERRAL">Referral</SelectItem>
                  <SelectItem value="SOCIAL_MEDIA">Social Media</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="referredByName">Referred By (optional)</Label>
            <Input
              id="referredByName"
              name="referredByName"
              placeholder="e.g. Ramesh Kumar (existing parent)"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nextFollowUpAt">Follow Up On (optional)</Label>
            <Input id="nextFollowUpAt" name="nextFollowUpAt" type="date" />
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
              {isPending ? "Saving…" : "Add Inquiry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
