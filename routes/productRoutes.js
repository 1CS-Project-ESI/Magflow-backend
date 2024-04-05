import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";
import { addChapter,addArticle,addProduct,getAllArticles,getAllProducts,getAllchapters , getChapterArticles ,getArticleProducts, deleteProduct, deleteArticleIfEmpty, deleteChapterIfEmpty,updateChapitre, updateArticle, updateProduct } from "../controllers/productsController.js";

const router = express.Router();

router.post('/chapter/create/:id',addChapter);
router.post('/article/create/:chapterId',addArticle);
router.post('/product/create/:articleId',addProduct);
router.get('/chapter/all',getAllchapters);
router.get('/article/all',getAllArticles);
router.get('/product/all',getAllProducts);
router.get('/chapter/articles/:chapterId',getChapterArticles);
router.get('/article/products/:articleId',getArticleProducts);
router.delete('/product/delete/:productId' ,deleteProduct);
router.delete('/article/delete/:articleId' ,deleteArticleIfEmpty);
router.delete('/chapter/delete/:chapterId' ,deleteChapterIfEmpty)
router.put('/chapter/update/:id',updateChapitre)
router.put('/article/update/:id',updateArticle)
router.put('/product/update/:id',updateProduct)

export default router;