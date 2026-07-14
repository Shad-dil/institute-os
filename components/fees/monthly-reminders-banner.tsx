"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";
import { WhatsAppReminderButton } from "@/components/fees/whatsapp-reminder-button";
import {
  dismissFeeReminder,
  dismissAllFeeReminders,
} from "@/lib/action/fee-reminders-actions";
import type { FeeReminderNoticeRow } from "@/lib/queries/fee-reminders-queries";

interface MonthlyRemindersBannerProps {
  notices: FeeReminderNoticeRow[];
  instituteName?: string;
}

export function MonthlyRemindersBanner({
  notices,
  instituteName,
}: MonthlyRemindersBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const visible = notices.filter((n) => !dismissed.has(n.id));

  if (visible.length === 0) return null;

  function handleDismiss(id: string) {
    setDismissed((prev) => new Set(prev).add(id));
    // ensure we pass a void or Promise<void> to startTransition
    startTransition(() => {
      void dismissFeeReminder(id);
    });
  }

  function handleDismissAll() {
    setDismissed(new Set(notices.map((n) => n.id)));
    startTransition(async () => {
      await dismissAllFeeReminders();
      router.refresh();
    });
  }

  return (
    <Card className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-blue-600" />
          <p className="text-sm font-semibold text-blue-900">
            {visible.length} student{visible.length === 1 ? "" : "s"} billed for
            this month
          </p>
        </div>
        <button
          onClick={handleDismissAll}
          disabled={isPending}
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          Dismiss all
        </button>
      </div>

      <ul className="mt-3 space-y-2">
        {visible.map((notice) => (
          <li
            key={notice.id}
            className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2.5 shadow-sm"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">
                {notice.studentName}
              </p>
              <p className="text-xs text-slate-500">
                ₹{notice.amount.toLocaleString("en-IN")} · due {notice.dueDate}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <WhatsAppReminderButton
                phone={notice.parentPhone || notice.studentPhone}
                studentName={notice.studentName}
                amountDue={notice.amount}
                dueDate={notice.dueDate}
                instituteName={instituteName}
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
                onClick={() => handleDismiss(notice.id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
