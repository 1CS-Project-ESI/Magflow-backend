import express from "express";
import { getMagasinierNotifications, getResponsableNotifications, getDirecteurNotifications } from "../controllers/notificationController.js";

const router = express.Router();

router.get('/magasinier/:magasinierId', getMagasinierNotifications);
router.get('/responsable/:responsableId', getResponsableNotifications);
router.get('/directeur/:directeurId', getDirecteurNotifications);

export default router;
