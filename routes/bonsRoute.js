import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";

import { createBonCommande ,createBonRepection, getAllCommands,getAllReception ,getAllProductsOfCommand, getProductsWithQuantityDelivered, RemainingProducts,getAllProductsOfCommandWithNumber, getCommandDetails, createBonCommandeInterne, getcommandinternedetails, getConsommateurCommands, getAllCommandsInterne,createBonDecharge,receiveBorrowedProducts,getAllBonDecharges,getBonDechargeDetailsById,deleteBonDechargeById} from "../controllers/bonsController.js";

const router = express.Router();
import cors from "cors";

router.use(cors());



router.post('/create/:id_agentserviceachat/:id_fournisseur',createBonCommande);  // link done 
router.post('/create-bon-reception/:id_boncommande', createBonRepection);
router.post('/create-bon-commande-interne/:id_consommateur', createBonCommandeInterne);
router.get('/allcommands', getAllCommands); //link done 
router.get('/allreceptions',getAllReception); //link done 
router.get('/commandproducts/:command_id',getAllProductsOfCommand); // link done 
router.get('/command/received/:commandId',getProductsWithQuantityDelivered);
router.get('/commandinterne/details/:id',getcommandinternedetails);
router.get('/remaining-products/:CommandId', RemainingProducts);
router.get('/getcommandproductswithnumber/:number',getAllProductsOfCommandWithNumber);
router.get('/command/details/:id',getCommandDetails);
router.get('/consumer-commands/:id',getConsommateurCommands);
router.get('/allcommandsinterne',getAllCommandsInterne)

router.post('/createBonDecharge/:id_magasinier',createBonDecharge);  
router.get('/getBonDechargeDetailsById/:id_bondecharge',getBonDechargeDetailsById);
router.delete('/deleteBonDechargeById/:id_bondecharge',deleteBonDechargeById);
router.post('/receiveBonDecharge/:id_bondecharge',receiveBorrowedProducts);
router.get('/getAllBonDecharges',getAllBonDecharges);

export default router;
