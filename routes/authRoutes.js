import express from "express";
import {validateToken} from "../middlewares/validateTokenHandler.js";
import {resetPassword, forgotPassword, loginUser, logoutUser} from "../controllers/usersController.js";


const router = express.Router();

router.post("/login", loginUser);
router.post('/logout', validateToken, logoutUser);
router.post("/forgot-password", forgotPassword);
router.post('/reset-password/:resettoken',resetPassword);
export default router;