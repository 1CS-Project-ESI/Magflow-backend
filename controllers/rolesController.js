import asyncHandler from "express-async-handler";
import {UsersRoles,Role} from "../models/rolesModel.js";
import {RolePermissions,Permission} from "../models/permissionsModel.js"

const addRole =asyncHandler (async (req, res) => {
    try {
        const { roleName } = req.body;

        if (!roleName) {
            return res.status(400).json({ message: 'Role name is required' });
        }

        // Check if the role already exists
        const existingRole = await Role.findOne({ where: { name: roleName } });
        if (existingRole) {
            return res.status(400).json({ message: `Role '${roleName}' already exists` });
        }

        // Create the new role
        const newRole = await Role.create({ name: roleName });

        // Return the newly created role
        return res.status(201).json({ message: 'Role created successfully', role: newRole });
    } catch (error) {
        return res.status(500).json({ message: `Error adding role: ${error.message}` });
    }
});

const updateRole = async (req, res) => {
    try {
        const {id} = req.params;
        const { name, permissions } = req.body;
        console.log(id)
        
        // Retrieve existing permissions associated with the role
        const existingPermissions = await RolePermissions.findAll({
            where: { role_id: id }
        });
        console.log(existingPermissions)
        // Extract existing permission IDs
        let existingPermissionIds = [];
        if (existingPermissions && existingPermissions.length > 0) {
            existingPermissionIds = existingPermissions.map(permission => permission.permission_id);
            console.log(existingPermissionIds);
            // Proceed with updating role permissions using existingPermissionIds
        } else {
            console.log("No existing permissions found for the role ID:", id);
            // Handle the case where no existing permissions are found for the given role ID
        };

        let newPermissionIds = [];
        for (const permissionName of permissions) {
            const permission = await Permission.findOne({ where: { name: permissionName } });
            if (permission) {
                newPermissionIds.push(permission.id);
            }
        }
        
        console.log(newPermissionIds);
        let filteredNewPermissionIds =[];
        filteredNewPermissionIds = newPermissionIds.filter(id => !existingPermissionIds.includes(id));
        console.log(filteredNewPermissionIds);

        for (const permissionId of filteredNewPermissionIds) {
            await RolePermissions.create({
                role_id: id, // Assuming roleId is the ID of the role being updated
                permission_id: permissionId
            });
        }
        
        console.log("New role permissions added successfully");

        const permissionsToDelete = existingPermissionIds.filter(id => !newPermissionIds.includes(id));
        
        console.log(permissionsToDelete)

        await RolePermissions.destroy({
            where: {
              role_id: id,
              permission_id: permissionsToDelete
            }
          });


        return res.status(200).json({ message: "Role permissions updated successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error updating role permissions", error: error.message });
    }
};

export { addRole , updateRole };