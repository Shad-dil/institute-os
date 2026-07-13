"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { InquiryStatusBadge } from "@/components/inquiries/inquiry-status-badge";
import { WhatsAppInquiryButton } from "@/components/inquiries/whatsapp-inquiry-button";
import {
  updateInquiryStatus,
  addInquiryFollowUp,
} from "@/lib/action/inquiries-actions";
import { toast } from "sonner";
import type { InquiryDetail, InquiryStatus } from "@/types/inquiries";

interface InquiryDetailDrawerProps {
  inquiryId: string | null;
  instituteName: string;
  onOpenChange: (open: boolean) => void;
}

const STATUS_OPTIONS: InquiryStatus[] = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "NOT_INTERESTED",
  "CONVERTED",
  "LOST",
];

export function InquiryDetailDrawer({
  inquiryId,
  instituteName,
  onOpenChange,
}: InquiryDetailDrawerProps) {
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [nextFollowUp, setNextFollowUp] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const load = useCallback(() => {
    if (!inquiryId) return;
    setLoading(true);
    fetch(`/api/inquiries/${inquiryId}`)
      .then((res) => res.json())
      .then((data: InquiryDetail) => {
        setInquiry(data);
        setNextFollowUp(data.nextFollowUpAt);
      })
      .catch(() => setInquiry(null))
      .finally(() => setLoading(false));
  }, [inquiryId]);

  useEffect(() => {
    if (inquiryId) load();
    else setInquiry(null);
  }, [inquiryId, load]);

  function handleStatusChange(status: InquiryStatus | null) {
    if (!inquiry || status === null) return;
    startTransition(async () => {
      const result = await updateInquiryStatus(inquiry.id, status);
      if (result.success) {
        setInquiry((prev) => (prev ? { ...prev, status } : prev));
        toast.success("Status updated");
      } else {
        toast.error(result.error ?? "Couldn't update status");
      }
    });
  }

  function handleAddFollowUp(e: React.FormEvent) {
    e.preventDefault();
    if (!inquiry || !note.trim()) return;

    startTransition(async () => {
      const result = await addInquiryFollowUp({
        inquiryId: inquiry.id,
        note: note.trim(),
        nextFollowUpAt: nextFollowUp,
      });
      if (result.success) {
        toast.success("Follow-up logged");
        setNote("");
        load();
      } else {
        toast.error(result.error ?? "Couldn't save this follow-up");
      }
    });
  }

  function handleConvert() {
    if (!inquiry) return;
    onOpenChange(false);
    router.push(`/dashboard/admissions?inquiryId=${inquiry.id}`);
  }

  return (
    <Sheet open={inquiryId !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {loading || !inquiry ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            {loading ? "Loading…" : "Select an inquiry."}
          </div>
        ) : (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <SheetTitle>{inquiry.name}</SheetTitle>
                <InquiryStatusBadge status={inquiry.status} />
              </div>
              <SheetDescription>
                {inquiry.phone}
                {inquiry.courseName && ` · Interested in ${inquiry.courseName}`}
                {inquiry.referredByName &&
                  ` · Referred by ${inquiry.referredByName}`}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-4 space-y-5">
              <div className="flex flex-wrap gap-2">
                <WhatsAppInquiryButton
                  phone={inquiry.phone}
                  name={inquiry.name}
                  courseName={inquiry.courseName}
                  instituteName={instituteName}
                />
                {inquiry.status !== "CONVERTED" && (
                  <Button size="sm" className="gap-1.5" onClick={handleConvert}>
                    <UserPlus className="h-3.5 w-3.5" />
                    Convert to Student
                  </Button>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={inquiry.status}
                  onValueChange={handleStatusChange}
                  disabled={isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0) +
                          s.slice(1).toLowerCase().replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border border-slate-100 p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Log a Follow-up
                </p>
                <form onSubmit={handleAddFollowUp} className="space-y-3">
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Called, said they'll decide after Diwali"
                    rows={2}
                    className="resize-none"
                  />
                  <div className="space-y-1.5">
                    <Label htmlFor="nextFollowUp" className="text-xs">
                      Next Follow-up Date (optional)
                    </Label>
                    <Input
                      id="nextFollowUp"
                      type="date"
                      value={nextFollowUp}
                      onChange={(e) => setNextFollowUp(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isPending || !note.trim()}
                    >
                      {isPending ? "Saving…" : "Save Follow-up"}
                    </Button>
                  </div>
                </form>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                  History
                </p>
                {inquiry.followUps.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No follow-ups logged yet.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {inquiry.followUps.map((f) => (
                      <li key={f.id} className="rounded-lg bg-slate-50 p-3">
                        <p className="text-sm text-slate-700">{f.note}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {f.createdAt}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
