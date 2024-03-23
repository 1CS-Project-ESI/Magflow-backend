import express from "express";
import { createUser , currentUser , deactivateAccount , activateAccount } from "../controllers/usersController.js";
import { validateToken } from "../middlewares/validateTokenHandler.js";
import { isAdmin } from "../middlewares/adminChecker.js";
// import { isAdmin } from "../middlewares/adminChecker.js";

const router = express.Router();

// Define routes (endpoints)

router.post("/createuser", validateToken, isAdmin,createUser);
router.post("/deactivateaccount" , validateToken , isAdmin , deactivateAccount )
router.post("/activateaccount" , validateToken , isAdmin , activateAccount )
router.get("/currentuser",validateToken,currentUser)

export default router;
