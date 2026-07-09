import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentInstituteId } from "@/lib/queries/institute";
import { getPaymentHistory } from "@/lib/queries/fees-queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await params;
  const instituteId = await getCurrentInstituteId();

  const owned = await prisma.invoice.findFirst({
    where: { id: invoiceId, student: { instituteId } },
    select: { id: true },
  });

  if (!owned) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const payments = await getPaymentHistory(invoiceId);
  return NextResponse.json(payments);
}
