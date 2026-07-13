import { prisma } from "@/lib/prisma";

export interface NotificationRow {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string; // relative, e.g. "5 min ago"
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export async function getUnreadCount(instituteId: string): Promise<number> {
  return prisma.notification.count({ where: { instituteId, isRead: false } });
}

export async function getRecentNotifications(instituteId: string, limit = 8): Promise<NotificationRow[]> {
  const notifications = await prisma.notification.findMany({
    where: { instituteId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return notifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    link: n.link,
    isRead: n.isRead,
    createdAt: formatRelativeTime(n.createdAt),
  }));
}

export async function getAllNotifications(
  instituteId: string,
  page = 0,
  pageSize = 20
): Promise<{ notifications: NotificationRow[]; totalCount: number }> {
  const [notifications, totalCount] = await Promise.all([
    prisma.notification.findMany({
      where: { instituteId },
      orderBy: { createdAt: "desc" },
      skip: page * pageSize,
      take: pageSize,
    }),
    prisma.notification.count({ where: { instituteId } }),
  ]);

  return {
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link,
      isRead: n.isRead,
      createdAt: formatRelativeTime(n.createdAt),
    })),
    totalCount,
  };
}
