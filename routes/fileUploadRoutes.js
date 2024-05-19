import express from "express";
import uploadBonLivraison from '../controllers/fileUploadControllers.js'

const router = express.Router();

router.post('/bonlivraison/:bonReceptionId',uploadBonLivraison)


export default router;