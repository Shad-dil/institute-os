"use server"; // This must be at the very top of the file

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function markAsPaid(formData: FormData) {
  const invoiceId = formData.get("invoiceId") as string;

  if (!invoiceId) return;

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: "PAID",
      paidAt: new Date(),
    },
  });

  // Clear caches and update the screens instantly
  revalidatePath("/dashboard/billing");
  revalidatePath("/dashboard");
}
