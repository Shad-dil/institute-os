"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentInstituteId } from "@/lib/queries/institute";

export async function markNotificationRead(notificationId: string): Promise<{ success: boolean }> {
  try {
    const instituteId = await getCurrentInstituteId();
    // updateMany, not update — this is the ownership check. If the
    // notification doesn't belong to this institute, the where clause
    // matches nothing and nothing happens, instead of throwing on a
    // record-not-found for someone else's data.
    await prisma.notification.updateMany({
      where: { id: notificationId, instituteId },
      data: { isRead: true },
    });
    revalidatePath("/notifications");
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function markAllNotificationsRead(): Promise<{ success: boolean }> {
  try {
    const instituteId = await getCurrentInstituteId();
    await prisma.notification.updateMany({
      where: { instituteId, isRead: false },
      data: { isRead: true },
    });
    revalidatePath("/notifications");
    return { success: true };
  } catch {
    return { success: false };
  }
}
