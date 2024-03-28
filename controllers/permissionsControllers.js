import asyncHandler from "express-async-handler";
import {Permission,RolePermissions} from "../models/permissionsModel.js";
import {Role} from "../models/rolesModel.js";

// const addPermission = async (req, res) => {
//     try {
//         const { name } = req.body;

//         // Check if name is provided
//         if (!name) {
//             return res.status(400).json({ message: 'Permission name is required' });
//         }

//         // Create the permission
//         const permission = await Permission.create({ name });

//         // Return success response
//         return res.status(201).json({ message: 'Permission created successfully', permission });
//     } catch (error) {
//         return res.status(500).json({ message: `Error creating permission: ${error.message}` });
//     }
// };

const updatePermissionRoles = async (req, res) => {
    try {

        const { id } = req.params;
        const { roles } = req.body;

        // Retrieve existing roles associated with the permission
        const existingRolePermissions = await RolePermissions.findAll({
            where: { permission_id: id }
        });

        // Extract existing role IDs
        const existingRoleIds = existingRolePermissions.map(rolePermission => rolePermission.role_id);

        // Retrieve new role IDs from the provided role names
        const newRoleIds = [];
        for (const roleName of roles) {
            const role = await Role.findOne({ where: { name: roleName } });
            if (role) {
                newRoleIds.push(role.id);
            }
        }

        // Find role IDs to add and delete
        const rolesToAdd = newRoleIds.filter(id => !existingRoleIds.includes(id));
        const rolesToDelete = existingRoleIds.filter(id => !newRoleIds.includes(id));

        // Add new role permissions
        await Promise.all(rolesToAdd.map(roleId => RolePermissions.create({
            role_id: roleId,
            permission_id: id
        })));

        // Delete existing role permissions
        await RolePermissions.destroy({
            where: {
                role_id: rolesToDelete,
                permission_id: id
            }
        });

        return res.status(200).json({ message: "Permission roles updated successfully" });
    } catch (error) {
        console.error("Error updating permission roles:", error);
        return res.status(500).json({ message: "Error updating permission roles", error: error.message });
    }
};

export { updatePermissionRoles };