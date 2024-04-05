import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";
import {createFournisseur, getAllFournisseurs ,updateFournisseurByEmail, deleteFournisseurByEmail } from "../controllers/fournisseurController.js";


const router = express.Router();


router.post('/create', validateToken, createFournisseur);
router.get('/allFournisseurs',validateToken, getAllFournisseurs);
router.put('/update/:email', validateToken, updateFournisseurByEmail);
router.delete('/delete/:email', validateToken, deleteFournisseurByEmail)


export default router;