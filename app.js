import express from "express";
import dotenv from "dotenv";
import usersRoutes from "./routes/usersRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import rolesRoutes from "./routes/rolesRoutes.js";
import permissionsRoutes from "./routes/permissionsRoutes.js";
import strctureRoutes from "./routes/structureRoutes.js" ;
import productRoutes from "./routes/productRoutes.js";
import bodyParser from "body-parser";
import session from 'express-session';



const app = express();
dotenv.config();

app.use(bodyParser.json());

// Parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'magflow123',
  resave: false,
  saveUninitialized: true
}));

const port= process.env.PORT|| 5000;

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/permissions", permissionsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/structures", strctureRoutes);
app.use("/api/store", productRoutes);

// Execute a SQL query to test the db connection
// pool.query('select * from admin')
//   .then(result => {
//     // Handle the result of the query
//     console.log('Admins retrieved successfully:', result.rows);
//   })
//   .catch(error => {
//     // Handle any errors that occurred during the query
//     console.error('Error retrieving admins:', error);
//   })
//   .finally(() => {
//     // Close the database connection
//     pool.end();
//   });


app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
  });
