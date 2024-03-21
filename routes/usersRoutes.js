import express from "express";
import { loginUser,createUser } from "../controllers/usersController.js";
import { validateToken } from "../middlewares/validateTokenHandler.js";


const router = express.Router();

// define routes (endpoints) not using the controller functions (simple format)


router.post("/login",loginUser);
router.post("/createuser",validateToken,createUser)



export default router;