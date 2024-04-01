import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";
import { addChapter,addArticle,addProduct } from "../controllers/productsController.js";

const router = express.Router();

router.post('/chapter/create',addChapter);
router.post('/article/create',addArticle);
router.post('/product/create',addProduct);

export default router;