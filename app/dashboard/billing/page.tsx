import { PageHeader } from "@/components/dashboard/page-header";
import { FeeOverviewCards } from "@/components/fees/fee-overview-cards";
import { FeesTable } from "@/components/fees/fees-table";
// NEW — everything below this line is the only addition to this file.
// FeeOverviewCards, FeesTable, getFeeOverview, and getInvoices are
// exactly what they were before; nothing about them changed.
import { MonthlyRemindersBanner } from "@/components/fees/monthly-reminders-banner";
import { getUnreadFeeReminders } from "@/lib/queries/fee-reminders-queries";
import { getCurrentInstituteId } from "@/lib/queries/institute";
import { getFeeOverview, getInvoices } from "@/lib/queries/fees-queries";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FeesPage() {
  const instituteId = await getCurrentInstituteId();

  const [overview, invoices, institute, reminderNotices] = await Promise.all([
    getFeeOverview(instituteId),
    getInvoices(instituteId),
    prisma.institute.findUnique({ where: { id: instituteId }, select: { name: true } }),
    getUnreadFeeReminders(instituteId), // NEW
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fees"
        description="Collect payments, send reminders, and track who owes what."
      />

      {/* NEW — only renders when a monthly billing cycle has just
          generated new invoices. Fully self-contained; safe no-op for
          any institute not using monthly billing. */}
      <MonthlyRemindersBanner notices={reminderNotices} instituteName={institute?.name} />

      <FeeOverviewCards overview={overview} />

      <FeesTable invoices={invoices} instituteName={institute?.name} />
    </div>
  );
}
