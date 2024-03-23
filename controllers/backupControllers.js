import Backup from "../models/backupModel.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import asyncHandler from "express-async-handler";
import { exec } from 'child_process';

import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backupDirectoryPath = path.join(__dirname); // , 'backups' in case 

// backupdata base function 


export const backupDatabase = (filepath, tables) => {
  return new Promise((resolve, reject) => {
    const databaseUser = process.env.DB_USER;
    const databasePassword = process.env.DB_PASSWORD;
    const databaseHost = process.env.DB_HOST;
    const databasePort = process.env.DB_PORT;
    const databaseName = process.env.DB_DATABASE;
    
    let command;

    if (tables && tables.length > 0) {
    const tablesList = tables.join(' ');
    command = `pg_dump -h ${databaseHost} -p ${databasePort} -U ${databaseUser} -d ${databaseName} 
    --data-only --inserts -t ${tablesList} > ${filepath}`;

    } else {
      command = `pg_dump -h ${databaseHost} -p ${databasePort} -U ${databaseUser} -d ${databaseName} --data-only --inserts > ${filepath}`;
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

// end of funcion 




const createBackup = asyncHandler(async (req, res) => {
    try {
      const { tables } = req.body;
  
      // Generate a unique file name for the backup
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const filename = `backup_${timestamp}.sql`;
      const filepath = path.join(backupDirectoryPath, filename);
      console.log(`content of filename ${filename}`);
      console.log(`content of filename ${filepath}`);
      // Create the backups directory if it doesn't exist
    //   if (!fs.existsSync(backupDirectoryPath)) {
    //     fs.mkdirSync(backupDirectoryPath, { recursive: true });
    //   }
  
      // Check if a backup for the same tables already exists
    //   const existingBackup = await Backup.findOne(
    //     // {where: { tables: JSON.stringify(tables) },}
    //     );
  
      // Create or update the backup record
      let backup;
    //   if (existingBackup) {
    //     // Update the existing backup record
    //     await backupDatabase(filepath, tables);
    //     existingBackup.filename = filename;
    //     existingBackup.filepath = filepath;
    //     backup = await existingBackup.save();
    //   } else {
        // Create a new backup record
        // await backupDatabase(filepath, tables);
        backupDatabase(filepath, tables);
        backup = await Backup.create({ filename, filepath}); // , tables: JSON.stringify(tables)  in case to store the table lists 
    //   }
  
      return res.status(200).json({
        message: 'Backup created/updated successfully',
        backup,
      });
    } catch (error) {
        return res.status(500).json({
          message: 'Error creating/updating backup',
          error: error.message,
        });
      }
    });



// get all the backups 
 const getAllBackups = asyncHandler(async (req, res) => {
    try {
      // Fetch all records from the Backup model
      const backups = await Backup.findAll();
  
      return res.status(200).json({
        message: 'All backups retrieved successfully',
        backups,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Error retrieving backups',
        error: error.message,
      });
    }
  });











    export {createBackup , getAllBackups} ;