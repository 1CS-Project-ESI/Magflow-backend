import express from "express";
import dotenv from "dotenv";
import { pool } from "./config/dbConnection.js";

const app = express();
dotenv.config();

const port= process.env.PORT|| 5000;




// Execute the SQL query
pool.query('select * from admin')
  .then(result => {
    // Handle the result of the query
    console.log('Admins retrieved successfully:', result.rows);
  })
  .catch(error => {
    // Handle any errors that occurred during the query
    console.error('Error retrieving admins:', error);
  })
  .finally(() => {
    // Close the database connection
    pool.end();
  });

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
  });
