import express from "express";

import {addStructure, getResponsableStructure , getAllStructures ,deleteStructure , getStructureUsers, addConsumerStructure } from "../controllers/structuresController.js";
import {validateToken} from "../middlewares/validateTokenHandler.js";

const router = express.Router();
import cors from "cors";
router.use(cors());

router.post('/create',validateToken,addStructure);
router.put('/addconsumer/:userId/:structureId',validateToken,addConsumerStructure);
router.get('/allstructures',validateToken,getAllStructures);
router.get('/responsable/:id',validateToken,getResponsableStructure);
router.get('/users/:id',validateToken,getStructureUsers);
router.delete('/delete/:structureId',validateToken,deleteStructure)


export default router;