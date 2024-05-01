import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";

import {  getAllBonCommandInterneFFordirectorMagazinier ,createBonCommande ,createBonRepection, getAllCommands,getAllReception ,getAllProductsOfCommand, getProductsWithQuantityDelivered, RemainingProducts,getAllProductsOfCommandWithNumber, getCommandDetails, createBonCommandeInterne, getcommandinternedetails, getConsommateurCommands, getAllCommandsInterne, createBonSortie, getAllBonSorties,getBonCommandInterneForStructureResponsable, createBonDecharge,receiveBorrowedProducts,getAllBonDecharges,getBonDechargeDetailsById,deleteBonDechargeById,validateBonCommandeInterne} from "../controllers/bonsController.js";


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
// router.get('/allcommandsinterne',getAllCommandsInterne);
router.get('/allbonsortie',getAllBonSorties);
router.get('/allcomandsforresposnable/:id_structureresponsable',getBonCommandInterneForStructureResponsable);// get product of the responsale struct and the validation = 0 
router.get('/getAllBonCommandInterneFFordirectorMagazinier',getAllBonCommandInterneFFordirectorMagazinier);
router.post('/createBonDecharge/:id_boncommandeinterne',createBonDecharge);  
router.get('/getBonDechargeDetailsById/:id_bondecharge',getBonDechargeDetailsById);
router.delete('/deleteBonDechargeById/:id_bondecharge',deleteBonDechargeById);
router.post('/receiveBonDecharge/:id_bondecharge',receiveBorrowedProducts);
router.get('/getAllBonDecharges',getAllBonDecharges);
router.patch('/validation/:id_boncommandeinterne',validateBonCommandeInterne);

export default router;
