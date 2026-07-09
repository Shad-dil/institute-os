import { PageHeader } from "@/components/dashboard/page-header";
import { FeeOverviewCards } from "@/components/fees/fee-overview-cards";
import { FeesTable } from "@/components/fees/fees-table";
import { getCurrentInstituteId } from "@/lib/queries/institute";
import { getFeeOverview, getInvoices } from "@/lib/queries/fees-queries";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FeesPage() {
  const instituteId = await getCurrentInstituteId();

  const [overview, invoices, institute] = await Promise.all([
    getFeeOverview(instituteId),
    getInvoices(instituteId),
    prisma.institute.findUnique({
      where: { id: instituteId },
      select: { name: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fees"
        description="Collect payments, send reminders, and track who owes what."
      />

      <FeeOverviewCards overview={overview} />

      <FeesTable invoices={invoices} instituteName={institute?.name} />
    </div>
  );
}
