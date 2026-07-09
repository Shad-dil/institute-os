import { Card } from "@/components/ui/card";
import { Wallet, AlertTriangle, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeeOverview } from "@/types/fees";

interface FeeOverviewCardsProps {
  overview: FeeOverview;
}

export function FeeOverviewCards({ overview }: FeeOverviewCardsProps) {
  const cards = [
    {
      label: "Collected This Month",
      value: `₹${overview.collectedThisMonth.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      accent: "bg-green-50 text-green-600 ring-green-100",
    },
    {
      label: "Total Pending",
      value: `₹${overview.pendingAmount.toLocaleString("en-IN")}`,
      icon: Wallet,
      accent: "bg-amber-50 text-amber-600 ring-amber-100",
    },
    {
      label: "Overdue Amount",
      value: `₹${overview.overdueAmount.toLocaleString("en-IN")}`,
      icon: AlertTriangle,
      accent: "bg-red-50 text-red-600 ring-red-100",
      subtext:
        overview.overdueCount > 0
          ? `${overview.overdueCount} student${overview.overdueCount === 1 ? "" : "s"} need follow-up`
          : "Nobody is overdue 🎉",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-lg ring-4", card.accent)}>
            <card.icon className="h-5 w-5" strokeWidth={2} />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-500">{card.label}</p>
          <h3 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{card.value}</h3>
          {card.subtext && (
            <p
              className={cn(
                "mt-1.5 text-sm font-medium",
                overview.overdueCount > 0 ? "text-red-600" : "text-green-600"
              )}
            >
              {card.subtext}
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}
