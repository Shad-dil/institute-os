"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentInstituteId } from "@/lib/queries/institute";

export async function dismissFeeReminder(noticeId: string): Promise<{ success: boolean }> {
  try {
    const instituteId = await getCurrentInstituteId();
    await prisma.feeReminderNotice.updateMany({
      where: { id: noticeId, instituteId },
      data: { isRead: true },
    });
    revalidatePath("/fees");
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function dismissAllFeeReminders(): Promise<{ success: boolean }> {
  try {
    const instituteId = await getCurrentInstituteId();
    await prisma.feeReminderNotice.updateMany({
      where: { instituteId, isRead: false },
      data: { isRead: true },
    });
    revalidatePath("/fees");
    return { success: true };
  } catch {
    return { success: false };
  }
}
