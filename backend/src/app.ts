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
import postsRoute from './routes/postsRoutes';
import networkRoutes from "./routes/networkRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import connectDB from "./config/db";
import path from 'path';

//import totalVisit from './data/totalVisit';
// Import controllers and routes if applicable
import { UserController } from "./controllers/userController";
import { NetworkController } from "./controllers/networkController";
import { SimulationController } from "./controllers/simulationController";
import { PostController } from "./controllers/postController";

require('dotenv').config();
// Create the Express application
const app = express();

const manager = new Manager();

app.use(morgan('dev'));
app.use(helmet());
// Middleware
const corsOptions3 = {
    origin: ['http://localhost:3000','http://localhost:5000',  'http://localhost:5000'], // Allowed origins
    credentials: true, // Allow credentials (cookies, etc.)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ['Content-Type'], // Allowed headers
  };
  
  const corsOptions = {
    origin: ["http://localhost:1076"], // allow frontend origin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  
  app.use(cors(corsOptions));
  
  app.use(express.json());
  
  app.use(usersRoute);
  app.use(postsRoute);
  
  //app.get('/totalvisit', (req, res) => {
  //  res.json(totalVisit);
  //});

// Define API routes (example for User and Post)

app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.post("/users/create", UserController.createUser);
app.post("/users/getAllUsers", UserController.getAllUsers);
app.get('/users/listDatabases', UserController.listAllDatabases);
app.post("/users/get_totalTime", UserController.get_totalTime);
app.post("/users/get_replenishTime", UserController.get_replenishTime);
app.post("/users/get_usedTime", UserController.get_usedTime);
app.post("/users/latestAnalytics", UserController.latestAnalytics);
app.post("/users/sentimentScores", UserController.sentimentScores);
app.post("/users/sentimentScores", UserController.sentimentScoresFromComments);



app.post("/users/latestUserActions", UserController.latestUserActions);
app.post("/users/connect", UserController.connectToDatabase);

app.post("/users/getUsersData", UserController.getUsersData);
app.post("/users/getComments", UserController.getComments);
app.post("/users/getPosts", UserController.getPosts);

app.post("/posts/createPost", PostController.createPost);
app.post("/posts/get_postsPerUser", PostController.get_postsPerUser);
app.post("/posts/get_postsPerUserWithLowRanking", PostController.get_postsPerUserWithLowRanking);

 

//app.put("/users/:id", UserController.updateUser);
app.post("/network/create", NetworkController.createNetwork);
app.post("/simulation/startSimulation", SimulationController.startSimulation); 
app.post("/simulation/stopSimulation", SimulationController.stopSimulation);
//app.post("/api/posts", PostController.createPost);

//app.use(bodyParser.json());
// Create an HTTP server
const httpServer = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(httpServer, {
    cors: {
        origin:  ['http://localhost:3000','http://localhost:5000'], // React app domain
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
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
  socket.on("new_post", (data) => {-
    console.log(`New post notification from ${socket.id}:`, data);

    // Notify all clients about the new post
    io.emit("new_post", data);
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});


connectDB();

// Periodically calculate time budgets and ask the user with the highest budget to create a post
/*setInterval(async () => {
    try {
      await manager.calculateTimeBudgetForAllUsers();
      await manager.askUserWithHighestTimeBudgetToCreatePost();
    } catch (error) {
      console.error("Error in manager execution:", error);
    }
  }, 10000); // Every 10 seconds (adjust as needed)*/




export default httpServer;
export {io};