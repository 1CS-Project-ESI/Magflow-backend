import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";

import { updateRolePermissions ,getAllRoles} from "../controllers/rolesController.js"


const router = express.Router();
import cors from "cors";
router.use(cors());
// router.post('/add', validateToken, addRole);

router.get('/getAllRoles',validateToken,getAllRoles) // router.get('/allroles',getAllRoles) this one is better (we'll change it later) 
router.post('/update/:id' ,validateToken,updateRolePermissions); //validateToken,

export default router;