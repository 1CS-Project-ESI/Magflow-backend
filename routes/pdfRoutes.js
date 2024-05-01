import express from "express";

const router = express.Router();
import cors from "cors";
import {generatePDF,generateBonSortiePDF} from "../controllers/pdfBonCommandeController.js";
router.use(cors());

router.get('/pdfcommandeinterne/:bonCommandeInterneId' , generatePDF)
router.get('/pdfbonsortie/:bonSortieId' , generateBonSortiePDF)


export default router;