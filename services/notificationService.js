import { Notification, NotificationSent } from '../models/notificationsModel.js';

const sendNotificationToResponsable = async (bonCommande, id_responsable) => {
    try {
        const notification = await Notification.create({
          message: `Bon de commande interne ${bonCommande.number} requires validation.`
        });
        await NotificationSent.create({
          id_notification: notification.id,
          id_user: id_responsable
        });
      } catch (error) {
        console.error('Failed to send notification to responsable:', error);
      }
    };

const sendNotificationToDirecteur = async (bonCommande, id_directeur) => {
    try {
        const notification = await Notification.create({
          message: `Bon de commande interne ${bonCommande.number} requires validation.`
        });
        await NotificationSent.create({
          id_notification: notification.id,
          id_user: id_directeur
        });
      } catch (error) {
        console.error('Failed to send notification to directeur:', error);
      }
    };

const sendNotificationToMagasinier = async (bonCommande, id_magasinier) => {
  try {
    const notification = await Notification.create({
      message: `Bon de commande interne ${bonCommande.number} is ready for processing.`
    });
    await NotificationSent.create({
      id_notification: notification.id,
      id_user: id_magasinier
    });
  } catch (error) {
    console.error('Failed to send notification to magasinier:', error);
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

export { sendNotificationToResponsable, sendNotificationToDirecteur, sendNotificationToMagasinier, getNotificationsForRecipientById };