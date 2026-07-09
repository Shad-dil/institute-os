"use client";

import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdmissionFormValues, CourseFeeOption } from "@/types/admission";

interface CourseFeeStepProps {
  courses: CourseFeeOption[];
}

export function CourseFeeStep({ courses }: CourseFeeStepProps) {
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<AdmissionFormValues>();

  const courseId = watch("courseId");
  const feeAmount = watch("feeAmount");
  const advanceAmount = watch("advanceAmount");

  useEffect(() => {
    const course = courses.find((c) => c.id === courseId);
    if (course && (!feeAmount || feeAmount === 0)) {
      setValue("feeAmount", course.fees);
    }
    // Course changed — any previously selected batch belonged to the old
    // course and no longer applies.
    setValue("batchId", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const selectedCourse = courses.find((c) => c.id === courseId);
  const balanceAfterAdvance = Math.max((feeAmount || 0) - (advanceAmount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Course</Label>
        <Controller
          control={control}
          name="courseId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name} · {course.duration}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.courseId && <p className="text-xs text-red-600">{errors.courseId.message}</p>}
        {selectedCourse && (
          <p className="text-xs text-slate-400">
            Standard fee: ₹{selectedCourse.fees.toLocaleString("en-IN")} · {selectedCourse.duration}
          </p>
        )}
      </div>

      {selectedCourse && selectedCourse.batches.length > 0 && (
        <div className="space-y-1.5">
          <Label>Batch (optional)</Label>
          <Controller
            control={control}
            name="batchId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="No specific batch" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCourse.batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.name} — {batch.schedule}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="feeAmount">Total Fee (₹)</Label>
          <Input id="feeAmount" type="number" min={1} {...register("feeAmount", { valueAsNumber: true })} />
          {errors.feeAmount && <p className="text-xs text-red-600">{errors.feeAmount.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dueDate">Balance Due Date</Label>
          <Input id="dueDate" type="date" {...register("dueDate")} />
          {errors.dueDate && <p className="text-xs text-red-600">{errors.dueDate.message}</p>}
        </div>
      </div>

      <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-700">Advance Payment Collected Today</p>
        <p className="mt-0.5 text-xs text-slate-500">
          Leave as 0 if the student hasn&apos;t paid anything yet.
        </p>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="advanceAmount">Amount (₹)</Label>
            <Input id="advanceAmount" type="number" min={0} {...register("advanceAmount", { valueAsNumber: true })} />
          </div>
          <div className="space-y-1.5">
            <Label>Method</Label>
            <Controller
              control={control}
              name="advanceMethod"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {advanceAmount > 0 && (
          <p className="mt-3 text-sm text-slate-600">
            Balance remaining after this payment:{" "}
            <span className="font-semibold text-slate-900">₹{balanceAfterAdvance.toLocaleString("en-IN")}</span>
          </p>
        )}
      </div>
    </div>
  );
}
