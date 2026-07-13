"use client";

import { useState } from "react";
import { InquiriesTable } from "@/components/inquiries/inquiries-table";
import { InquiryDetailDrawer } from "@/components/inquiries/inquiry-detail-drawer";
import type { InquiryRow } from "@/types/inquiries";

interface InquiriesClientProps {
  inquiries: InquiryRow[];
  instituteName: string;
}

export function InquiriesClient({ inquiries, instituteName }: InquiriesClientProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <InquiriesTable inquiries={inquiries} instituteName={instituteName} onSelect={setSelectedId} />
      <InquiryDetailDrawer
        inquiryId={selectedId}
        instituteName={instituteName}
        onOpenChange={(open) => !open && setSelectedId(null)}
      />
    </>
  );
}
