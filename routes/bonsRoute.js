import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";

import { createBonCommande ,getAllCommands ,getAllProductsOfCommand} from "../controllers/bonsController.js";


const router = express.Router();


router.post('/create/:id_agentServiceAchat',validateToken,createBonCommande);
router.get('/allcommands',getAllCommands);
router.get('/commandproducts/:command_id',getAllProductsOfCommand)

export default router;
