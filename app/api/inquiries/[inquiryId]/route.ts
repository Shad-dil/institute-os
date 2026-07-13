import { NextResponse } from "next/server";
import { getCurrentInstituteId } from "@/lib/queries/institute";
import { getInquiryDetail } from "@/lib/queries/inquiries-queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ inquiryId: string }> }
) {
  const { inquiryId } = await params;
  const instituteId = await getCurrentInstituteId();
  const inquiry = await getInquiryDetail(inquiryId, instituteId);

  if (!inquiry) {
    return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  }

  return NextResponse.json(inquiry);
}
