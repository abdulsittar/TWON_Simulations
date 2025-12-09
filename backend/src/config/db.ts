import mongoose from "mongoose";
import { User } from "../models/user/user.model"; 
import { TimeBudget } from '../models/user/timeBudget.model';
import { ENV } from "./env";

const connectDB = async (databaseName?: string) => {
    try {
    
      if (mongoose.connection.readyState !== 0) {  // If the connection is not disconnected
        await mongoose.disconnect();  // Disconnect the previous connection
      }
    
      let mongoUri = ENV.MONGO_URI;
  
    // If a database name is provided, use it, otherwise use the default URI from ENV
    if (databaseName && databaseName !== "") {
      mongoUri = ENV.MONGO_URI.replace(/\/([^/?]+)(?=\?)/, `/${databaseName}`);
    }
    console.log(databaseName)
    console.log(mongoUri)
      await mongoose.connect(mongoUri);
      //console.log(ENV.MONGO_URI);
      console.log("MongoDB connected");
  
      // Function to delete all users and time budgets
      async function deleteAllData() {
        try {
          // Deleting all users
          await User.deleteMany({});
          console.log("All users have been deleted.");
  
          // Deleting all time budgets
          await TimeBudget.deleteMany({});
          console.log("All time budgets have been deleted.");
        } catch (error) {
          console.error("Error deleting data:", error);
        }
      }
  
      // Call deleteAllData first
      //await deleteAllData();
  
      // Function to create dummy data
      async function createDummyData() {
        try {
          // Create 5 dummy TimeBudget entries with initial usedTime set to 0
          const timeBudgets = await TimeBudget.insertMany([
            { totalTime: 500, replenishRate: 10, usedTime: 0 },
            { totalTime: 1000, replenishRate: 15, usedTime: 0 },
            { totalTime: 1500, replenishRate: 20, usedTime: 0 },
            { totalTime: 2000, replenishRate: 25, usedTime: 0 },
            { totalTime: 2500, replenishRate: 30, usedTime: 0 },
          ]);
          console.log('TimeBudget entries created:', timeBudgets);
  
          // Create 5 dummy User entries and associate them with the TimeBudget entries
          const users = await User.insertMany([
            {
              username: 'user1',
              name: 'User One',
              email: 'user1@example.com',
              motivation: 80,
              engagement: 90,
              success: 85,
              timeBudget: timeBudgets[0]._id, // Link to TimeBudget
            },
            {
              username: 'user2',
              name: 'User Two',
              email: 'user2@example.com',
              motivation: 70,
              engagement: 80,
              success: 75,
              timeBudget: timeBudgets[1]._id, // Link to TimeBudget
            },
            {
              username: 'user3',
              name: 'User Three',
              email: 'user3@example.com',
              motivation: 60,
              engagement: 70,
              success: 65,
              timeBudget: timeBudgets[2]._id, // Link to TimeBudget
            },
            {
              username: 'user4',
              name: 'User Four',
              email: 'user4@example.com',
              motivation: 90,
              engagement: 100,
              success: 95,
              timeBudget: timeBudgets[3]._id, // Link to TimeBudget
            },
            {
              username: 'user5',
              name: 'User Five',
              email: 'user5@example.com',
              motivation: 50,
              engagement: 60,
              success: 55,
              timeBudget: timeBudgets[4]._id, // Link to TimeBudget
            },
          ]);
  
          console.log('Users created:', users);
        } catch (error) {
          console.error('Error creating dummy data:', error);
        }
      }
  
      // Call createDummyData after data deletion
      //await createDummyData();
  
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };
  

export default connectDB;
