import { Notification, NotificationSent, FCMToken } from '../models/notificationsModel.js';
import { sendNotification } from '../config/pushNotification.json';

const sendNotificationToUser = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id; 

    const notification = await Notification.create({ message });
    await NotificationSent.create({
      id_notification: notification.id,
      id_user: userId,
    });

    const fcmToken = await FCMToken.findOne({ where: { id_user: userId }, attributes: ['token'] });
    if (fcmToken) {
      const { title, body } = notification;
      await sendNotification([fcmToken.token], { title, body }, {});
    }

    res.status(200).json({ message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Failed to send notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
};

const getNotificationsForRecipientById = async (req, res) => {
  try {
    const id = req.user.id; // Assuming you have middleware to get the user ID

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

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Failed to get notifications for recipient:', error);
    res.status(500).json({ error: 'Failed to get notifications for recipient' });
  }
};

export { sendNotificationToUser, getNotificationsForRecipientById };