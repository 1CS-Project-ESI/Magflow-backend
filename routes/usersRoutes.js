import express from "express";
import {deleteUserByemail, getAllUsers, updateUserById} from "../controllers/userRudController.js"
import { createUser, currentUser , deactivateAccount , activateAccount} from "../controllers/usersController.js";
import modifyParams from "../controllers/paramController.js";
import { validateToken } from "../middlewares/validateTokenHandler.js";
import { isAdmin } from "../middlewares/adminChecker.js";

import   {createBackup , getAllBackups}  from '../controllers/backupControllers.js';

const router = express.Router();


import cors from "cors";
router.use(cors());
// Define routes (endpoints)

router.delete("/:email",validateToken , isAdmin ,deleteUserByemail); // link done
router.get("/AllUsers",validateToken , isAdmin,getAllUsers); // link done 
router.put("/modifyParams",validateToken, isAdmin ,modifyParams);
router.put("/:id",validateToken, isAdmin ,updateUserById);
router.post("/createuser",validateToken , isAdmin,createUser);  //  link done 
router.post("/deactivateaccount" , validateToken , isAdmin , deactivateAccount );
router.post("/activateaccount" , validateToken , isAdmin , activateAccount );
router.get("/currentuser",validateToken, isAdmin ,currentUser)

router.post('/createbackups', validateToken , isAdmin, createBackup);
router.get("/getAllBackups", validateToken , isAdmin, getAllBackups)



export default router;
