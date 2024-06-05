import { getNotificationsForRecipientById } from "../services/notificationService.js";

const getMagasinierNotifications = async (req, res) => {
  try {
    const { magasinierId } = req.params;
    const magasinierNotifications = await getNotificationsForRecipientById(magasinierId);
    res.json(magasinierNotifications);
  } catch (error) {
    console.error('Error fetching magasinier notifications:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getResponsableNotifications = async (req, res) => {
  try {
    const { responsableId } = req.params;
    const responsableNotifications = await getNotificationsForRecipientById(responsableId);
    res.json(responsableNotifications);
  } catch (error) {
    console.error('Error fetching responsable notifications:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getDirecteurNotifications = async (req, res) => {
  try {
    const { directeurId } = req.params;
    const directeurNotifications = await getNotificationsForRecipientById(directeurId);
    res.json(directeurNotifications);
  } catch (error) {
    console.error('Error fetching directeur notifications:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getConsommateurNotifications = async (req, res) => {
    try {
      const { consommateurId } = req.params;
      const magasinierNotifications = await getNotificationsForRecipientById(consommateurId);
      res.json(magasinierNotifications);
    } catch (error) {
      console.error('Error fetching consommateur notifications:', error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

export { getMagasinierNotifications, getResponsableNotifications, getDirecteurNotifications,getConsommateurNotifications };
