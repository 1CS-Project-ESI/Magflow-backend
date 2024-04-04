import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";

import { createBonCommande, createBonRepection, RemainingProducts } from "../controllers/bonsController.js";


const router = express.Router();


router.post('/create-bon-commande/:id_agentServiceAchat',validateToken, createBonCommande);
router.post('/create-bon-reception/:id_magasinier',validateToken, createBonRepection);
router.get('/remaining-products/:ReceptionId', RemainingProducts)

export default router;
