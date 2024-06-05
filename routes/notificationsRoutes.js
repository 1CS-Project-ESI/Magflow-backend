import express from "express";
import { getMagasinierNotifications, getResponsableNotifications, getDirecteurNotifications } from "../controllers/notificationController.js";

import { getMagasinierNotifications, getResponsableNotifications, getDirecteurNotifications,getConsommateurNotifications } from "../controllers/notificationController.js";
import {saveUserFcmToken} from "../controllers/pushNotification.js"


const router = express.Router();

//router.post('/notifications/:notificationId/send', sendNotificationToUsers);
router.post('/fcm-token', saveUserFcmToken);

router.get('/magasinier/:magasinierId', getMagasinierNotifications);
router.get('/responsable/:responsableId', getResponsableNotifications);
router.get('/directeur/:directeurId', getDirecteurNotifications);
router.get('/consommateur/:consommateurId', getConsommateurNotifications);

export default router;
