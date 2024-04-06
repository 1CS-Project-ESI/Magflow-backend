import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";
import {createFournisseur, getAllFournisseurs ,updateFournisseurByEmail, deleteFournisseurByEmail, getFournisseurById } from "../controllers/fournisseurController.js";


const router = express.Router();
import cors from "cors";
router.use(cors());


router.post('/create', createFournisseur);
router.get('/allFournisseurs', getAllFournisseurs);
router.put('/update/:email', updateFournisseurByEmail);
router.delete('/delete/:email', deleteFournisseurByEmail)
router.get('/:fournisseurId', getFournisseurById);

export default router;