"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentInstituteId } from "@/lib/queries/institute";

interface ActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

const createInquirySchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit phone number"),
  courseId: z.string().optional().or(z.literal("")),
  source: z.enum(["WALK_IN", "PHONE_CALL", "WHATSAPP", "REFERRAL", "SOCIAL_MEDIA", "OTHER"]),
  referredByName: z.string().optional().or(z.literal("")),
  nextFollowUpAt: z.string().optional().or(z.literal("")),
});

export async function createInquiry(formData: FormData): Promise<ActionResult> {
  const parsed = createInquirySchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    courseId: formData.get("courseId") || "",
    source: formData.get("source"),
    referredByName: formData.get("referredByName") || "",
    nextFollowUpAt: formData.get("nextFollowUpAt") || "",
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const instituteId = await getCurrentInstituteId();
    const data = parsed.data;

    // If a courseId was submitted, verify it actually belongs to this
    // institute before attaching it — same pattern as everywhere else a
    // client-submitted foreign ID gets used.
    if (data.courseId) {
      const course = await prisma.course.findFirst({ where: { id: data.courseId, instituteId }, select: { id: true } });
      if (!course) return { success: false, error: "That course wasn't found." };
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        name: data.name,
        phone: data.phone,
        courseId: data.courseId || null,
        source: data.source,
        referredByName: data.referredByName || null,
        nextFollowUpAt: data.nextFollowUpAt ? new Date(data.nextFollowUpAt) : null,
        instituteId,
      },
    });

    revalidatePath("/inquiries");
    return { success: true, id: inquiry.id };
  } catch {
    return { success: false, error: "Couldn't add this inquiry. Please try again." };
  }
}

const statusSchema = z.enum(["NEW", "CONTACTED", "INTERESTED", "NOT_INTERESTED", "CONVERTED", "LOST"]);

export async function updateInquiryStatus(inquiryId: string, status: string): Promise<ActionResult> {
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return { success: false, error: "Invalid status" };

  try {
    const instituteId = await getCurrentInstituteId();
    const owned = await prisma.inquiry.findFirst({ where: { id: inquiryId, instituteId }, select: { id: true } });
    if (!owned) return { success: false, error: "Inquiry not found." };

    await prisma.inquiry.update({ where: { id: inquiryId }, data: { status: parsed.data } });
    revalidatePath("/inquiries");
    revalidatePath(`/inquiries/${inquiryId}`);
    return { success: true };
  } catch {
    return { success: false, error: "Couldn't update status. Please try again." };
  }
}

const followUpSchema = z.object({
  inquiryId: z.string().min(1),
  note: z.string().min(1, "Note can't be empty").max(500),
  nextFollowUpAt: z.string().optional().or(z.literal("")),
});

export async function addInquiryFollowUp(input: {
  inquiryId: string;
  note: string;
  nextFollowUpAt?: string;
}): Promise<ActionResult> {
  const parsed = followUpSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const instituteId = await getCurrentInstituteId();
    const owned = await prisma.inquiry.findFirst({
      where: { id: parsed.data.inquiryId, instituteId },
      select: { id: true },
    });
    if (!owned) return { success: false, error: "Inquiry not found." };

    await prisma.$transaction([
      prisma.inquiryFollowUp.create({
        data: { inquiryId: parsed.data.inquiryId, note: parsed.data.note },
      }),
      prisma.inquiry.update({
        where: { id: parsed.data.inquiryId },
        data: {
          nextFollowUpAt: parsed.data.nextFollowUpAt ? new Date(parsed.data.nextFollowUpAt) : null,
          // Logging a follow-up implies contact happened — bump a brand
          // new lead out of "New" automatically rather than making staff
          // remember to also change the status by hand.
          status: "CONTACTED",
        },
      }),
    ]);

    revalidatePath(`/inquiries/${parsed.data.inquiryId}`);
    revalidatePath("/inquiries");
    return { success: true };
  } catch {
    return { success: false, error: "Couldn't save this follow-up. Please try again." };
  }
}
