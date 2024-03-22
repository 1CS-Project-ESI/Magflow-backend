import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken"
import {User,Admin,Magasinier,StructureResponsable,Consumer,Director,AgentServiceAchat} from "../models/usersModel.js";
import bcrypt from "bcrypt"

const loginUser = asyncHandler(async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await User.findOne({
            where: {
                email   
            },
        });

        if (!user) {
            return res.status(404).send({ message: "User Not found." });
        }

        const passwordIsValid = await bcrypt.compare(
            req.body.password,
            user.password);
        
        
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

const generateMatricule = () => {
    // Generate a random number and convert it to a string
    const randomNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    // Concatenate a prefix to the random number (you can adjust the prefix as needed)
    return 'ADMIN' + randomNumber;
};
const createUser = asyncHandler(async (req, res) => {
    try {
        const { firstname, lastname, email, password, phone, isactive, role } = req.body;

        // Validate required fields
        if (!firstname || !lastname || !email || !password || !phone || !isactive || !role) {
            return res.status(400).json({ message: "All fields are mandatory" });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const newuser = await User.create({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            phone,
            isactive,
        });

        let roleModel;
        switch (role) {
            case 'admin':
                roleModel = Admin;
                break;
            case 'director':
                roleModel = Director;
                break;  
            case 'consumer':
                roleModel = Consumer;
                break;
            case 'magasinier':
                roleModel = Magasinier;
                break;
            case 'agentserviceachat':
                roleModel = AgentServiceAchat;
                break;
            case 'structureresponsable':
                roleModel = StructureResponsable;
                break;
            default:
                return res.status(400).json({ message: "Invalid role" });
        }

        await roleModel.create({
            matricule: generateMatricule(), 
            user_id: newuser.id,
        });

        return res.status(201).json({ message: "User created successfully", user: newuser });
    } catch (error) {
        return res.status(500).json({ message: "Error creating user", error: error.message });
    }
});

  export { loginUser , createUser};

 