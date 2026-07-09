import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMISSION_STEPS } from "@/types/admission";

interface StepIndicatorProps {
  currentStep: number; // 0-indexed
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center">
      {ADMISSION_STEPS.map((label, index) => {
        const isComplete = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                  isComplete && "bg-blue-600 text-white",
                  isCurrent && "bg-blue-50 text-blue-600 ring-2 ring-blue-600",
                  !isComplete && !isCurrent && "bg-slate-100 text-slate-400"
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span
                className={cn(
                  "whitespace-nowrap text-xs font-medium",
                  isCurrent ? "text-slate-900" : "text-slate-400"
                )}
              >
                {label}
              </span>
            </div>
            {index < ADMISSION_STEPS.length - 1 && (
              <div className={cn("mx-2 h-0.5 flex-1", isComplete ? "bg-blue-600" : "bg-slate-100")} />
            )}
          </div>
        );
      })}
    </div>
  );
}
