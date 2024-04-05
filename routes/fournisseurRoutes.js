import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";
import {createFournisseur, getAllFournisseurs ,updateFournisseurByEmail, deleteFournisseurByEmail } from "../controllers/fournisseurController.js";


const router = express.Router();


router.post('/create', createFournisseur);
router.get('/allFournisseurs', getAllFournisseurs);
router.put('/update/:email', updateFournisseurByEmail);
router.delete('/delete/:email', deleteFournisseurByEmail)


export default router;