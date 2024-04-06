import express from "express";

import {addStructure, getResponsableStructure , getAllStructures ,deleteStructure , getStructureUsers, addConsumerStructure } from "../controllers/structuresController.js";
import {validateToken} from "../middlewares/validateTokenHandler.js";

const router = express.Router();
import cors from "cors";
router.use(cors());

router.post('/create',addStructure);
router.put('/addconsumer/:userId/:structureId',addConsumerStructure);
router.get('/allstructures',getAllStructures);
router.get('/responsable/:id',getResponsableStructure);
router.get('/users/:id',getStructureUsers);
router.delete('/delete/:structureId',deleteStructure)


export default router;