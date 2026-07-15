"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentInstituteId } from "@/lib/queries/institute";
import { uploadInstituteImage } from "@/lib/blob-upload";

export interface UpdateBrandingResult {
  success: boolean;
  error?: string;
}

const signatoryNameSchema = z.string().optional().or(z.literal(""));

export async function updateSignatoryName(formData: FormData): Promise<UpdateBrandingResult> {
  const parsed = signatoryNameSchema.safeParse(formData.get("signatoryName") || "");
  if (!parsed.success) return { success: false, error: "Invalid input" };

  try {
    const instituteId = await getCurrentInstituteId();
    await prisma.institute.update({
      where: { id: instituteId },
      data: { signatoryName: parsed.data || null },
    });
    revalidatePath("/settings");
    return { success: true };
  } catch {
    return { success: false, error: "Couldn't save. Please try again." };
  }
}

export async function uploadLogo(formData: FormData): Promise<UpdateBrandingResult> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { success: false, error: "No file selected" };

  try {
    const instituteId = await getCurrentInstituteId();
    const result = await uploadInstituteImage(file, `institutes/${instituteId}/logo`);
    if (!result.success || !result.url) return { success: false, error: result.error };

    await prisma.institute.update({ where: { id: instituteId }, data: { logoUrl: result.url } });
    revalidatePath("/settings");
    return { success: true };
  } catch {
    return { success: false, error: "Upload failed. Please try again." };
  }
}

export async function uploadSignature(formData: FormData): Promise<UpdateBrandingResult> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { success: false, error: "No file selected" };

  try {
    const instituteId = await getCurrentInstituteId();
    const result = await uploadInstituteImage(file, `institutes/${instituteId}/signature`);
    if (!result.success || !result.url) return { success: false, error: result.error };

    await prisma.institute.update({ where: { id: instituteId }, data: { signatureUrl: result.url } });
    revalidatePath("/settings");
    return { success: true };
  } catch {
    return { success: false, error: "Upload failed. Please try again." };
  }
}
