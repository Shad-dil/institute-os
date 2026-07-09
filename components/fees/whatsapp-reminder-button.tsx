"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsAppReminderButtonProps {
  phone: string;
  studentName: string;
  amountDue: number;
  dueDate: string;
  instituteName?: string;
}

/** Normalizes an Indian 10-digit number to the country-code format
 *  wa.me requires. If the number already has a country code, leaves it. */
function toWhatsAppNumber(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, "");
  if (digitsOnly.length === 10) return `91${digitsOnly}`;
  return digitsOnly;
}

export function WhatsAppReminderButton({
  phone,
  studentName,
  amountDue,
  dueDate,
  instituteName = "your institute",
}: WhatsAppReminderButtonProps) {
  const message = `Hi ${studentName}, this is a reminder from ${instituteName} — your fee payment of ₹${amountDue.toLocaleString(
    "en-IN"
  )} was due on ${dueDate}. Please pay at your earliest convenience. Thank you!`;

  const href = `https://wa.me/${toWhatsAppNumber(phone)}?text=${encodeURIComponent(message)}`;

  return (
    <Button variant="outline" size="sm" asChild className="gap-1.5 border-green-200 text-green-700 hover:bg-green-50">
      <a href={href} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="h-3.5 w-3.5" />
        Remind
      </a>
    </Button>
  );
}
