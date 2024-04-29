import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";

import { createBonCommande ,createBonRepection, getAllCommands,getAllReception ,getAllProductsOfCommand, getProductsWithQuantityDelivered, RemainingProducts,getAllProductsOfCommandWithNumber, getCommandDetails, createBonCommandeInterne, getcommandinternedetails, getConsommateurCommands, getAllCommandsInterne, createBonSortie} from "../controllers/bonsController.js";

const router = express.Router();
import cors from "cors";

router.use(cors());



router.post('/create/:id_agentserviceachat/:id_fournisseur',createBonCommande);  // link done 
router.post('/create-bon-reception/:id_boncommande', createBonRepection);
router.post('/create-bon-commande-interne/:id_consommateur', createBonCommandeInterne);
router.post('/create-bon-sortie/:id_boncommandeinterne', createBonSortie);
router.get('/allcommands', getAllCommands); //link done 
router.get('/allreceptions',getAllReception); //link done 
router.get('/commandproducts/:command_id',getAllProductsOfCommand); // link done 
router.get('/command/received/:commandId',getProductsWithQuantityDelivered);
router.get('/commandinterne/details/:id',getcommandinternedetails);
router.get('/remaining-products/:CommandId', RemainingProducts);
router.get('/getcommandproductswithnumber/:number',getAllProductsOfCommandWithNumber);
router.get('/command/details/:id',getCommandDetails);
router.get('/consumer-commands/:id',getConsommateurCommands);
router.get('/allcommandsinterne',getAllCommandsInterne);


export default router;
