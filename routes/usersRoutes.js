import express from "express";
import {deleteUserByemail, getAllUsers, updateUserByEmail} from "../controllers/userRudController.js"
import { createUser, currentUser , deactivateAccount , activateAccount} from "../controllers/usersController.js";
import modifyParams from "../controllers/paramController.js";
import { validateToken } from "../middlewares/validateTokenHandler.js";
import { isAdmin } from "../middlewares/adminChecker.js";

import   {createBackup , getAllBackups}  from '../controllers/backupControllers.js';

const router = express.Router();


import cors from "cors";
router.use(cors());
// Define routes (endpoints)

router.delete("/:email", deleteUserByemail); 
router.get("/AllUsers",getAllUsers); 
router.put("/modifyParams",modifyParams);
router.put("/:email" ,updateUserByEmail); 
router.post("/createuser",createUser);  
router.post("/deactivateaccount"  , deactivateAccount ); 
router.post("/activateaccount"  , activateAccount );
router.get("/currentuser" ,currentUser)

router.post('/createbackups', createBackup); 
router.get("/getAllBackups", getAllBackups) 



export default router;
