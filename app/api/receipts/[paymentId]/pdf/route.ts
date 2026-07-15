import React from "react";
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getCurrentInstituteId } from "@/lib/queries/institute";
import { getReceiptData } from "@/lib/queries/receipts-queries";
import { ReceiptDocument } from "@/lib/receipts/receipt-document";

export const runtime = "nodejs"; // @react-pdf/renderer needs the Node runtime, not Edge

export async function GET(
  request: Request,
  { params }: { params: Promise<{ paymentId: string }> },
) {
  const { paymentId } = await params;
  const instituteId = await getCurrentInstituteId();

  const data = await getReceiptData(paymentId, instituteId);
  if (!data) {
    return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
  }

  // const buffer = await renderToBuffer(<ReceiptDocument data={data} />);
  const buffer = await renderToBuffer(
    // `renderToBuffer` expects a React element whose top-level is a `Document`.
    // Cast here to satisfy the TypeScript signature while keeping runtime behavior.
    React.createElement(ReceiptDocument, {
      data,
    }) as unknown as React.ReactElement<
      import("@react-pdf/renderer").DocumentProps
    >,
  );

  const url = new URL(request.url);
  const forceDownload = url.searchParams.get("download") === "true";
  // "inline" opens the PDF in the browser's own viewer — that viewer has
  // a print button built in, which is what actually satisfies "print
  // directly" reliably, rather than fighting with custom print CSS.
  const disposition = forceDownload
    ? `attachment; filename="${data.receiptNumber}.pdf"`
    : `inline; filename="${data.receiptNumber}.pdf"`;

  // Convert Node Buffer to a `Uint8Array` / ArrayBuffer acceptable to NextResponse
  const body = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  // Cast to `BodyInit` to satisfy NextResponse's TypeScript signature
  const bodyInit = body as unknown as BodyInit;

  return new NextResponse(bodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": disposition,
    },
  });
}
