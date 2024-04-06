import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";

import { createBonCommande ,createBonRepection, getAllCommands,getAllReception ,getAllProductsOfCommand, getProductsWithQuantityDelivered, RemainingProducts} from "../controllers/bonsController.js";

const router = express.Router();
import cors from "cors";
router.use(cors());


router.post('/create/:id_agentServiceAchat',createBonCommande);
router.post('/create-bon-reception/:id_magasinier', createBonRepection);
router.get('/allcommands', getAllCommands); //link done 
router.get('/allreceptions',validateToken,getAllReception);
router.get('/commandproducts/:command_id',getAllProductsOfCommand); // link done 
router.get('/command/received/:commandId',getProductsWithQuantityDelivered);
router.get('/remaining-products/:CommandId', RemainingProducts)


export default router;
