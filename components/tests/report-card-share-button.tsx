"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TestResultRow } from "@/types/tests";

interface ReportCardShareButtonProps {
  result: TestResultRow;
  testName: string;
  maxMarks: number;
  totalStudents: number;
  instituteName: string;
}

function toWhatsAppNumber(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, "");
  if (digitsOnly.length === 10) return `91${digitsOnly}`;
  return digitsOnly;
}

export function ReportCardShareButton({
  result,
  testName,
  maxMarks,
  totalStudents,
  instituteName,
}: ReportCardShareButtonProps) {
  const targetPhone = result.parentPhone || result.studentPhone;
  const hasMarks = result.marksObtained !== null;

  if (!hasMarks || !targetPhone) {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled
        className="gap-1.5 text-slate-400"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        Share
      </Button>
    );
  }

  const message = `${instituteName} — Result Update

${result.studentName}'s result for "${testName}":

Marks: ${result.marksObtained} / ${maxMarks} (${result.percentage}%)
Rank: ${result.rank} out of ${totalStudents} students

Keep up the good work!`;

  const href = `https://wa.me/${toWhatsAppNumber(targetPhone)}?text=${encodeURIComponent(message)}`;

  return (
    <Button
      size="sm"
      variant="outline"
      className="gap-1.5 border-green-200 text-green-700 hover:bg-green-50"
    >
      <a href={href} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="h-3.5 w-3.5" />
        Share
      </a>
    </Button>
  );
}
