import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentInstituteId } from "@/lib/queries/institute";
import { getStudentProfile } from "@/lib/queries/students-queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const { studentId } = await params;
  const instituteId = await getCurrentInstituteId();

  // Ownership check BEFORE fetching or returning anything. Returning 404
  // here (not 403) is deliberate — it doesn't confirm to a caller from
  // another institute that a student with this ID exists at all, it just
  // doesn't exist "for you".
  const owned = await prisma.student.findFirst({
    where: { id: studentId, instituteId },
    select: { id: true },
  });

  if (!owned) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const profile = await getStudentProfile(studentId);
  if (!profile) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}
