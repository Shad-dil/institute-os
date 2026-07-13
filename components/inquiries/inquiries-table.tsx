"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { InquiryStatusBadge } from "@/components/inquiries/inquiry-status-badge";
import { WhatsAppInquiryButton } from "@/components/inquiries/whatsapp-inquiry-button";
import type { InquiryRow, InquiryStatus } from "@/types/inquiries";

interface InquiriesTableProps {
  inquiries: InquiryRow[];
  instituteName: string;
  onSelect: (id: string) => void;
}

const FILTERS: { label: string; value: InquiryStatus | "all" | "overdue" }[] = [
  { label: "All", value: "all" },
  { label: "Follow-up Due", value: "overdue" },
  { label: "New", value: "NEW" },
  { label: "Interested", value: "INTERESTED" },
  { label: "Converted", value: "CONVERTED" },
  { label: "Lost", value: "LOST" },
];

export function InquiriesTable({ inquiries, instituteName, onSelect }: InquiriesTableProps) {
  const [filter, setFilter] = useState<InquiryStatus | "all" | "overdue">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return inquiries.filter((i) => {
      const matchesFilter =
        filter === "all" ? true : filter === "overdue" ? i.isFollowUpOverdue : i.status === filter;
      const matchesSearch = search.trim() === "" || i.name.toLowerCase().includes(search.trim().toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [inquiries, filter, search]);

  return (
    <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={cn(
                "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                filter === item.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">
          {inquiries.length === 0 ? "No inquiries logged yet." : "No inquiries match this filter."}
        </p>
      ) : (
        <ul className="divide-y divide-slate-50">
          {filtered.map((inquiry) => (
            <li
              key={inquiry.id}
              className={cn(
                "flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-slate-50",
                inquiry.isFollowUpOverdue && "bg-red-50/40"
              )}
            >
              <button onClick={() => onSelect(inquiry.id)} className="min-w-0 flex-1 text-left">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-slate-900">{inquiry.name}</p>
                  <InquiryStatusBadge status={inquiry.status} />
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  {inquiry.phone}
                  {inquiry.courseName && ` · ${inquiry.courseName}`}
                  {inquiry.referredByName && ` · Referred by ${inquiry.referredByName}`}
                </p>
                {inquiry.nextFollowUpAt && (
                  <p className={cn("mt-0.5 text-xs", inquiry.isFollowUpOverdue ? "font-medium text-red-600" : "text-slate-400")}>
                    Follow up {inquiry.isFollowUpOverdue ? "was due" : "due"} {inquiry.nextFollowUpAt}
                  </p>
                )}
              </button>

              <div className="flex shrink-0 items-center gap-2">
                <WhatsAppInquiryButton
                  phone={inquiry.phone}
                  name={inquiry.name}
                  courseName={inquiry.courseName}
                  instituteName={instituteName}
                />
                <Button variant="ghost" size="sm" className="gap-1.5 text-slate-500" onClick={() => onSelect(inquiry.id)}>
                  <User className="h-3.5 w-3.5" />
                  Details
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
