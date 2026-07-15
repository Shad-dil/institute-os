"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import type { InvoiceRow, PaymentRecord } from "@/types/fees";

interface ReceiptDialogProps {
  invoice: InvoiceRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const METHOD_LABEL: Record<string, string> = {
  CASH: "Cash",
  UPI: "UPI",
  CARD: "Card",
  BANK_TRANSFER: "Bank Transfer",
  OTHER: "Other",
};

export function ReceiptDialog({
  invoice,
  open,
  onOpenChange,
}: ReceiptDialogProps) {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !invoice) return;
    setLoading(true);
    fetch(`/api/fees/${invoice.id}/payments`)
      .then((res) => res.json())
      .then((data: PaymentRecord[]) => setPayments(data))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, [open, invoice]);

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment History — {invoice.studentName}</DialogTitle>
          <DialogDescription>{invoice.course}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm">
            <span className="text-slate-500">Total Fee</span>
            <span className="font-semibold text-slate-900">
              ₹{invoice.totalAmount.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm">
            <span className="text-slate-500">Paid So Far</span>
            <span className="font-semibold text-green-600">
              ₹{invoice.amountPaid.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm">
            <span className="text-slate-500">Balance Due</span>
            <span className="font-semibold text-slate-900">
              ₹{invoice.balanceDue.toLocaleString("en-IN")}
            </span>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Transactions
            </p>
            {loading ? (
              <p className="py-4 text-center text-sm text-slate-400">
                Loading…
              </p>
            ) : payments.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400">
                No payments recorded yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {payments.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2.5 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">
                        ₹{p.amount.toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-slate-400">
                        {METHOD_LABEL[p.method] ?? p.method} · {p.paidAt}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 px-2 text-xs text-slate-500"
                      >
                        <a
                          href={`/api/receipts/${p.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          View / Print
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 px-2 text-xs text-slate-500"
                      >
                        <a href={`/api/receipts/${p.id}/pdf?download=true`}>
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
