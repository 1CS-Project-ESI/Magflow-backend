import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";

import { createBonCommande ,createBonRepection, getAllCommands ,getAllProductsOfCommand, getProductsWithQuantityDelivered, RemainingProducts} from "../controllers/bonsController.js";

const router = express.Router();


router.post('/create/:id_agentServiceAchat',validateToken,createBonCommande);
router.post('/create-bon-reception/:id_magasinier',validateToken, createBonRepection);
router.get('/allcommands',validateToken, getAllCommands);
router.get('/commandproducts/:command_id',validateToken,getAllProductsOfCommand);
router.get('/command/received/:commandId',validateToken,getProductsWithQuantityDelivered);
router.get('/remaining-products/:ReceptionId',validateToken, RemainingProducts)


export default router;
