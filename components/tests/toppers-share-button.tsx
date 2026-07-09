"use client";

import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TestResultRow } from "@/types/tests";

interface ToppersShareButtonProps {
  results: TestResultRow[];
  testName: string;
  maxMarks: number;
  instituteName: string;
}

export function ToppersShareButton({ results, testName, maxMarks, instituteName }: ToppersShareButtonProps) {
  const topper = results
    .filter((r) => r.marksObtained !== null)
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
    .slice(0, 5);

  const lines = topper
    .map((r) => `${r.rank}. ${r.studentName} — ${r.marksObtained}/${maxMarks} (${r.percentage}%)`)
    .join("\n");

  const message = `🏆 ${instituteName} — Top Performers

${testName}

${lines}

Well done to all our students!`;

  // No specific phone number — https://wa.me/?text= opens WhatsApp with
  // the message ready and lets the owner pick a contact, group, or
  // status update themselves. This is the "toppers board outside the
  // gate" turned into something they can post digitally in one tap.
  const href = `https://wa.me/?text=${encodeURIComponent(message)}`;

  if (topper.length === 0) {
    return (
      <Button size="sm" variant="outline" disabled className="gap-1.5 text-slate-400">
        <Trophy className="h-3.5 w-3.5" />
        Share Toppers List
      </Button>
    );
  }

  return (
    <Button size="sm" variant="outline" asChild className="gap-1.5 border-amber-200 text-amber-700 hover:bg-amber-50">
      <a href={href} target="_blank" rel="noopener noreferrer">
        <Trophy className="h-3.5 w-3.5" />
        Share Toppers List
      </a>
    </Button>
  );
}
