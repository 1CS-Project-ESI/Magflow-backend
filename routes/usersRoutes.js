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

router.delete("/:email",deleteUserByemail); // link done,,validateToken , isAdmin ,
router.get("/AllUsers",getAllUsers); // link done  ,validateToken , isAdmin
router.put("/modifyParams",modifyParams); //,validateToken, isAdmin ,
router.put("/:email" ,updateUserByEmail); //,validateToken, isAdmin
router.post("/createuser",createUser);  //  link done ,validateToken , isAdmin
router.post("/deactivateaccount"  , deactivateAccount ); //, validateToken , isAdmi
router.post("/activateaccount"  , activateAccount );//, validateToken , isAdmin
router.get("/currentuser" ,currentUser) //,validateToken, isAdmin

router.post('/createbackups', createBackup); //, validateToken , isAdmin
router.get("/getAllBackups", getAllBackups) //, validateToken , isAdmin



export default router;
