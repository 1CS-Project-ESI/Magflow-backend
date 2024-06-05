import express from "express";
import {calculateQuantitiesByProduct , calculateStockValue, getMostConsumableProductsByStructure,fetchProductsWithPositiveStock, getMostConsumableProductsByUser , getTopConsumersByStructure , getTotalOrdersByStructure , getUserCommandCounts,getTopConsumersForProduct,getTopConsumersForProductByDate} from "../controllers/statisticsControllers.js"

const router = express.Router();
import cors from "cors";
router.use(cors());

router.get('/mostconsumableproducts', calculateQuantitiesByProduct);
router.get('/mostconsumableproductsbystructure/:structureId',getMostConsumableProductsByStructure);
router.get('/stockvalue',calculateStockValue);
router.get('/remaining',fetchProductsWithPositiveStock);
router.get('/mostconsumableproductsbyuser/:user_id',getMostConsumableProductsByUser);
router.get('/gettopconsumersbystructure/:structureId',getTopConsumersByStructure);
router.get('/getTotalOrdersByStructure/:structureId' , getTotalOrdersByStructure);
router.get('/getusercommandcounts/:userId',getUserCommandCounts);
router.get('/consumerproduct/:productId',getTopConsumersForProduct);
router.get('/consumerproductbydate/:productId',getTopConsumersForProductByDate)

export default router;