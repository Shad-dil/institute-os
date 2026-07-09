"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { StepIndicator } from "@/components/admissions/step-indicator";
import { StudentInfoStep } from "@/components/admissions/steps/student-info-step";
import { GuardianInfoStep } from "@/components/admissions/steps/guardian-info-step";
import { CourseFeeStep } from "@/components/admissions/steps/course-fee-step";
import { ReviewStep } from "@/components/admissions/steps/review-step";
// import { createAdmission } from "@/lib/actions/admission-actions";
import type { AdmissionFormValues, CourseFeeOption } from "@/types/admission";
import { ADMISSION_STEPS } from "@/types/admission";
import { createAdmission } from "@/lib/action/admission-actions";

const admissionFormSchema = z.object({
  name: z.string().min(2, "Enter the student's full name"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit phone number"),
  parentName: z.string().optional().or(z.literal("")),
  parentPhone: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^\d{10}$/.test(v), {
      message: "Enter a valid 10-digit phone number",
    }),
  courseId: z.string().min(1, "Select a course"),
  batchId: z.string().optional().or(z.literal("")),
  feeAmount: z.coerce.number().positive("Fee must be greater than 0"),
  dueDate: z.string().min(1, "Select a due date"),
  advanceAmount: z.coerce.number().min(0).default(0),
  advanceMethod: z
    .enum(["CASH", "UPI", "CARD", "BANK_TRANSFER", "OTHER"])
    .default("CASH"),
});

const STEP_FIELDS: (keyof AdmissionFormValues)[][] = [
  ["name", "phone", "email"],
  ["parentName", "parentPhone"],
  [
    "courseId",
    "batchId",
    "feeAmount",
    "dueDate",
    "advanceAmount",
    "advanceMethod",
  ],
  [],
];

interface AdmissionWizardProps {
  courses: CourseFeeOption[];
}

export function AdmissionWizard({ courses }: AdmissionWizardProps) {
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const methods = useForm<AdmissionFormValues>({
    resolver: zodResolver(admissionFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      parentName: "",
      parentPhone: "",
      courseId: "",
      batchId: "",
      feeAmount: 0,
      dueDate: new Date().toISOString().split("T")[0],
      advanceAmount: 0,
      advanceMethod: "CASH",
    },
    mode: "onBlur",
  });

  async function handleNext() {
    const valid = await methods.trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => Math.min(s + 1, ADMISSION_STEPS.length - 1));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function handleSubmit(values: AdmissionFormValues) {
    startTransition(async () => {
      const result = await createAdmission(values);
      if (result.success) {
        toast.success(`${values.name} admitted successfully`);
        router.push("/dashboard/students");
      } else {
        toast.error(result.error ?? "Couldn't complete the admission");
      }
    });
  }

  return (
    <FormProvider {...methods}>
      <Card className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <StepIndicator currentStep={step} />

        <div className="mt-8">
          {step === 0 && <StudentInfoStep />}
          {step === 1 && <GuardianInfoStep />}
          {step === 2 && <CourseFeeStep courses={courses} />}
          {step === 3 && <ReviewStep courses={courses} />}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={step === 0}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {step < ADMISSION_STEPS.length - 1 ? (
            <Button type="button" onClick={handleNext} className="gap-1.5">
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={methods.handleSubmit(handleSubmit)}
              disabled={isPending}
              className="gap-1.5"
            >
              <UserPlus className="h-4 w-4" />
              {isPending ? "Admitting…" : "Confirm Admission"}
            </Button>
          )}
        </div>
      </Card>
    </FormProvider>
  );
}
