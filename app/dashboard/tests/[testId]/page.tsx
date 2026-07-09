import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { MarksEntryTable } from "@/components/tests/marks-entry-table";
import { ToppersShareButton } from "@/components/tests/toppers-share-button";
import { getTestDetail } from "@/lib/queries/tests-queries";

export const dynamic = "force-dynamic";

interface TestDetailPageProps {
  params: Promise<{ testId: string }>;
}

export default async function TestDetailPage({ params }: TestDetailPageProps) {
  const { testId } = await params;
  const test = await getTestDetail(testId);

  if (!test) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/tests"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Tests
      </Link>

      <PageHeader
        title={test.name}
        description={`${test.courseName} · ${test.testDate}`}
        action={
          <ToppersShareButton
            results={test.results}
            testName={test.name}
            maxMarks={test.maxMarks}
            instituteName={test.instituteName}
          />
        }
      />

      <MarksEntryTable test={test} />
    </div>
  );
}
