import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";

import { createBonCommande } from "../controllers/bonsController.js";


const router = express.Router();


router.post('/create/:id_agentServiceAchat',createBonCommande);

export default router;
