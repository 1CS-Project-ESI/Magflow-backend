import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { User } from "../models/usersModel.js";

const validateToken = asyncHandler(async (req, res, next) => {
    try {
        let token;
        let authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer")) {
            token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const userId = decoded.id; // Assuming the user ID is stored in the token

            // Fetch user from the database using the user ID
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Attach the user object to the request
            req.user = user;
            next();
        } else {
            return res.status(401).json({ message: 'User is not authorized or token expired' });
        }
    } catch (error) {
        return res.status(401).json({ message: 'User is not authorized or token expired' });
    }
});

export { validateToken };
