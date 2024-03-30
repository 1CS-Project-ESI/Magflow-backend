import asyncHandler from "express-async-handler";
import {UsersRoles,Role} from "../models/rolesModel.js";
import {RolePermissions,Permission} from "../models/permissionsModel.js"

// const addRole =asyncHandler (async (req, res) => {
//     try {
//         const { roleName } = req.body;

//         // Check if the role name is provided
//         if (!roleName) {
//             return res.status(400).json({ message: 'Role name is required' });
//         }

//         // Check if the role already exists
//         const existingRole = await Role.findOne({ where: { name: roleName } });
//         if (existingRole) {
//             return res.status(400).json({ message: `Role '${roleName}' already exists` });
//         }

//         // Create the new role
//         const newRole = await Role.create({ name: roleName });

//         // Return the newly created role
//         return res.status(201).json({ message: 'Role created successfully', role: newRole });
//     } catch (error) {
//         return res.status(500).json({ message: `Error adding role: ${error.message}` });
//     }
// });

const getAllRoles = async(req,res)=>{
    try {
        const roles = await Role.findAll();
        
        res.status(200).json({roles});

    } catch (error){
        res.status(500).json({message : "failed to get roles" , error : error.message})
    }
};


const updateRolePermissions = async (req, res) => {
    try {
        const { id } = req.params;
        const { permissions } = req.body;

        // Retrieve existing permissions associated with the role
        const existingRolePermissions = await RolePermissions.findAll({
            where: { role_id: id }
        });

        // Extract existing permission IDs
        const existingPermissionIds = existingRolePermissions.map(permission => permission.permission_id);

        // Retrieve new permission IDs from the provided permission names
        const newPermissionIds = [];
        for (const permissionName of permissions) {
            const permission = await Permission.findOne({ where: { name: permissionName } });
            if (permission) {
                newPermissionIds.push(permission.id);
            }
        }

        // Find permission IDs to add and delete
        const permissionsToAdd = newPermissionIds.filter(id => !existingPermissionIds.includes(id));
        const permissionsToDelete = existingPermissionIds.filter(id => !newPermissionIds.includes(id));

        // Add new role permissions
        await Promise.all(permissionsToAdd.map(permissionId => RolePermissions.create({
            role_id: id,
            permission_id: permissionId
        })));

        // Delete existing role permissions
        await RolePermissions.destroy({
            where: {
                role_id: id,
                permission_id: permissionsToDelete
            }
        });

        return res.status(200).json({ message: "Role permissions updated successfully" });
    } catch (error) {
        console.error("Error updating role permissions:", error);
        return res.status(500).json({ message: "Error updating role permissions", error: error.message });
    }
};

export {  updateRolePermissions ,getAllRoles };