import { User } from "../models/user/user.model";
import { TimeBudget } from "../models/user/timeBudget.model";
import { Post } from "../models/content/post.model";
import app from "../app";
import http from 'http';
import { Server } from 'socket.io';
import axios from 'axios';
import responseLogger from '../utils/logs/logger';

const API_BASE_URL = 'http://localhost:1076/api';  

const httpServer = http.createServer(app); // Create an HTTP server
const io = new Server(httpServer, {
  cors: {
    origin:['http://localhost:3000','http://localhost:5000', 'http://localhost:5000'], // React app domain
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

io.on('connection', (socket) => {
    // Adjusted log format to follow Winston's structure
    responseLogger.debug({ message: `WebSocket connected: ${socket.id}` });

    const manager = new Manager();

    setInterval(async () => {
        try {
          await manager.calculateTimeBudgetForAllUsers();
          await manager.askUserWithHighestTimeBudgetToCreatePost();
          const response = await axios.get(`${API_BASE_URL}/total-Time`); 
          
          // Example of another structured log
          responseLogger.debug({ message: `Total Time fetched: ${response.data}` });
          socket.emit('update-data', response.data);
          
        } catch (error) {
          console.error("Error in manager execution:", error);
        }
      }, 10000);
  
    socket.on('disconnect', () => {
      responseLogger.debug(`WebSocket disconnected: ${socket.id}`);
    });
  });

export class Manager {
  /**
   * Calculate the time budget for each user and update it.
   */
  async calculateTimeBudgetForAllUsers() {
    const users = await User.find().populate("timeBudget");
  
    // Iterate over users to calculate their available time
    for (const user of users) {
      if (user.timeBudget) {
        const timeBudget = user.timeBudget as any;
        const availableTime = timeBudget.totalTime - timeBudget.usedTime; 
        responseLogger.debug({ message: `User: ${user.username}`});
        responseLogger.debug({ message: `Available Time: ${availableTime}` });
      } else {
        console.warn(`User: ${user.username} has no associated timeBudget.`);
      }
    }
  }
  

  /**
   * Find the user with the highest time budget and ask them to create a post.
   */
  async askUserWithHighestTimeBudgetToCreatePost(): Promise<void> {
    const users = await User.find().populate("timeBudget");
  
    let highestTimeBudgetUser = null;
    let highestAvailableTime = -1;
  
    for (const user of users) {
      if (user.timeBudget) {
        const timeBudget = user.timeBudget as any;
        const availableTime = timeBudget.totalTime - timeBudget.usedTime;
  
        // Update the user with the highest available time budget
        if (availableTime > highestAvailableTime) {
          highestAvailableTime = availableTime;
          highestTimeBudgetUser = user;
        }
      } else {
        console.warn(`User ${user.username} has no associated timeBudget.`);
      }
    }
  
    if (highestTimeBudgetUser && highestAvailableTime > 0) {
      const user = highestTimeBudgetUser;
  
      // Generate a post for the user
      const postContent = `This is a post created by ${user.name} at ${new Date().toISOString()}.`;
  
      // Save the post
      const post = new Post({
        content: postContent,
        createdBy: user._id,
        success: 0, // New posts start with zero success
      });
      await post.save();
  
      responseLogger.debug(`User ${user.name} (with highest time budget) created a post.`);
    } else {
      responseLogger.debug("No user has enough time budget to create a post.");
    }
  }
  
  
}
  