import express from "express";
import { loginUser, createUser, deleteUserById, getAllUsers, updateUserById} from "../controllers/usersController.js";

import modifyParams from "../controllers/paramController.js";
import { validateToken } from "../middlewares/validateTokenHandler.js";
// import { isAdmin } from "../middlewares/adminChecker.js";

const router = express.Router();

// Define routes (endpoints)

router.post("/createuser", validateToken, createUser);
router.delete("/:id",validateToken ,deleteUserById);
router.get("/AllUsers", validateToken,getAllUsers);
 router.put("/modifyParams",validateToken,modifyParams);
router.put("/:id",validateToken,updateUserById);



export default router;
