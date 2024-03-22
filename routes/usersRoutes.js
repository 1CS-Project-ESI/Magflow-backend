import express from "express";
import { createUser } from "../controllers/usersController.js";
import { validateToken } from "../middlewares/validateTokenHandler.js";
// import { isAdmin } from "../middlewares/adminChecker.js";

const router = express.Router();

// Define routes (endpoints)

router.post("/createuser", validateToken, createUser);

export default router;
