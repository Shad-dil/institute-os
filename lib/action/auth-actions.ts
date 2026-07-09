"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

const signUpSchema = z.object({
  instituteName: z.string().min(2, "Enter your institute's name"),
  ownerName: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export interface SignUpResult {
  success: boolean;
  error?: string;
}

export async function signUpInstitute(formData: FormData): Promise<SignUpResult> {
  const parsed = signUpSchema.safeParse({
    instituteName: formData.get("instituteName"),
    ownerName: formData.get("ownerName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const { instituteName, ownerName, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "An account with this email already exists. Try logging in instead." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await prisma.$transaction(async (tx) => {
      const institute = await tx.institute.create({
        data: { name: instituteName, email },
      });
      await tx.user.create({
        data: {
          name: ownerName,
          email,
          passwordHash,
          role: "OWNER",
          instituteId: institute.id,
        },
      });
    });
  } catch {
    return { success: false, error: "Couldn't create your account. Please try again." };
  }

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      // Account was created successfully but auto-login failed for some
      // reason — don't block the person, just send them to log in
      // manually rather than surfacing a confusing error after a
      // successful signup.
      return { success: true };
    }
    throw error;
  }

  return { success: true };
}
