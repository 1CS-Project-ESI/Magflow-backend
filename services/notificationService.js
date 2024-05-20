import { Notification, NotificationSent } from '../models/notificationsModel.js';
import { io } from '../app.js'; // Import the socket.io instance

// Function to send a notification
const sendNotification = async (message, userId) => {
  try {
    const notification = await Notification.create({ message });

    await NotificationSent.create({
      id_notification: notification.id,
      id_user: userId,
    });

    // Emit the notification event to the specific user room
    io.to(userId.toString()).emit('notification', {
      id: notification.id,
      message: notification.message,
      date: notification.date,
    });

  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};

// Function to get notifications for a specific user
const getNotificationsForRecipientById = async (id) => {
  try {
    const recipientNotifications = await NotificationSent.findAll({
      where: { id_user: id },
      attributes: ['id_notification'],
      raw: true,
    });

    const notificationIds = recipientNotifications.map(notification => notification.id_notification);

    const notifications = await Notification.findAll({
      where: { id: notificationIds },
      attributes: ['message', 'date'],
    });

    return notifications;
  } catch (error) {
    console.error('Failed to get notifications for recipient:', error);
    return [];
  }
};

export { sendNotification, getNotificationsForRecipientById };
