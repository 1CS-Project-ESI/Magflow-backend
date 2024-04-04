import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";
import { createBonCommande ,createBonRepection, getAllCommands ,getAllProductsOfCommand} from "../controllers/bonsController.js";


const router = express.Router();


router.post('/create/:id_agentServiceAchat',validateToken,createBonCommande);
router.get('/allcommands',validateToken, getAllCommands);
router.get('/commandproducts/:command_id',validateToken,getAllProductsOfCommand)
router.post('/create-bon-reception/:id_magasinier', validateToken,createBonRepection);


export default router;
