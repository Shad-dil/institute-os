import { PageHeader } from "@/components/dashboard/page-header";
import { NewTestDialog } from "@/components/tests/new-test-dialog";
import { TestsListTable } from "@/components/tests/tests-list-table";
import { getCurrentInstituteId } from "@/lib/queries/institute";
import { getTests, getCourseOptions } from "@/lib/queries/tests-queries";

export const dynamic = "force-dynamic";

export default async function TestsPage() {
  const instituteId = await getCurrentInstituteId();

  const [tests, courses] = await Promise.all([
    getTests(instituteId),
    getCourseOptions(instituteId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tests & Results"
        description="Enter marks after each test, share results with parents in one tap."
        action={<NewTestDialog courses={courses} />}
      />

      <TestsListTable tests={tests} />
    </div>
  );
}
