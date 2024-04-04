import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";

import { createBonCommande, createBonRepection } from "../controllers/bonsController.js";


const router = express.Router();


router.post('/create-bon-commande/:id_agentServiceAchat',validateToken, createBonCommande);
router.post('/create-bon-reception/:id_magasinier', createBonRepection);

export default router;
