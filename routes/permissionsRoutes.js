import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";
import {updatePermissionRoles} from "../controllers/permissionsControllers.js"
import { isAdmin } from "../middlewares/adminChecker.js";
const router = express.Router();

// router.post('/add', validateToken, addPermission);
router.post('/update/:id', validateToken,isAdmin,updatePermissionRoles)

export default router;