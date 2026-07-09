"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { SimplePagination } from "@/components/ui-extra/simple-pagination";
import type { TestSummary } from "@/types/tests";

interface TestsListTableProps {
  tests: TestSummary[];
}

const PAGE_SIZE = 8;

export function TestsListTable({ tests }: TestsListTableProps) {
  const [page, setPage] = useState(0);

  const pageCount = Math.max(Math.ceil(tests.length / PAGE_SIZE), 1);
  const visibleTests = useMemo(
    () => tests.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [tests, page],
  );

  if (tests.length === 0) {
    return (
      <Card className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <p className="text-sm text-slate-500">
          No tests yet. Create your first test to start tracking marks and
          sharing results.
        </p>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="divide-y divide-slate-100">
        {visibleTests.map((test) => {
          const complete =
            test.totalStudents > 0 && test.marksEntered >= test.totalStudents;
          return (
            <Link
              key={test.id}
              href={`/dashboard/tests/${test.id}`}
              className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-slate-50"
            >
              <div>
                <p className="font-medium text-slate-900">{test.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {test.courseName} · {test.testDate} · Out of {test.maxMarks}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={
                    complete
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                  }
                >
                  {test.marksEntered}/{test.totalStudents} entered
                </Badge>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </div>
            </Link>
          );
        })}
      </div>

      <SimplePagination
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        totalItems={tests.length}
        pageSize={PAGE_SIZE}
      />
    </Card>
  );
}
