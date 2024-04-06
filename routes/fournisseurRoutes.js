import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";
import {createFournisseur, getAllFournisseurs ,updateFournisseurByEmail, deleteFournisseurByEmail, getFournisseurById } from "../controllers/fournisseurController.js";


const router = express.Router();
import cors from "cors";
router.use(cors());


router.post('/create', validateToken, createFournisseur);
router.get('/allFournisseurs',validateToken, getAllFournisseurs);
router.put('/update/:email', validateToken, updateFournisseurByEmail);
router.delete('/delete/:email', validateToken, deleteFournisseurByEmail)
router.get('/:fournisseurId', getFournisseurById);

export default router;