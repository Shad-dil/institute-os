import { PageHeader } from "@/components/dashboard/page-header";
import { AdmissionWizard } from "@/components/admissions/admission-wizard";
import { getCurrentInstituteId } from "@/lib/queries/institute";
import { getAdmissionCourseOptions } from "@/lib/queries/admissions-queries";

export const dynamic = "force-dynamic";

export default async function AdmissionsPage() {
  const instituteId = await getCurrentInstituteId();
  const courses = await getAdmissionCourseOptions(instituteId);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="New Admission"
        description="Add a student, set their fee, and record any advance payment — all in one go."
      />

      {courses.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="text-sm font-medium text-amber-800">No courses set up yet</p>
          <p className="mt-1 text-sm text-amber-700">
            Add at least one course before admitting students, so there's something to enroll them into.
          </p>
        </div>
      ) : (
        <AdmissionWizard courses={courses} />
      )}
    </div>
  );
}
