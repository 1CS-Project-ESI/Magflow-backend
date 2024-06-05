import express from "express";
import uploadBonLivraison from '../controllers/bonLivraisonUpload.js'
import uploadProfilePic from "../controllers/fileUploadControllers.js";

const router = express.Router();
import cors from "cors";
router.use(cors());

router.post('/bonlivraison/:bonReceptionId',uploadBonLivraison)
router.post('/profilepic/:userId',uploadProfilePic)


export default router;