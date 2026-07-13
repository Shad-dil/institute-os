"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsAppInquiryButtonProps {
  phone: string;
  name: string;
  courseName: string | null;
  instituteName: string;
}

function toWhatsAppNumber(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, "");
  if (digitsOnly.length === 10) return `91${digitsOnly}`;
  return digitsOnly;
}

export function WhatsAppInquiryButton({
  phone,
  name,
  courseName,
  instituteName,
}: WhatsAppInquiryButtonProps) {
  const message = courseName
    ? `Hi ${name}, thank you for your interest in ${courseName} at ${instituteName}! Let us know if you have any questions — happy to help you get started.`
    : `Hi ${name}, thank you for reaching out to ${instituteName}! Let us know which course you're interested in and we'll share all the details.`;

  const href = `https://wa.me/${toWhatsAppNumber(phone)}?text=${encodeURIComponent(message)}`;

  return (
    <Button
      size="sm"
      variant="outline"
      className="gap-1.5 border-green-200 text-green-700 hover:bg-green-50"
    >
      <a href={href} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="h-3.5 w-3.5" />
        Send Info
      </a>
    </Button>
  );
}
