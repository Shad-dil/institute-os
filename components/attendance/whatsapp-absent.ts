function toWhatsAppNumber(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, "");
  if (digitsOnly.length === 10) return `91${digitsOnly}`;
  return digitsOnly;
}

interface AbsentNotifyTarget {
  href: string;
  sentTo: "guardian" | "student";
}

/** Guardian's phone is preferred — that's who should actually get an
 *  absence notice. Falls back to the student's own number only if no
 *  guardian number is on file, and adjusts the message wording either way. */
export function buildAbsentNotification(params: {
  studentName: string;
  studentPhone: string;
  parentPhone: string | null;
  dateLabel: string;
  instituteName: string;
}): AbsentNotifyTarget | null {
  const { studentName, studentPhone, parentPhone, dateLabel, instituteName } = params;

  const targetPhone = parentPhone || studentPhone;
  if (!targetPhone) return null;

  const sentTo: "guardian" | "student" = parentPhone ? "guardian" : "student";

  const message =
    sentTo === "guardian"
      ? `Hi, this is ${instituteName}. ${studentName} was marked ABSENT today (${dateLabel}). Please let us know if there's a reason we should be aware of. Thank you.`
      : `Hi ${studentName}, this is ${instituteName}. You were marked ABSENT today (${dateLabel}). Please reach out if there's a reason we should know about.`;

  return {
    href: `https://wa.me/${toWhatsAppNumber(targetPhone)}?text=${encodeURIComponent(message)}`,
    sentTo,
  };
}
