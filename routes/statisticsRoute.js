import express from "express";
import {calculateQuantitiesByProduct , calculateStockValue, getMostConsumableProductsByStructure,fetchProductsWithPositiveStock, getMostConsumableProductsByUser} from "../controllers/statisticsControllers.js"

const router = express.Router();

router.get('/mostconsumableproducts', calculateQuantitiesByProduct)
router.get('/mostconsumableproductsbystructure/:structureId',getMostConsumableProductsByStructure)
router.get('/stockvalue',calculateStockValue)
router.get('/remaining',fetchProductsWithPositiveStock)
router.get('/mostconsumableproductsbyuser/:user_id',getMostConsumableProductsByUser)

export default router;