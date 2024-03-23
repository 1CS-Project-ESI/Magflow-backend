import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";
import {addPermission} from "../controllers/permissionsControllers.js"

const router = express.Router();

router.post('/add', validateToken, addPermission);

export default router;