import express from "express";
import { createUser, currentUser , deactivateAccount , activateAccount, deleteUserById, getAllUsers, updateUserById} from "../controllers/usersController.js";

import modifyParams from "../controllers/paramController.js";

import { validateToken } from "../middlewares/validateTokenHandler.js";
import { isAdmin } from "../middlewares/adminChecker.js";

const router = express.Router();

// Define routes (endpoints)

router.delete("/:id",validateToken ,deleteUserById);
router.get("/AllUsers", validateToken,getAllUsers);
router.put("/modifyParams",validateToken,modifyParams);
router.put("/:id",validateToken,updateUserById);
router.post("/createuser", validateToken, isAdmin,createUser);
router.post("/deactivateaccount" , validateToken , isAdmin , deactivateAccount );
router.post("/activateaccount" , validateToken , isAdmin , activateAccount );
router.get("/currentuser",validateToken,currentUser)

export default router;
