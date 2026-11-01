import { prisma, isDbConnected, store } from '../services/db.js';

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    let notifs = [];

    if (isDbConnected) {
      notifs = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      notifs = store.notifications.filter(n => n.userId === userId);
    }

    return res.status(200).json({
      success: true,
      data: notifs
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications',
      error: error.message
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (isDbConnected) {
      await prisma.notification.updateMany({
        where: { id, userId },
        data: { isRead: true, readAt: new Date() }
      });
    } else {
      const n = store.notifications.find(item => item.id === id && item.userId === userId);
      if (n) {
        n.isRead = true;
        n.readAt = new Date();
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update notification',
      error: error.message
    });
  }
};
