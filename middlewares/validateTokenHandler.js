import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { User } from "../models/usersModel.js";

const validateToken = asyncHandler(async (req, res, next) => {
    try {
        let token;
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer")) {
            const [, token] = authHeader.split(" ");
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const userId = decoded.id;

            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            req.user = user;
            next();
        } else {
            return res.status(401).json({ message: 'No token provided' });
        }
    } catch (error) {
        return next(new Error('User is not authorized or token expired'));
    }
});

export { validateToken };
