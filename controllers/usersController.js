import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken"
import User from "../models/usersModel.js";
import bcrypt from "bcrypt"

const loginUser = asyncHandler(async (req, res) => {
    try {
        // if (!email || !password) {
        //     return res.status(400).json({ message: "Email and password are required" });
        // }
        const user = await User.findOne({
            where: {
                email: req.body.email,
            },
        });

        if (!user) {
            return res.status(404).send({ message: "User Not found." });
        }

        const passwordIsValid = bcrypt.compare(
            req.body.password,
            user.password)
        
        
        if (!passwordIsValid) {
            return res.status(401).send({
                message: "Invalid Password!",
            });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: 86400, // 24 hours
        });

        // Initialize req.session if not already initialized
        req.session = req.session || {};

        req.session.token = token;

        return res.status(200).send({
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            accessToken: token
        });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
});


const createUser = asyncHandler(async (req, res) => {
    try {

        const { firstname, lastname, email, password, phone, isactive } = req.body;
        // if (!firstname || !lastname || !email || !password || !phone || !isactive) {
        //     return res.status(400).json({ message: "All fields are mandatory" });
        // }


        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Adjust the saltRounds as needed

        const newUser = await User.create({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            phone,
            isactive,
        });

        return res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error) {
        return res.status(500).json({ message: "Error creating user", error: error.message });
    }
});

  export { loginUser , createUser};

 