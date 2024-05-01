import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";
import { getMagasinierNotifications, getResponsableNotifications, getDirecteurNotifications } from "../controllers/notificationController.js";

const router = express.Router();
import cors from "cors";
router.use(cors());

router.get('/magasinier/:magasinierId', getMagasinierNotifications);
router.get('/responsable/:responsableId', getResponsableNotifications);
router.get('/directeur/:directeurId', getDirecteurNotifications);

export default router;