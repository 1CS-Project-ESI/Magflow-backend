import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";
import { updateRolePermissions , getAllRoles} from "../controllers/rolesController.js"

const router = express.Router();

// router.post('/add', validateToken, addRole);
router.post('/update/:id', validateToken, updateRolePermissions);
router.get('/allroles',getAllRoles)
export default router;