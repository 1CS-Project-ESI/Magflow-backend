import express from "express";
import {addStructure, getResponsableStructure , getAllStructures ,deleteStructure , getStructureUsers, addConsumerStructure } from "../controllers/structuresController.js";

const router = express.Router();

router.post('/create',addStructure)
router.get('/allstructures',getAllStructures);
router.get('/responsable/:id',getResponsableStructure);
router.get('/users/:id',getStructureUsers);
router.delete('/delete/:structureId',deleteStructure)
router.put('/addconsumer/:userId/:structureId',addConsumerStructure)

export default router;