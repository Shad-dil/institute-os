"use client";

import { useFormContext } from "react-hook-form";
import type { AdmissionFormValues, CourseFeeOption } from "@/types/admission";

interface ReviewStepProps {
  courses: CourseFeeOption[];
}

const METHOD_LABEL: Record<string, string> = {
  CASH: "Cash",
  UPI: "UPI",
  CARD: "Card",
  BANK_TRANSFER: "Bank Transfer",
  OTHER: "Other",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

export function ReviewStep({ courses }: ReviewStepProps) {
  const { getValues } = useFormContext<AdmissionFormValues>();
  const values = getValues();
  const course = courses.find((c) => c.id === values.courseId);
  const batch = course?.batches.find((b) => b.id === values.batchId);
  const balance = Math.max((values.feeAmount || 0) - (values.advanceAmount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-100 divide-y divide-slate-100">
        <div className="px-4">
          <Row label="Student" value={values.name} />
          <Row label="Phone" value={values.phone} />
          {values.email && <Row label="Email" value={values.email} />}
        </div>
        {(values.parentName || values.parentPhone) && (
          <div className="px-4">
            {values.parentName && <Row label="Guardian" value={values.parentName} />}
            {values.parentPhone && <Row label="Guardian Phone" value={values.parentPhone} />}
          </div>
        )}
        <div className="px-4">
          <Row label="Course" value={course?.name ?? "—"} />
          {batch && <Row label="Batch" value={`${batch.name} (${batch.schedule})`} />}
          <Row label="Duration" value={course?.duration ?? "—"} />
          <Row label="Total Fee" value={`₹${(values.feeAmount || 0).toLocaleString("en-IN")}`} />
          <Row label="Due Date" value={values.dueDate} />
        </div>
      </div>

      <div className="rounded-lg bg-blue-50 p-4">
        {values.advanceAmount > 0 ? (
          <>
            <Row
              label={`Advance Paid (${METHOD_LABEL[values.advanceMethod]})`}
              value={`₹${values.advanceAmount.toLocaleString("en-IN")}`}
            />
            <Row label="Balance Due" value={`₹${balance.toLocaleString("en-IN")}`} />
          </>
        ) : (
          <p className="text-sm text-blue-700">
            No advance recorded — the full ₹{(values.feeAmount || 0).toLocaleString("en-IN")} will be
            marked pending, due {values.dueDate}.
          </p>
        )}
      </div>

      <p className="text-xs text-slate-400">
        This will create the student record and a fee invoice automatically — no separate step needed.
      </p>
    </div>
  );
}
