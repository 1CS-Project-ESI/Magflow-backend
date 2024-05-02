import express from "express";

const router = express.Router();
import cors from "cors";
import {generatePDF,generateBonSortiePDF, generateBonCommandePDF, generateBonReceptionPDF} from "../controllers/pdfBonCommandeController.js";
router.use(cors());

router.get('/pdfcommandeinterne/:bonCommandeInterneId' , generatePDF)
router.get('/pdfbonsortie/:bonSortieId' , generateBonSortiePDF)
router.get('/pdfboncommande/:bonCommandeId',generateBonCommandePDF)
router.get('/pdfbonreception/:bonReceptionId',generateBonReceptionPDF)


export default router;