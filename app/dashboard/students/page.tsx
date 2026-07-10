import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { StudentsTable } from "@/components/students/students-table";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { getCurrentInstituteId } from "@/lib/queries/institute";
import { getStudents } from "@/lib/queries/students-queries";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const instituteId = await getCurrentInstituteId();
  const students = await getStudents(instituteId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description={`${students.length} student${students.length === 1 ? "" : "s"} enrolled`}
        action={
          <Button className="gap-1.5">
            <Link href="/dashboard/admissions">
              <UserPlus className="h-4 w-4" />
              Add Student
            </Link>
          </Button>
        }
      />

      <StudentsTable students={students} />
    </div>
  );
}
