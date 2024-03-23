import express from "express";
import {resetPassword, forgotPassword, loginUser, logoutUser} from "../controllers/usersController.js";
import {validateToken} from "../middlewares/validateTokenHandler.js"

const router = express.Router();

router.post("/login", loginUser);
router.post('/logout', validateToken, logoutUser);
router.post("/forgot-password", forgotPassword);
router.post('/reset-password/:resettoken',resetPassword);
export default router;