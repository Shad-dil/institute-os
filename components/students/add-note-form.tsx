"use client";

import { useState, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
// import { addNote } from "@/lib/actions/students-actions";
import { toast } from "sonner";
import { addNote } from "@/lib/action/students-actions";

interface AddNoteFormProps {
  studentId: string;
  onAdded: () => void;
}

export function AddNoteForm({ studentId, onAdded }: AddNoteFormProps) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    startTransition(async () => {
      const result = await addNote(studentId, content.trim());
      if (result.success) {
        setContent("");
        onAdded();
      } else {
        toast.error(result.error ?? "Couldn't save the note");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="e.g. Spoke to parent about attendance, will improve from next week"
        rows={2}
        className="resize-none"
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isPending || !content.trim()}>
          {isPending ? "Saving…" : "Add Note"}
        </Button>
      </div>
    </form>
  );
}
