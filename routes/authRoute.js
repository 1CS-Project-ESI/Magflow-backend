import express from "express";
import {resetPassword, forgotPassword, loginUser} from "../controllers/usersController.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post('/reset-password/:resettoken',resetPassword);
export default router;