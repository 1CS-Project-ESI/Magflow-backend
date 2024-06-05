import express from "express";
import uploadBonLivraison from '../controllers/fileUploadControllers.js'
import uploadProfilePic from "../controllers/fileUploadControllers.js";

const router = express.Router();

router.post('/bonlivraison/:bonReceptionId',uploadBonLivraison)
router.post('/profilepic/:userId',uploadProfilePic)


export default router;