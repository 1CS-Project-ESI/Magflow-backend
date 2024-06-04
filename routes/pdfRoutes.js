import express from "express";

const router = express.Router();
import cors from "cors";
import {generatePDF,generateBonSortiePDF, generateBonCommandePDF, generateBonReceptionPDF, generateBonDechargePDF,generateInventoryPDF} from "../controllers/pdfBonCommandeController.js";
router.use(cors());

router.get('/pdfcommandeinterne/:bonCommandeInterneId' , generatePDF)
router.get('/pdfbonsortie/:bonSortieId' , generateBonSortiePDF)
router.get('/pdfboncommande/:bonCommandeId',generateBonCommandePDF)
router.get('/pdfbonreception/:bonReceptionId',generateBonReceptionPDF)
router.get('/pdfbondecharge/:bonDechargeId',generateBonDechargePDF);
router.get('/pdfetatinventaire/:inventaireId',generateInventoryPDF)


export default router;