import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

interface CreateNotificationInput {
  instituteId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  dedupKey?: string;
}

/**
 * Every notification in the app is created through this one function —
 * that's deliberate. It means dedup logic, and eventually things like
 * "also send an email/push for high-priority types," live in exactly one
 * place instead of being reimplemented at every call site.
 *
 * For immediate events (a payment came in, a student was admitted) you
 * won't usually pass a dedupKey — each one is a genuinely new,
 * one-off event. For computed events (an invoice becomes overdue, a
 * student trends into attendance risk) always pass one, or a scheduled
 * job will re-notify about the same thing every time it runs.
 */
export async function createNotification(input: CreateNotificationInput): Promise<void> {
  if (input.dedupKey) {
    const existing = await prisma.notification.findUnique({ where: { dedupKey: input.dedupKey } });
    if (existing) return; // already notified about this specific thing
  }

  try {
    await prisma.notification.create({
      data: {
        instituteId: input.instituteId,
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link,
        dedupKey: input.dedupKey,
      },
    });
  } catch (error) {
    // A unique constraint race (two requests creating the same dedupKey
    // at once) is fine to swallow — the notification exists either way,
    // which is the actual goal. Anything else, surface it.
    if (!(error instanceof Error && error.message.includes("Unique constraint"))) {
      console.error("Failed to create notification:", error);
    }
  }
}
