"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdmissionFormValues } from "@/types/admission";

export function GuardianInfoStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<AdmissionFormValues>();

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Optional, but strongly recommended — this is the number report cards and fee reminders go to.
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="parentName">Parent / Guardian Name</Label>
        <Input id="parentName" {...register("parentName")} placeholder="e.g. Rajesh Sharma" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="parentPhone">Parent / Guardian Phone</Label>
        <Input
          id="parentPhone"
          {...register("parentPhone")}
          placeholder="10-digit mobile number"
          maxLength={10}
        />
        {errors.parentPhone && <p className="text-xs text-red-600">{errors.parentPhone.message}</p>}
      </div>
    </div>
  );
}
