import express from "express";
import { getMagasinierNotifications, getResponsableNotifications, getDirecteurNotifications,getConsommateurNotifications } from "../controllers/notificationController.js";

const router = express.Router();

router.get('/magasinier/:magasinierId', getMagasinierNotifications);
router.get('/responsable/:responsableId', getResponsableNotifications);
router.get('/directeur/:directeurId', getDirecteurNotifications);
router.get('/consommateur/:consommateurId', getConsommateurNotifications);

export default router;
