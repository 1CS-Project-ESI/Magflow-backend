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
const backupDirectoryPath = path.join(__dirname);



export const backupDatabase = (filepath, tables) => {
  return new Promise((resolve, reject) => {
    const databaseUser = process.env.DB_USER;
    const databasePassword = process.env.DB_PASSWORD;
    const databaseHost = process.env.DB_HOST;

    const databaseName = process.env.DB_DATABASE;
    
    let command;

    if (tables && tables.length > 0) {
    const tablesList = tables.join(' ');
    
      command = `PGPASSWORD = "5Eq8jApoIJid" pg_dump ${databaseUser} -h ${databaseHost} -d ${databaseName}--data-only --inserts -t ${tablesList} > ${filepath}`;
      
    } else {
      command = `PGPASSWORD="5Eq8jApoIJid" pg_dump -U ${databaseUser} -h ${databaseHost} -d ${databaseName} --data-only > ${filepath}`;
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
      const filename = `backup_${timestamp}.csv`; //
      const filepath = path.join(backupDirectoryPath, filename);
      console.log(`content of filename ${filename}`);
      console.log(`content of filename ${filepath}`);
      
      let backup;
         await backupDatabase(filepath, tables); // to create backup file localy 
        backup = await Backup.create({ filename, filepath}); // to create the backup record in the db 
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