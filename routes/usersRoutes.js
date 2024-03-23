import express from "express";
import { createUser , currentUser} from "../controllers/usersController.js";
import { validateToken } from "../middlewares/validateTokenHandler.js";
import { isAdmin } from "../middlewares/adminChecker.js";
// import { isAdmin } from "../middlewares/adminChecker.js";

const router = express.Router();

// Define routes (endpoints)

router.post("/createuser", validateToken, isAdmin,createUser);
router.get("/currentuser",validateToken,currentUser)

export default router;
