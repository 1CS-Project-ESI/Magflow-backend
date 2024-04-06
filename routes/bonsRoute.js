import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";

import { createBonCommande ,createBonRepection, getAllCommands,getAllReception ,getAllProductsOfCommand, getProductsWithQuantityDelivered, RemainingProducts,getAllProductsOfCommandWithNumber} from "../controllers/bonsController.js";

const router = express.Router();
import cors from "cors";

router.use(cors());


router.post('/create/:id_agentServiceAchat',validateToken,createBonCommande);
router.post('/create-bon-reception/:id_magasinier',validateToken, createBonRepection);
router.get('/allcommands',validateToken, getAllCommands);
router.get('/allreceptions',validateToken,getAllReception);
router.get('/commandproducts/:command_id',validateToken,getAllProductsOfCommand);
router.get('/command/received/:commandId',validateToken,getProductsWithQuantityDelivered);
router.get('/remaining-products/:CommandId', validateToken, RemainingProducts);
router.get('/getcommandproductswithnumber',validateToken,getAllProductsOfCommandWithNumber)


export default router;
