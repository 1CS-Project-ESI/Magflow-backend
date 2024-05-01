import express from "express";

const router = express.Router();
import cors from "cors";
import {generatePDF,generateBonSortiePDF, generateBonCommandePDF} from "../controllers/pdfBonCommandeController.js";
router.use(cors());

router.get('/pdfcommandeinterne/:bonCommandeInterneId' , generatePDF)
router.get('/pdfbonsortie/:bonSortieId' , generateBonSortiePDF)
router.get('/pdfboncommande/:bonCommandeId',generateBonCommandePDF)


export default router;