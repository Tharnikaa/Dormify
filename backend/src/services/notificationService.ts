import { prisma } from '../config/db';

export class NotificationService {
  static async sendNotification(userId: string, title: string, message: string, type: string) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
        },
      });
      return notification;
    } catch (err) {
      console.error('[NotificationService] Send error:', err);
    }
  }

  static async getUserNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  static async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }
}
