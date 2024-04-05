import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";
import { addChapter,addArticle,addProduct,getAllArticles,getAllProducts,getAllchapters , getChapterArticles ,getArticleProducts, deleteProduct, deleteArticleIfEmpty, deleteChapterIfEmpty,updateChapitre, updateArticle, updateProduct } from "../controllers/productsController.js";

const router = express.Router();

router.post('/chapter/create/:id',validateToken, addChapter);
router.post('/article/create/:chapterId',validateToken,addArticle);
router.post('/product/create/:articleId',validateToken,addProduct);
router.get('/chapter/all',validateToken, getAllchapters);
router.get('/article/all',validateToken, getAllArticles);
router.get('/product/all',validateToken, getAllProducts);
router.get('/chapter/articles/:chapterId',validateToken, getChapterArticles);
router.get('/article/products/:articleId',validateToken, getArticleProducts);
router.delete('/product/delete/:productId' ,validateToken, deleteProduct);
router.delete('/article/delete/:articleId' ,validateToken, deleteArticleIfEmpty);
router.delete('/chapter/delete/:chapterId' ,validateToken, deleteChapterIfEmpty)
router.put('/chapter/update/:id',validateToken, updateChapitre)
router.put('/article/update/:id',validateToken, updateArticle)
router.put('/product/update/:id',validateToken, updateProduct)

export default router;