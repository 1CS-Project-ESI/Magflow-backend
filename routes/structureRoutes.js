import express from "express";
import { getResponsableStructure , getAllStructures ,deleteStructure , getStructureUsers } from "../controllers/structuresController.js";
import {validateToken} from "../middlewares/validateTokenHandler.js";
const router = express.Router();


import cors from "cors";
router.use(cors());

router.get('/allstructures',validateToken,getAllStructures);
router.get('/responsable/:id',validateToken,getResponsableStructure);
router.get('/users/:id',validateToken,getStructureUsers);
router.delete('/delete/:structureId',validateToken,deleteStructure)

export default router;