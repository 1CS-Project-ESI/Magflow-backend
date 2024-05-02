import express from "express";

import {addStructure, getResponsableStructure , getAllStructures ,deleteStructure , getStructureUsers, addConsumerStructure } from "../controllers/structuresController.js";
import {validateToken} from "../middlewares/validateTokenHandler.js";

const router = express.Router();
import cors from "cors";
router.use(cors());

router.post('/create',addStructure); // for admin 
router.delete('/delete/:structureId',deleteStructure) // for admin 
router.put('/addconsumer/:userId/:structureId',addConsumerStructure); // for admin 
router.get('/allstructures',getAllStructures);  // done for admin + not done ccreation of users 
router.get('/responsable/:id',getResponsableStructure); // for deatials -> done 
router.get('/users/:id',getStructureUsers);  // for admin -> done 



export default router;