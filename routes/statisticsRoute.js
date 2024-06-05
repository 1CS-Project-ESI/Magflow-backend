import express from "express";
import {calculateQuantitiesByProduct , calculateStockValue, getMostConsumableProductsByStructure,fetchProductsWithPositiveStock, getMostConsumableProductsByUser , getTopConsumersByStructure , getTotalOrdersByStructure , getUserCommandCounts,getTopConsumersForProduct,getTopConsumersForProductByDate,getMostConsumableProductsByStructureByDate , getMostConsumableProductsByUserByDate} from "../controllers/statisticsControllers.js"

const router = express.Router();
import cors from "cors";
router.use(cors());

router.get('/mostconsumableproducts', calculateQuantitiesByProduct);
router.get('/mostconsumableproductsbystructure/:structureId',getMostConsumableProductsByStructure); //+date
router.get('/mostconsumableproductsbystructurebydate/:structureId',getMostConsumableProductsByStructureByDate);
router.get('/stockvalue',calculateStockValue);
router.get('/remaining',fetchProductsWithPositiveStock);
router.get('/mostconsumableproductsbyuser/:user_id',getMostConsumableProductsByUser); //+date
router.get('/mostconsumableproductsbyuserBydate/:user_id',getMostConsumableProductsByUserByDate);
router.get('/gettopconsumersbystructure/:structureId',getTopConsumersByStructure);
router.get('/getTotalOrdersByStructure/:structureId' , getTotalOrdersByStructure);
router.get('/getusercommandcounts/:userId',getUserCommandCounts);
router.get('/consumerproduct/:productId',getTopConsumersForProduct);
router.get('/consumerproductbydate/:productId',getTopConsumersForProductByDate)

export default router;