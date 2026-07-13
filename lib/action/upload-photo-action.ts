"use server";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

export async function uploadStudentPhoto(file: File | null) {
  if (!file) {
    throw new Error("Please upload an image file");
  }

  if (!process.env.R2_BUCKET_NAME || !process.env.R2_ENDPOINT) {
    throw new Error(
      "R2 storage is not configured. Set R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME.",
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: `students/${fileName}`,
      Body: buffer,
      ContentType: file.type,
      ACL: "public-read",
    }),
  );

  const publicBase = process.env.R2_PUBLIC_URL?.trim();
  if (!publicBase) {
    throw new Error(
      "R2 public URL is not configured. Set R2_PUBLIC_URL to your public dev URL base.",
    );
  }

  return `${publicBase.replace(/\/$/, "")}/students/${fileName}`;
}
