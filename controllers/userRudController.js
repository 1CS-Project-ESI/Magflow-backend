import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken"
import {User,Admin,Magasinier,StructureResponsable,Consumer,Director,AgentServiceAchat} from "../models/usersModel.js";
import {UsersRoles,Role} from "../models/rolesModel.js";
import bcrypt from "bcrypt"

const generateMatricule = () => {
    // Generate a random number and convert it to a string
    const randomNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    // Concatenate a prefix to the random number (you can adjust the prefix as needed)
    return 'MAT' + randomNumber;
}; 

const deleteUserByemail = asyncHandler(async (req, res) => {
    try {
        const { email } = req.params;

        const user = await User.findOne({ where: { email } });
        // get user Rolename by his id 
        const deledtdUserRole = await UsersRoles.findOne({ where: { user_id: user.id } });
        const roleModelObj = await Role.findOne({ where: { id: deledtdUserRole.role_id } });
        const deletedUserROle = roleModelObj.name; 
       
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // delete from Role table 
        let RoleTablename = null;
        switch (deletedUserROle) {
            case 'admin':
                RoleTablename = Admin;
                break;
            case 'director':
                RoleTablename = Director;
                break;  
            case 'consumer':
                RoleTablename = Consumer;
                break;
            case 'magasinier':
                RoleTablename = Magasinier;
                break;
            case 'agentserviceachat':
                RoleTablename = AgentServiceAchat;
                break;
            case 'structureresponsable':
                RoleTablename = StructureResponsable;
                break;
            default:
                return res.status(400).json({ message: "Invalid role" });
        };
        if (RoleTablename) {
             await RoleTablename.destroy({ where: { user_id: user.id } });
          };
        // delete from UserRoles table 
        await UsersRoles.destroy({ where: { user_id: user.id } }); 
        console.log("deleted from UserRoles table ");
          // delete from User table 
        await User.destroy({ where: { id: user.id} });                
        console.log("deleted from User table ");

        return res.status(200).json({ message: "User deleted successfully" });
    }
  catch (error) {
        return res.status(500).json({ message: "Error deleting user", error: error.message });
    }
});


const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const users = await User.findAll();
        return res.status(200).json({ users });
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving users", error: error.message });
    }
});


const updateUserByEmail = asyncHandler(async (req, res) => {
    try {
    
    const { email } = req.params;
    const { firstname, lastname, newEmail ,password, phone, isactive, role } = req.body; 
    const user = await User.findOne({ where: { email } });
    console.log(user);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Update user data
      user.firstname = firstname;
      user.lastname = lastname;
      user.email = newEmail;
      user.phone = phone;
      user.isactive = isactive;
  
      // If password is provided, hash and update it
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
      }
  
      // Save the updated user
      await user.save();
  
      // retreive the user currrent role 
      const currentUserRole = await UsersRoles.findOne({ where: { user_id: user.id } });
      const roleModelObj = await Role.findOne({ where: { id: currentUserRole.role_id } });
      const oldUserRole = roleModelObj.name; 
    
      if (role) {

        // test if the role field exist in the Role table 
        const existingRole = await Role.findOne({ where: { name: role } });

        if (!existingRole) {
          return res.status(400).json({ message: "Invalid role" });
        }
        // update the UserRole by the new Role_id field 
        await UsersRoles.update( 
            { role_id: existingRole.id },
            { where: { user_id: user.id } }
          );
        
        // add  user to his  new role table
        const existingRoleName = existingRole.name;
        let newRole = null; 
        switch (existingRoleName) {
            case 'admin':
                newRole = Admin;
                break;
            case 'director':
                newRole = Director;
                break;  
            case 'consumer':
                newRole = Consumer;
                break;
            case 'magasinier':
                newRole = Magasinier;
                break;
            case 'agentserviceachat':
                newRole = AgentServiceAchat;
                break;
            case 'structureresponsable':
                newRole = StructureResponsable;
                break;
            default:
                return res.status(400).json({ message: "Invalid role" });
        };
       
        await newRole.create({
            matricule: generateMatricule(), 
            user_id: user.id,
        });

        // delete from old role table 
        let oldRole = null; 
        switch (oldUserRole) {
            case 'admin':
                oldRole = Admin;
                break;
            case 'director':
                oldRole = Director;
                break;  
            case 'consumer':
                oldRole = Consumer;
                break;
            case 'magasinier':
                oldRole = Magasinier;
                break;
            case 'agentserviceachat':
                oldRole = AgentServiceAchat;
                break;
            case 'structureresponsable':
                oldRole = StructureResponsable;
                break;
            default:
                return res.status(400).json({ message: "Invalid role" });
        };
        if (oldRole) {
             await oldRole.destroy({ where: { user_id: user.id } });
            console.log(`Deleted from ${oldRole} table`);
          };

        }

      return res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
        
      return res.status(500).json({ message: "Error updating user", error: error.message });
      
    }
  });

export { deleteUserByemail  , getAllUsers, updateUserByEmail };

 