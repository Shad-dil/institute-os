"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { recordPayment } from "@/lib/actions/fee-actions";
import { toast } from "sonner";
import type { InvoiceRow } from "@/types/fees";
import { recordPayment } from "@/lib/action/fee-actions";

interface RecordPaymentDialogProps {
  invoice: InvoiceRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecordPaymentDialog({
  invoice,
  open,
  onOpenChange,
}: RecordPaymentDialogProps) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [isPending, startTransition] = useTransition();

  if (!invoice) return null;

  const balance = invoice.balanceDue;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!invoice) return;

    const formData = new FormData();
    formData.set("invoiceId", invoice.id);
    formData.set("amount", amount);
    formData.set("method", method);

    startTransition(async () => {
      const result = await recordPayment(formData);
      if (result.success) {
        toast.success(
          `₹${Number(amount).toLocaleString("en-IN")} recorded for ${invoice.studentName}`,
        );
        setAmount("");
        onOpenChange(false);
      } else {
        toast.error(result.error ?? "Couldn't record payment");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Collect Fee — {invoice.studentName}</DialogTitle>
          <DialogDescription>
            {invoice.course} · Balance due:{" "}
            <span className="font-medium text-slate-900">
              ₹{balance.toLocaleString("en-IN")}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount Received</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                ₹
              </span>
              <Input
                id="amount"
                type="number"
                min={1}
                step="0.01"
                max={balance}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={balance.toString()}
                className="pl-7"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(balance.toString())}
              >
                Full amount (₹{balance.toLocaleString("en-IN")})
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="method">Payment Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger id="method">
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
          </div>

          {Number(amount) > 0 && Number(amount) < balance && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              This is a partial payment. ₹
              {(balance - Number(amount)).toLocaleString("en-IN")} will still be
              due after this.
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !amount}>
              {isPending ? "Recording…" : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
