import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken"
import {User,Admin,Magasinier,StructureResponsable,Consumer,Director,AgentServiceAchat} from "../models/usersModel.js";
import {UsersRoles,Role} from "../models/rolesModel.js";
import {sendEmail, sendAccountCreationEmail, sendAccountActivationEmail} from "../middlewares/sendEmail.js";
import bcrypt from "bcrypt"
import { v4 as uuidv4 } from 'uuid'; // lib to generate the reset token 
import { Op } from "sequelize";
import session from "express-session";

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
        };

        if (!user.isactive) {
            return res.status(403).send({ message: "Account is deactivated. Please contact support." });
        };

        const passwordIsValid = await bcrypt.compare(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).send({
                message: "Invalid Password!",
            });
        }

        const token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: 86400, // 24 hours
        });

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

const logoutUser = asyncHandler(async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
      }
  
      // Extracting the token from the Authorization header
      const token = authHeader.split(' ')[1];
  

      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: 'Invalid or expired token' });
        }
  
        return res.status(200).json({ message: 'Logout successful' });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

const generateMatricule = () => {
    // Generate a random number and convert it to a string
    const randomNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    // Concatenate a prefix to the random number (you can adjust the prefix as needed)
    return 'MAT' + randomNumber;
};
const createUser = asyncHandler(async (req, res) => {
    try {
        const { firstname, lastname, email, password, phone, isactive, role,id_structure } = req.body;

        // Validate required fields
        // if (!firstname || !lastname || !email || !password || !phone || !isactive || !role || !id_structure) {
        //     return res.status(400).json({ message: "All fields are mandatory" });
        // };

        const existingRole = await Role.findOne({ where: { name: role } });
        if (!existingRole) {
            return res.status(400).json({ message: "Invalid role" });
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
            id_structure,
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
        
        const userRole = await UsersRoles.create({
            user_id: newuser.id,
            role_id: existingRole.id
        });
        
        await sendAccountCreationEmail(email, firstname, lastname, password);        

        return res.status(201).json({ message: "User created successfully", user: newuser });
    } catch (error) {
        return res.status(500).json({ message: "Error creating user", error: error.message });
    }
});


const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'Email not found.' });
        }

        
        const resettoken = uuidv4();

        // update
        await user.update({ resettoken});
        // console.log('Updated user:', user.toJSON());

        sendEmail(email, resettoken);

        return res.status(200).json({ message: 'Password reset email sent.' });
    } catch (error) {
        console.error('Error sending password reset email:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
    });
    


    const resetPassword = asyncHandler(async (req, res) => {
        const { resettoken } = req.params;
        // console.log('Reset token:', resettoken);
        const { newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match.' });
        }

        try {
            const user = await User.findOne({
                where: {
                    resettoken: {
                        [Op.eq]: resettoken
                    }
                }
            });
            // console.log('Found user:', user);
            if (!user) {
                return res.status(404).json({ message: 'Invalid or expired reset token.' });
            }
            
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await user.update({ password: hashedPassword, resettoken: null, resettokenexpiration: null });    

            return res.status(200).json({ message: 'Password reset successfully.' });
        } catch (error) {
            console.error('Error resetting password:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    });

    const currentUser = asyncHandler(async (req,res)=>{
        console.log(req.user);
        res.json(req.user);
    });


    
    const deactivateAccount =asyncHandler( async (req, res) => {
        try {
            const { email } = req.body;
            const user = await User.findOne({ where: { email } });
            
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            user.isactive = false;
            await user.save();
            

            if (req.session) {
                req.session.destroy(); // Destroy the session
            }
            console.log("session",req.session);
            res.redirect('http://localhost:4000/api/auth/login')
        } catch (error) {
            return res.status(500).json({ message: "Error deactivating account", error: error.message });
        }
    });

    const activateAccount = asyncHandler(async (req, res) => {
        try {
            const { email } = req.body;
            
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            user.isactive = true;
            await user.save();
        
            await sendAccountActivationEmail(email); 

            return res.status(200).json({ message: 'account activated succesfully' });
        
        } catch (error) {
            return res.status(500).json({ message: 'Error activating account', error: error.message });
        }
    });
        


 export { loginUser , createUser, forgotPassword, resetPassword , currentUser , deactivateAccount, logoutUser, activateAccount};


 