import express from "express";
import dotenv from "dotenv";
import usersRoutes from "./routes/usersRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import rolesRoutes from "./routes/rolesRoutes.js";
import permissionsRoutes from "./routes/permissionsRoutes.js";
import strctureRoutes from "./routes/structureRoutes.js" ;
import productRoutes from "./routes/productRoutes.js";
import bonsRoute from "./routes/bonsRoute.js";
import fournisseurRoutes  from "./routes/fournisseurRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import bodyParser from "body-parser";
import session from 'express-session';
import notificationsRoutes from "./routes/notificationsRoutes.js"




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
app.use("/api/bons",bonsRoute);
app.use("/api/fournisseur",fournisseurRoutes);
app.use("/api/pdf",pdfRoutes);
app.use("/api/notifications",notificationsRoutes)

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
  });
