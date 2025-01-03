import express from "express";
import http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import morgan from 'morgan';
import helmet from 'helmet';
import cors from "cors";
import { Manager } from "./services/manager";
import usersRoute from './routes/userRoutes';

// Import controllers and routes if applicable
import { UserController } from "./controllers/user.controller";
import { PostController } from "./controllers/post.controller";

require('dotenv').config();
// Create the Express application
const app = express();

const manager = new Manager();

app.use(morgan('dev'));
app.use(helmet());
// Middleware
const corsOptions = {
    origin: 'http://localhost:3000', // Allowed origins
    credentials: true, // Allow credentials (cookies, etc.)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ['Content-Type'], // Allowed headers
  };
  
  app.use(cors(corsOptions));
  
  app.use(express.json());


//app.use(bodyParser.json());
// Create an HTTP server
const httpServer = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: 'http://localhost:3000', // React app domain
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true,
      },
    });
// Listen for socket events
io.on("connection", (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Handle a custom event (e.g., message from the client)
  socket.on("message", (data) => {
    console.log(`Message received from ${socket.id}:`, data);

    // Example: Broadcast the message to all connected clients
    io.emit("message", { sender: socket.id, ...data });
  });

  // Handle a custom event (e.g., new post creation notification)
  socket.on("new_post", (data) => {
    console.log(`New post notification from ${socket.id}:`, data);

    // Notify all clients about the new post
    io.emit("new_post", data);
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Periodically calculate time budgets and ask the user with the highest budget to create a post
setInterval(async () => {
    try {
      await manager.calculateTimeBudgetForAllUsers();
      await manager.askUserWithHighestTimeBudgetToCreatePost();
    } catch (error) {
      console.error("Error in manager execution:", error);
    }
  }, 10000); // Every 10 seconds (adjust as needed)

// Define API routes (example for User and Post)
app.post("/api/users", UserController.createUser);
app.put("/api/users/:id", UserController.updateUser);
app.use("/api", usersRoute);
app.post("/api/posts", PostController.createPost);


export default httpServer;