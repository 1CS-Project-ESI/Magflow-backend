import express from "express";
import dotenv from "dotenv";
import usersRoutes from "./routes/usersRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import rolesRoutes from "./routes/rolesRoutes.js";
import permissionsRoutes from "./routes/permissionsRoutes.js";
import strctureRoutes from "./routes/structureRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import bonsRoute from "./routes/bonsRoute.js";
import fournisseurRoutes from "./routes/fournisseurRoutes.js";
import fileUploadRoutes from "./routes/fileUploadRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import statisticsRoute from "./routes/statisticsRoute.js";
import bodyParser from "body-parser";
import session from 'express-session';
import notificationsRoutes from "./routes/notificationsRoutes.js";
import inventaireRoutes from "./routes/inventaireRoutes.js";
import { createServer } from 'http';
import { Server } from 'socket.io';
import { sequelize } from './models/usersModel.js'; 

const app = express();
dotenv.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'magflow123',
  resave: false,
  saveUninitialized: true
}));

const port = process.env.PORT || 5000;

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/permissions", permissionsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/structures", strctureRoutes);
app.use("/api/store", productRoutes);
app.use("/api/bons", bonsRoute);
app.use("/api/fournisseur", fournisseurRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/upload", fileUploadRoutes);
app.use("/api/inventaire", inventaireRoutes);
app.use("/api/statistics", statisticsRoute);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins, adjust this as needed for your project
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

export { io };

server.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  try {
    await sequelize.authenticate();
    console.log('Database connected!');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});
