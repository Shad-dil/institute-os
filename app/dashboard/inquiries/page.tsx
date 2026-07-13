import { PageHeader } from "@/components/dashboard/page-header";
import { InquiryFormDialog } from "@/components/inquiries/inquiry-form-dialog";
import { InquiriesFunnelCards } from "@/components/inquiries/inquiries-funnel-cards";
import { InquiriesClient } from "@/components/inquiries/inquiries-client";
import { getCurrentInstituteId } from "@/lib/queries/institute";
import { getInquiries, getFunnelStats } from "@/lib/queries/inquiries-queries";
import { getCourseOptions } from "@/lib/queries/tests-queries";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function InquiriesPage() {
  const instituteId = await getCurrentInstituteId();

  const [inquiries, stats, courses, institute] = await Promise.all([
    getInquiries(instituteId),
    getFunnelStats(instituteId),
    getCourseOptions(instituteId),
    prisma.institute.findUnique({ where: { id: instituteId }, select: { name: true } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inquiries"
        description="Track leads from first contact to admission."
        action={<InquiryFormDialog courses={courses} />}
      />

      <InquiriesFunnelCards stats={stats} />

      <InquiriesClient inquiries={inquiries} instituteName={institute?.name ?? "your institute"} />
    </div>
  );
}
