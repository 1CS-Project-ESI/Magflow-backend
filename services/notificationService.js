// import { Notification, NotificationSent, FCMToken } from '../models/notificationsModel.js';
// import { sendNotification } from '../config/sendNotification.js' ;


// // send notif web
// const sendNotificationToUser = async (req, res) => {
//   try {
//     const { message } = req.body;
//     const userId = req.user.id; 

//     const notification = await Notification.create({ message });
//     await NotificationSent.create({
//       id_notification: notification.id,
//       id_user: userId,
//     });

//     const fcmToken = await FCMToken.findOne({ where: { id_user: userId }, attributes: ['token'] });
//     if (fcmToken) {
//       const { title, body } = notification;
//       await sendNotification([fcmToken.token], { title, body }, {});
//     }

//     res.status(200).json({ message: 'Notification sent successfully' });
//   } catch (error) {
//     console.error('Failed to send notification:', error);
//     res.status(500).json({ error: 'Failed to send notification' });
//   }
// };


// const getNotificationsForRecipientById = async (req, res) => {
//   try {
//     const id = req.user.id; 


//     const recipientNotifications = await NotificationSent.findAll({
//       where: { id_user: id },
//       attributes: ['id_notification'],
//       raw: true,
//     });

//     const notificationIds = recipientNotifications.map(notification => notification.id_notification);
//     const notifications = await Notification.findAll({
//       where: { id: notificationIds },
//       attributes: ['message', 'date'],
//     });

//     res.status(200).json(notifications);
//   } catch (error) {
//     console.error('Failed to get notifications for recipient:', error);
//     res.status(500).json({ error: 'Failed to get notifications for recipient' });
//   }
// };


// // send notif mobile
// const sendNotificationToUserMobile = async (userId, notificationPayload) => {
//   try {
//     const fcmTokenRecord = await FCMToken.findOne({ where: { id_user: userId } });
//     if (!fcmTokenRecord) {
//       console.error('FCM token not found for user:', userId);
//       return;
//     }
//     const fcmToken = fcmTokenRecord.token;

//     const message = notificationPayload.notification.message; 

//     await admin.messaging().sendToDevice(fcmToken, { notification: { message } });
//     console.log('Notification sent successfully to user:', userId);

//     // Create an instance in the NotificationSent table
//     await NotificationSent.create({ id_notification: notificationPayload.id, id_user: userId });
//   } catch (error) {
//     console.error('Error sending notification to user:', userId, error);
//   }
// };

// // send notif broadcast mobile
// const sendNotificationToAllUsers = async (notificationPayload) => {
//   try {
//     const allFCMTokens = await FCMToken.findAll();
//     allFCMTokens.forEach(async (fcmTokenRecord) => {
//       await sendNotificationToUserMobile(fcmTokenRecord.id_user, notificationPayload);
//     });
//   } catch (error) {
//     console.error('Error sending notification to all users:', error);
//   }
// };


// const notificationPayload = {
//   notification: {
//     message: 'Your notification body'
//   }
// };


// export { sendNotificationToUser, getNotificationsForRecipientById, sendNotificationToAllUsers, sendNotificationToUserMobile};


import { Notification, NotificationSent } from '../models/notificationsModel.js';
import { io } from '../app.js';

// send notification web
const sendNotificationToUser = async (message, userId) => {
  try {
    const notification = await Notification.create({
      message
    });

    await NotificationSent.create({
      id_notification: notification.id,
      id_user: userId
    });


    io.to(userId.toString()).emit('notification', {
      id: notification.id,
      message: notification.message,
      date: notification.date
    });

  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};


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

export { sendNotificationToUser, getNotificationsForRecipientById };
