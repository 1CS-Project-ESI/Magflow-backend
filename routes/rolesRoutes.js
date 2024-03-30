import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";
import { updateRolePermissions ,getAllRoles} from "../controllers/rolesController.js"

const router = express.Router();
import cors from "cors";
router.use(cors());
// router.post('/add', validateToken, addRole);
router.get('/getAllRoles',getAllRoles)
router.post('/update/:id',  updateRolePermissions); //validateToken,

export default router;