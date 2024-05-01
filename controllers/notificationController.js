import { getNotificationsForRecipientById } from "../services/notificationService.js";

const getMagasinierNotifications = async (req, res) => {
    try {
        const magasinierId = req.params.magasinierId;
        const magasinierNotifications = await getNotificationsForRecipientById(magasinierId);
        res.json(magasinierNotifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getResponsableNotifications = async (req, res) => {
    try {
        const responsableId = req.params.responsableId; 
        const responsableNotifications = await getNotificationsForRecipientById(responsableId);
        res.json(responsableNotifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getDirecteurNotifications = async (req, res) => {
    try {
        const directeurId = req.params.directeurId;
        const directeurNotifications = await getNotificationsForRecipientById(directeurId);
        res.json(directeurNotifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export { getMagasinierNotifications, getResponsableNotifications, getDirecteurNotifications };

