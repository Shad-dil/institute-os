import { PageHeader } from "@/components/dashboard/page-header";
import { InstituteBrandingForm } from "@/components/settings/institute-branding-form";
import { getCurrentInstituteId } from "@/lib/queries/institute";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const instituteId = await getCurrentInstituteId();
  const institute = await prisma.institute.findUnique({
    where: { id: instituteId },
    select: { logoUrl: true, signatureUrl: true, signatoryName: true },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Settings" description="Institute profile and receipt branding." />

      <InstituteBrandingForm
        logoUrl={institute?.logoUrl ?? null}
        signatureUrl={institute?.signatureUrl ?? null}
        signatoryName={institute?.signatoryName ?? null}
      />
    </div>
  );
}
