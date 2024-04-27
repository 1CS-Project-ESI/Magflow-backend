import asyncHandler from "express-async-handler";
import {Structure} from "../models/structuresModel.js";
import { Consumer, StructureResponsable, User } from "../models/usersModel.js";



const addStructure = async(req,res) =>{
  try{
  const {name} = req.body;

  const structure = await Structure.create({name})

  res.status(200).json({message : "structure created succesfully : ", structure})
} catch (error) {
  res.status(500).json({message : "error creating structure" , error : message.error})
}
}

const getResponsableStructure = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find all user IDs in structureresponsable for the specified structure
      const responsableIds = await StructureResponsable.findAll({ 
        attributes: ['user_id'] 
      });
  
      if (!responsableIds || responsableIds.length === 0) {
        return res.status(404).json({ message: "No responsible structure found" });
      }
  
      // Extract user IDs from the responsables
      const userIds = responsableIds.map(responsable => responsable.user_id);
  
      // Find users with the extracted user IDs and matching structure_id
      const responsables = await StructureResponsable.findAll({ 
        where: { user_id: userIds, id_structure: id }, 
        // attributes: ['id', 'firstname', 'lastname', 'email'] 
      });
  
      if (!responsables || responsables.length === 0) {
        return res.status(404).json({ message: "Responsible users not found for the specified structure" });
      }
  
      // Return the responsible users
      return res.status(200).json({ responsables });
    } catch (error) {
      return res.status(500).json({ message: "Error getting responsible structure", error: error.message });
    }
  });
  
  const getAllStructures = asyncHandler(async (req, res) => {
    try {
      // Find all structures
      const structures = await Structure.findAll();
  
      // Return the list of structures
      return res.status(200).json({ structures });
    } catch (error) {
      return res.status(500).json({ message: "Error getting structures", error: error.message });
    }
  });

  const deleteStructure = asyncHandler(async (req, res) => {
    try {
        const { structureId } = req.params;

        // Check if the structure has any associated users
        const usersCount = await Consumer.count({ where: { id_structure: structureId } });
        if (usersCount > 0) {
            return res.status(400).json({ message: "Cannot delete structure. It has associated users." });
        };

        // If both conditions are met, delete the structure
        await Structure.destroy({ where: { id: structureId } });

        return res.status(200).json({ message: "Structure deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting structure", error: error.message });
    }
});



const getStructureUsers = async(req,res)=>{

    try {
    const {id} = req.params;

   const users = await Consumer.findAll({
    where :{
        id_structure :id 
    }
   }) 
    return res.status(200).json({message : 'you got the structure users successfullyy ' , users})
} catch (error) {
    return res.status(500).json({message : 'you failed getting structure users' , message : error.message})
}
}



const addConsumerStructure = async (req, res) => {
  try {
    // Extract the required data from the request body
    const { userId, structureId } = req.params;

    // Find the consumer by user_id
    const consumer = await Consumer.findOne({ where: { user_id: userId } });
    if (!consumer) {
      return res.status(404).json({ message: "Consumer not found" });
    }

    // Update the consumer's structure
    await consumer.update({ id_structure: structureId });

    return res.status(200).json({ message: "Consumer structure updated successfully", consumer });
  } catch (error) {
    return res.status(500).json({ message: "Error updating consumer structure", error: error.message });
  }
};
  
  export {getResponsableStructure,getAllStructures,deleteStructure,getStructureUsers,addConsumerStructure,addStructure};