import express from "express";
import {deleteUserById, getAllUsers, updateUserById} from "../controllers/userRudController.js"
import { createUser, currentUser , deactivateAccount , activateAccount} from "../controllers/usersController.js";
import modifyParams from "../controllers/paramController.js";
import { validateToken } from "../middlewares/validateTokenHandler.js";
import { isAdmin } from "../middlewares/adminChecker.js";

import   {createBackup , getAllBackups}  from '../controllers/backupControllers.js';

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

router.post('/createbackups', createBackup);
router.get("/getAllBackups",  getAllBackups)
// router.get all backups 


export default router;
