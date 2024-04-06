import express from "express";
import {deleteUserByemail, getAllUsers, updateUserByEmail} from "../controllers/userRudController.js"
import { createUser, currentUser , deactivateAccount , activateAccount, getUserInfo} from "../controllers/usersController.js";
import modifyParams from "../controllers/paramController.js";
import { validateToken } from "../middlewares/validateTokenHandler.js";
import { isAdmin } from "../middlewares/adminChecker.js";

import   {createBackup , getAllBackups}  from '../controllers/backupControllers.js';

const router = express.Router();


import cors from "cors";
router.use(cors());
// Define routes (endpoints)

router.delete("/:email",validateToken, deleteUserByemail); 
router.get("/AllUsers",validateToken,getAllUsers); 
router.put("/modifyParams",validateToken,modifyParams);
router.put("/:email" ,validateToken,updateUserByEmail); 
router.post("/createuser",validateToken,createUser);  
router.post("/deactivateaccount" ,validateToken , deactivateAccount ); 
router.post("/activateaccount"  ,validateToken, activateAccount );
router.get("/currentuser" ,currentUser)

router.post('/createbackups',validateToken, createBackup); 
router.get("/getAllBackups",validateToken, getAllBackups);

router.get('/info',validateToken,getUserInfo)



export default router;
