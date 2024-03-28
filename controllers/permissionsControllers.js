import asyncHandler from "express-async-handler";
import {Permission,RolePermissions} from "../models/permissionsModel.js";

const addPermission = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Permission name is required' });
        }


        const permission = await Permission.create({ name });
        
        return res.status(201).json({ message: 'Permission created successfully', permission });
    } catch (error) {
        return res.status(500).json({ message: `Error creating permission: ${error.message}` });
    }
};

export { addPermission };