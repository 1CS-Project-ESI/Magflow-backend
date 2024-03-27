import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";
import { updateRolePermissions } from "../controllers/rolesController.js"

const router = express.Router();

// router.post('/add', validateToken, addRole);
router.post('/update/:id', validateToken, updateRolePermissions);

export default router;