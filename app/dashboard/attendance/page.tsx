import { PageHeader } from "@/components/dashboard/page-header";
import { AttendanceFilters } from "@/components/attendance/attendance-filters";
import { AttendanceSummaryCards } from "@/components/attendance/attendance-summary-cards";
import { AttendanceBoard } from "@/components/attendance/attendance-board";
import { getCurrentInstituteId } from "@/lib/queries/institute";
import { getCourseOptions } from "@/lib/queries/tests-queries";
import { getBatchesForCourse } from "@/lib/queries/courses-queries";
import { getAttendanceBoard } from "@/lib/queries/attendance-queries";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface AttendancePageProps {
  searchParams: Promise<{ courseId?: string; batchId?: string; date?: string }>;
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export default async function AttendancePage({ searchParams }: AttendancePageProps) {
  const params = await searchParams;
  const instituteId = await getCurrentInstituteId();
  const courses = await getCourseOptions(instituteId);

  const courseId = params.courseId || courses[0]?.id || "";
  const batchId = params.batchId || "";
  const dateISO = params.date || todayISO();
  const date = new Date(`${dateISO}T00:00:00`);
  const dateLabel = date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const [board, institute, batches] = await Promise.all([
    courseId
      ? getAttendanceBoard(courseId, date, batchId || undefined)
      : Promise.resolve({ students: [], summary: { present: 0, absent: 0, late: 0, notMarked: 0, total: 0 } }),
    prisma.institute.findUnique({ where: { id: instituteId }, select: { name: true } }),
    courseId ? getBatchesForCourse(courseId) : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Mark attendance for a course or batch — guardians are notified automatically on absence."
      />

      {courses.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="text-sm font-medium text-amber-800">No courses set up yet</p>
          <p className="mt-1 text-sm text-amber-700">Add a course before taking attendance.</p>
        </div>
      ) : (
        <>
          <AttendanceFilters
            courses={courses}
            batches={batches.map((b) => ({ id: b.id, name: b.name, schedule: b.schedule }))}
            courseId={courseId}
            batchId={batchId}
            dateISO={dateISO}
          />
          <AttendanceSummaryCards summary={board.summary} />
          <AttendanceBoard
            key={`${courseId}-${batchId}-${dateISO}`}
            courseId={courseId}
            batchId={batchId || undefined}
            dateISO={dateISO}
            dateLabel={dateLabel}
            instituteName={institute?.name ?? "your institute"}
            initialStudents={board.students}
          />
        </>
      )}
    </div>
  );
}
