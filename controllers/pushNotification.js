import { Notification, NotificationSent, FCMToken } from '../models/notificationsModel.js';
import { sendNotification } from '../config/sendNotification.js';

const createNotification = async (req, res) => {
  try {
    const { message } = req.body;

    const notification = await Notification.create({ message });
    res.status(201).json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
};

const getUsersNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByPk(notificationId);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const tokens = await FCMToken.findAll({
      attributes: ['token'],
      include: {
        model: User,
        // Add any additional filters or conditions here
      },
    });

    const fcmTokens = tokens.map((token) => token.token);
    const { title, body } = notification;
    const response = await sendNotification(fcmTokens, { title, body }, {});
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
};

const saveUserFcmToken = async (req, res) => {
  try {
    const { token, userId } = req.body;

    const user = await FCMToken.findOne({ where: { userId: userId } });

    if (user) {
      user.token = token;
      await user.save();
      res.status(200).json({ message: 'FCM token saved successfully' });
    } else {
      res.status(404).json({ error: 'User not found', message: 'Failed to save FCM token' });
    }
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ error: 'Failed to save FCM token', message: error.message });
  }
};


export { createNotification, getUsersNotification, saveUserFcmToken };