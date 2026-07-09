import { PageHeader } from "@/components/dashboard/page-header";
import { CourseFormDialog } from "@/components/courses/course-form-dialog";
import { CourseCard } from "@/components/courses/course-card";
import { getCurrentInstituteId } from "@/lib/queries/institute";
import { getCourses } from "@/lib/queries/courses-queries";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const instituteId = await getCurrentInstituteId();
  const courses = await getCourses(instituteId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses & Batches"
        description="Manage what you teach and how it's scheduled."
        action={<CourseFormDialog />}
      />

      {courses.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            No courses yet — add your first course to start admitting students.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
