import express from "express";


const router = express.Router();

// define routes (endpoints) not using the controller functions (simple format)


router.post("/login",loginUser);



export default router;