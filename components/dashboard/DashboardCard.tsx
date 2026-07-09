import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const dashboardCardVariants = cva(
  "rounded-2xl p-6 transition-all duration-200 border",
  {
    variants: {
      variant: {
        default:
          "bg-white border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1",

        glass: "border-white/20 bg-white/60 backdrop-blur-xl shadow-sm",

        gradient:
          "bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-transparent shadow-lg",
      },
    },

    defaultVariants: {
      variant: "default",
    },
  },
);

interface DashboardCardProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dashboardCardVariants> {}

export function DashboardCard({
  className,
  variant,
  ...props
}: DashboardCardProps) {
  return (
    <div
      className={cn(dashboardCardVariants({ variant }), className)}
      {...props}
    />
  );
}
