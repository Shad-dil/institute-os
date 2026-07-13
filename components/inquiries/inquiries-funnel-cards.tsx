import { Card } from "@/components/ui/card";
import { Users, TrendingUp, XCircle, Clock } from "lucide-react";
import type { InquiryFunnelStats } from "@/types/inquiries";

export function InquiriesFunnelCards({ stats }: { stats: InquiryFunnelStats }) {
  const cards = [
    {
      label: "Inquiries This Month",
      value: stats.totalThisMonth.toString(),
      icon: Users,
      accent: "bg-blue-50 text-blue-600 ring-blue-100",
    },
    {
      label: "Conversion Rate",
      value: `${stats.conversionRatePct}%`,
      icon: TrendingUp,
      accent: "bg-green-50 text-green-600 ring-green-100",
      subtext: `${stats.convertedThisMonth} converted, ${stats.lostThisMonth} lost this month`,
    },
    {
      label: "Open Leads",
      value: stats.openCount.toString(),
      icon: Clock,
      accent: "bg-amber-50 text-amber-600 ring-amber-100",
      subtext: "Not yet converted or lost",
    },
    {
      label: "Lost This Month",
      value: stats.lostThisMonth.toString(),
      icon: XCircle,
      accent: "bg-red-50 text-red-600 ring-red-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className={`flex h-11 w-11 items-center justify-center rounded-lg ring-4 ${card.accent}`}>
            <card.icon className="h-5 w-5" strokeWidth={2} />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-500">{card.label}</p>
          <h3 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{card.value}</h3>
          {card.subtext && <p className="mt-1.5 text-xs text-slate-400">{card.subtext}</p>}
        </Card>
      ))}
    </div>
  );
}
