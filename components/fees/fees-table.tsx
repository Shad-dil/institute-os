"use client";

import { useMemo, useState } from "react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, ArrowUpDown, Wallet, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { FeeStatusBadge } from "@/components/fees/fee-status-badge";
import { WhatsAppReminderButton } from "@/components/fees/whatsapp-reminder-button";
import { RecordPaymentDialog } from "@/components/fees/record-payment-dialog";
import { ReceiptDialog } from "@/components/fees/receipt-dialog";
import type { FeeStatus, InvoiceRow } from "@/types/fees";

interface FeesTableProps {
  invoices: InvoiceRow[];
  instituteName?: string;
}

const FILTERS: { label: string; value: FeeStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Overdue", value: "OVERDUE" },
  { label: "Pending", value: "PENDING" },
  { label: "Partial", value: "PARTIAL" },
  { label: "Paid", value: "PAID" },
];

export function FeesTable({ invoices, instituteName }: FeesTableProps) {
  const [filter, setFilter] = useState<FeeStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [paymentTarget, setPaymentTarget] = useState<InvoiceRow | null>(null);
  const [receiptTarget, setReceiptTarget] = useState<InvoiceRow | null>(null);

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesFilter = filter === "all" || inv.status === filter;
      const matchesSearch =
        search.trim() === "" || inv.studentName.toLowerCase().includes(search.trim().toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [invoices, filter, search]);

  const columns = useMemo<ColumnDef<InvoiceRow>[]>(
    () => [
      {
        accessorKey: "studentName",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Student <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-slate-100 text-xs font-medium text-slate-600">
                {row.original.avatarInitials}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-slate-900">{row.original.studentName}</span>
          </div>
        ),
      },
      {
        accessorKey: "course",
        header: "Course",
        cell: ({ row }) => <span className="text-slate-600">{row.original.course}</span>,
      },
      {
        accessorKey: "totalAmount",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Total <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-slate-600">₹{row.original.totalAmount.toLocaleString("en-IN")}</span>
        ),
      },
      {
        accessorKey: "balanceDue",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Balance Due <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-medium text-slate-900">
            {row.original.balanceDue > 0 ? `₹${row.original.balanceDue.toLocaleString("en-IN")}` : "—"}
          </span>
        ),
      },
      {
        accessorKey: "dueDate",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Due Date <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => <span className="text-slate-600">{row.original.dueDate}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <FeeStatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const inv = row.original;
          return (
            <div className="flex items-center gap-2">
              {inv.status !== "PAID" && (
                <Button size="sm" className="gap-1.5" onClick={() => setPaymentTarget(inv)}>
                  <Wallet className="h-3.5 w-3.5" />
                  Collect
                </Button>
              )}
              {inv.status !== "PAID" && (
                <WhatsAppReminderButton
                  phone={inv.studentPhone}
                  studentName={inv.studentName}
                  amountDue={inv.balanceDue}
                  dueDate={inv.dueDate}
                  instituteName={instituteName}
                />
              )}
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-slate-500"
                onClick={() => setReceiptTarget(inv)}
              >
                <Receipt className="h-3.5 w-3.5" />
                History
              </Button>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [instituteName]
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <>
      <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  setFilter(item.value);
                  table.setPageIndex(0);
                }}
                className={cn(
                  "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  filter === item.value
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search student…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                table.setPageIndex(0);
              }}
              className="pl-9"
            />
          </div>
        </div>

        {table.getRowModel().rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-400">
            {invoices.length === 0 ? "No fee records yet." : "No students match this filter."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400"
                  >
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-4 py-3 font-medium">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      <RecordPaymentDialog
        invoice={paymentTarget}
        open={paymentTarget !== null}
        onOpenChange={(open) => !open && setPaymentTarget(null)}
      />
      <ReceiptDialog
        invoice={receiptTarget}
        open={receiptTarget !== null}
        onOpenChange={(open) => !open && setReceiptTarget(null)}
      />
    </>
  );
}
