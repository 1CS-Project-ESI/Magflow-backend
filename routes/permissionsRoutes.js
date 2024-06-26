import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";
import {updatePermissionRoles,getAllPermissions} from "../controllers/permissionsControllers.js"
import { isAdmin } from "../middlewares/adminChecker.js";

const router = express.Router();
import cors from "cors";
router.use(cors());

router.get('/getAllPermissions',getAllPermissions);
router.post('/update/:id',updatePermissionRoles); 

export default router;