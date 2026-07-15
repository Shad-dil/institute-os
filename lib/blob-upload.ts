import { put } from "@vercel/blob";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB — plenty for a logo/signature, keeps receipts fast to render

export interface UploadImageResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadInstituteImage(file: File, pathPrefix: string): Promise<UploadImageResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: "Please upload a PNG, JPG, or WEBP image." };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { success: false, error: "Image must be under 2MB." };
  }

  try {
    const blob = await put(`${pathPrefix}/${Date.now()}-${file.name}`, file, {
      access: "public",
    });
    return { success: true, url: blob.url };
  } catch {
    return { success: false, error: "Upload failed. Please try again." };
  }
}
