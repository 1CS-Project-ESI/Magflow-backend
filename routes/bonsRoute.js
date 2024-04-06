import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";

import { createBonCommande ,createBonRepection, getAllCommands,getAllReception ,getAllProductsOfCommand, getProductsWithQuantityDelivered, RemainingProducts,getAllProductsOfCommandWithNumber, getCommandDetails} from "../controllers/bonsController.js";

const router = express.Router();
import cors from "cors";

router.use(cors());


router.post('/create/:id_agentServiceAchat',createBonCommande);  // link done 
router.post('/create-bon-reception/:id_magasinier', createBonRepection);
router.get('/allcommands', getAllCommands); //link done 
router.get('/allreceptions',getAllReception); //link done 
router.get('/commandproducts/:command_id',getAllProductsOfCommand); // link done 
router.get('/command/received/:commandId',getProductsWithQuantityDelivered);
router.get('/remaining-products/:CommandId', RemainingProducts);
router.get('/getcommandproductswithnumber',getAllProductsOfCommandWithNumber);
router.get('/command/details/:id',getCommandDetails)

export default router;
