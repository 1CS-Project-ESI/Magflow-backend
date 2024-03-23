import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";
import {addRole , updateRole } from "../controllers/rolesController.js"

const router = express.Router();

router.post('/add', validateToken, addRole);
router.post('/update/:id', validateToken, updateRole);

export default router;