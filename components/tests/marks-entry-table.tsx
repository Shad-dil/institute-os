"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RankBadge } from "@/components/tests/rank-badge";
import { ReportCardShareButton } from "@/components/tests/report-card-share-button";
// import { saveMarks } from "@/lib/actions/test-actions";
import { toast } from "sonner";
import type { TestDetail } from "@/types/tests";
import { saveMarks } from "@/lib/action/test-actions";

interface MarksEntryTableProps {
  test: TestDetail;
}

export function MarksEntryTable({ test }: MarksEntryTableProps) {
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      test.results.map((r) => [r.studentId, r.marksObtained?.toString() ?? ""]),
    ),
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const dirtyCount = test.results.filter(
    (r) => (drafts[r.studentId] ?? "") !== (r.marksObtained?.toString() ?? ""),
  ).length;

  function handleSave() {
    const entries = Object.entries(drafts)
      .filter(([, value]) => value.trim() !== "")
      .map(([studentId, value]) => ({
        studentId,
        marksObtained: Number(value),
      }));

    if (entries.length === 0) {
      toast.error("Enter at least one student's marks first");
      return;
    }

    startTransition(async () => {
      const result = await saveMarks(test.id, test.maxMarks, entries);
      if (result.success) {
        toast.success(
          `Saved marks for ${result.savedCount} student${result.savedCount === 1 ? "" : "s"}`,
        );
        router.refresh();
      } else {
        toast.error(result.error ?? "Couldn't save marks");
      }
    });
  }

  return (
    <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Enter Marks</h3>
          <p className="text-xs text-slate-500">
            Out of {test.maxMarks} · {test.results.length} students
          </p>
        </div>
        <Button onClick={handleSave} disabled={isPending || dirtyCount === 0}>
          {isPending
            ? "Saving…"
            : dirtyCount > 0
              ? `Save ${dirtyCount} Change${dirtyCount === 1 ? "" : "s"}`
              : "Saved"}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 font-medium">Rank</th>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Marks</th>
              <th className="px-4 py-3 font-medium">%</th>
              <th className="px-4 py-3 font-medium">Share</th>
            </tr>
          </thead>
          <tbody>
            {test.results.map((row) => (
              <tr
                key={row.studentId}
                className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
              >
                <td className="px-4 py-2.5">
                  <RankBadge rank={row.rank} />
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-slate-100 text-xs font-medium text-slate-600">
                        {row.avatarInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-slate-900">
                      {row.studentName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <Input
                    type="number"
                    min={0}
                    max={test.maxMarks}
                    value={drafts[row.studentId] ?? ""}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [row.studentId]: e.target.value,
                      }))
                    }
                    placeholder="—"
                    className="h-9 w-24"
                  />
                </td>
                <td className="px-4 py-2.5 text-slate-600">
                  {row.percentage !== null ? `${row.percentage}%` : "—"}
                </td>
                <td className="px-4 py-2.5">
                  <ReportCardShareButton
                    result={row}
                    testName={test.name}
                    maxMarks={test.maxMarks}
                    totalStudents={test.results.length}
                    instituteName={test.instituteName}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
