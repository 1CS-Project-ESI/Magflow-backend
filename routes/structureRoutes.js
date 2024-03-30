import express from "express";
import { getResponsableStructure , getAllStructures ,deleteStructure , getStructureUsers } from "../controllers/structuresController.js";

const router = express.Router();

router.get('/allstructures',getAllStructures);
router.get('/responsable/:id',getResponsableStructure);
router.get('/users/:id',getStructureUsers);
router.delete('/delete/:structureId',deleteStructure)

export default router;