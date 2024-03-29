import express from "express";
import { getResponsableStructure , getAllStructures ,deleteStructure } from "../controllers/structuresController.js";

const router = express.Router();

router.get('/allstructures',getAllStructures);
router.get('/responsable/:id',getResponsableStructure);
router.delete('/delete/:structureId',deleteStructure)

export default router;