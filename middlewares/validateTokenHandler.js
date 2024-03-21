import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

const validateToken= asyncHandler(async (req,res,next) => {
    // variable
    let token;
    let authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer")){
    // psq token yjiw f debut gae Bearer then space 
    token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
        if (err){
            res.status(401).json({message : 'User is not authorized'});
        }
        // i've verified the token and i have extracted the information which embedded in the token
        req.user = decoded.user;
        next();

    })
    if (!token){
        res.status(401).json({message : 'User is not authorized or token expired'});
    }
}

});

export {validateToken};