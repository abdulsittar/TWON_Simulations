import { Request, Response } from "express";
import { User } from "../models/user/user.model";
import { TimeBudget } from "../models/user/timeBudget.model"; // Assuming TimeBudget model exists
import { AMCDOpinionModel } from "../models/user/opinion.model";
import { SimpleLogger } from "../models/user/logger.model";
import { DefaultActor } from "../models/user/actor.model";
import { Analytics } from "../models/content/analytics.model";
import { MotivationAnalytics } from "../models/content/motAnalytics.model";
import { TimeBudgetAnalytics } from "../models/content/timebudgetAna.model";
import { Actions } from "../models/content/actions.model";
import { RanAct } from "../models/content/rankAna.model";
import { IntAct } from "../models/content/interAna.model";
import mongoose from 'mongoose'; 
import connectDB from "../config/db";
import  responseLogger  from '../utils/logs/logger';


export class UserController {
  // Create a new user
  static async createUser(req: Request, res: Response) {
    try {
      console.log(req.body);

      // Check if timeBudget is provided
      if (!req.body.timeBudget) {
        return res.status(400).json({ error: "Time budget is required" });
      }

      // Create and save the time budget
      const timeBudget = new TimeBudget(req.body.timeBudget);
      try {
        const savedTimeBudget = await timeBudget.save();
        console.log("Saved Time Budget:", savedTimeBudget);

        // Initialize the agent-like properties
        const opinionModel = new AMCDOpinionModel({
          politics: 0,
          sports: 0,
          technology: 0, // Default opinions for example topics
        });

        const logger = new SimpleLogger();
        const actor = new DefaultActor();

        // Create the new user (agent) with all properties, including opinionModel, logger, actor
        const user = new User({
          ...req.body,
          loggedIn : false,
          timeBudget: savedTimeBudget._id, // Reference to the saved TimeBudget
          opinionModel,  // Add the opinionModel for the agent's opinions
          logger,        // Add the logger for the agent's actions
          actor,         // Add the actor defining how the agent behaves
          frustration: Math.floor(Math.random() * 50), // Default frustration level
          biases:{ politics: Math.random() },     // Default empty biases
          notificationEffect: Math.floor(Math.random() * 50),
          timeBudgetRemaining: req.body.timeBudget.totalTime - req.body.timeBudget.usedTime, // Remaining time budget
        });

        // Save the user to the database
        const savedUser = await user.save();
        console.log("User saved:", savedUser);

        res.status(201).json(savedUser); // Return the created user in response
      } catch (error) {
        console.error("Error saving TimeBudget:", error);
        res.status(400).json({ error: "Error saving time budget" });
      }
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({ error: "Error creating user" });
    }
  }

  static async getAllUsers(req: Request, res: Response) {
    //const { databaseName } = req.body; // Database name selected by the frontend

    //if (databaseName) {
    //  await connectDB(databaseName);  // Connect to the provided database
    //}
  
    try { 
      console.error("Fetching get All Users");
      const users = await User.find().populate("timeBudget"); // Populate timeBudget if it's a reference
      
      const formattedUsers = users.map((user, index) => ({
        id: index + 1,
        img: "https://images.pexels.com/photos/8405873/pexels-photo-8405873.jpeg?auto=compress&cs=tinysrgb&w=1600&lazy=load", // You can replace this with user-specific image URLs if available
        username: user.name || "Unknown User", // Adjust based on your schema
        email: user.email || "No Email", // Adjust based on your schema
        amount: (Math.random() * 5).toFixed(3), // Example to generate random amounts
      }));
      
      res.status(200).json(formattedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Error fetching users" });
    }
  }

  static async connectToDatabase(req: Request, res: Response) {
    const { databaseName } = req.body;
    
    try { 
      await connectDB(databaseName);
      // Define the response structure
      const response = { "success": "yes" };
      console.log("Connected to the new database");
      responseLogger.info(`agentFeatures.length && actionLabels.length and result is`);
      res.status(200).json(response);
    } catch (error) {
      console.error("Not connected to the new database", error);
      responseLogger.info(`agentFeatures.length && actionLabels.length and result is`, error);
      res.status(500).json({ error: "Error fetching users" });
    }
  }


  static async get_totalTime(req: Request, res: Response) {
    try {
      console.error("Fetching get All Users");
      const users = await User.find().populate("timeBudget"); // Populate timeBudget if it's a reference
      
      const chartData = users.map((user, index) => {
      const totalTime = (user.timeBudget as { totalTime: number }).totalTime || 20;
      return {
        name: `U ${index + 1}`, // Label the users as User 1, User 2, etc.
        visit: totalTime // Revenue is the totalTime from TimeBudget
      }
      });
      
      // Define the response structure
      const response = {
        color: "#FF8042",
        title: "Total Time", // Title of the chart
        dataKey: "visit", // The key representing the data in the chart (revenue)
        chartData, // The user-specific chart data (each user's totalTime as revenue, limited to 7 users)
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Error fetching users" });
    }
  }
  
  
  static async listAllDatabases(req: Request, res: Response) {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(500).json({ error: "MongoDB is not connected" });
      }
      const db = mongoose.connection.db;
      if (!db) {
        return res.status(500).json({ error: "Database object not initialized" });
      }
      const admin = db.admin();
  
      const result = await admin.listDatabases();
      const dbNames = result.databases.map(db => db.name);
  
      res.status(200).json(dbNames);
    } catch (error) {
      console.error("Error listing databases:", error);
      res.status(500).json({ error: "Failed to list databases" });
    }
  }
  
  static async get_replenishTime(req: Request, res: Response) {
    try {
      console.error("Fetching get All Users");
      const users = await User.find().populate("timeBudget"); // Populate timeBudget if it's a reference
      
      const chartData = users.map((user, index) => {
      
      const totalTime = (user.timeBudget as { replenishRate: number }).replenishRate || 20;
 
      return {
        name: `U ${index + 1}`, // Label the users as User 1, User 2, etc.
        visit: totalTime // Revenue is the totalTime from TimeBudget
      }
      });
      
      // Define the response structure
      const response = {
        color: "#FF8042",
        title: "Replenish Rate", // Title of the chart
        dataKey: "visit", // The key representing the data in the chart (revenue)
        chartData, // The user-specific chart data (each user's totalTime as revenue, limited to 7 users)
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Error fetching users" });
    }
  }
 
  static async get_usedTime(req: Request, res: Response) {
    try {
      console.error("Fetching get All Users");
      const users = await User.find().populate("timeBudget"); // Populate timeBudget if it's a reference
      
      const chartData = users.map((user, index) => { 
      
      const totalTime = (user.timeBudget as { usedTime: number }).usedTime || 20;

      return {
        name: `U ${index + 1}`, // Label the users as User 1, User 2, etc.
        visit: totalTime // Revenue is the totalTime from TimeBudget
      }
      });
      
      // Define the response structure
      const response = {
        color: "#FF8042",
        title: "Used Time", // Title of the chart
        dataKey: "visit", // The key representing the data in the chart (revenue)
        chartData, // The user-specific chart data (each user's totalTime as revenue, limited to 7 users)
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Error fetching users" });
    }
  }

  // Update a user
  static async updateUser(req: Request, res: Response) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Update TimeBudget if provided
      if (req.body.timeBudget) {
        await TimeBudget.findByIdAndUpdate(user.timeBudget, req.body.timeBudget);
      }

      // Update User (including any other properties)
      const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(400).json({ error: "Error updating user" });
    }
  }
  
  
  static async latestAnalytics(req: Request, res: Response) {
    try {
      const latestData = await Analytics.findOne().sort({ date: -1 });
  
      if (!latestData) {
        return res.status(404).json({ error: "No analytics data found" });
      }
  
      const seen = new Set();
  
      const activityData = latestData.userActivity
        .map(entry => {
          const date = new Date(entry.time);
          const formattedTime = date.toISOString().slice(0, 16).replace('T', ' '); // "YYYY-MM-DD HH:MM"
          
          return {
            time: formattedTime,
            user: entry.user,
            status: entry.status,
            action: entry.action
          };
        })
        .filter(entry => {
          const key = `${entry.time}-${entry.user}`; // ✅ Unique per user per minute
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
  
      res.status(200).json({
        userActivity: activityData,
        featureUsage: latestData.featureUsage,
        heatmapData: latestData.heatmapData,
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      res.status(500).json({ error: "Error fetching analytics data" });
    }
  }
  
  
  
  
  static async latestAnalytics3(req: Request, res: Response) {
    try {
      const latestData = await Analytics.findOne().sort({ date: -1 });
  
      if (!latestData) {
        return res.status(404).json({ error: "No analytics data found" });
      }
  
      // ✅ Extract user activity data for line chart without duplicates
      const seen = new Set();
      const activityData = latestData.userActivity
        .map(entry => {
          // Remove seconds from time (assumes string or Date object)
          const date = new Date(entry.time);
          const formattedTime = date.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
          return {
            time: formattedTime,
            user: entry.user,
            status: entry.status
          };
        })
        .filter(entry => {
          const key = `${entry.time}-${entry.user}-${entry.status}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
  
      res.status(200).json({
        userActivity: activityData,
        featureUsage: latestData.featureUsage,
        heatmapData: latestData.heatmapData,
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      res.status(500).json({ error: "Error fetching analytics data" });
    }
  }
  
  
static async latestAnalytics2(req: Request, res: Response) {
  try {
    const latestData = await Analytics.findOne().sort({ date: -1 });

    if (!latestData) {
      return res.status(404).json({ error: "No analytics data found" });
    }

    // ✅ Extract user activity data for line chart
    const activityData = latestData.userActivity.map(entry => ({
      time: entry.time,
      user: entry.user,
      status: entry.status
    }));

    res.status(200).json({
      userActivity: activityData, // ✅ NEW: Activity data for Line Graph
      featureUsage: latestData.featureUsage,
      heatmapData: latestData.heatmapData,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Error fetching analytics data" });
  }
};


static async latestUserActionsInteraction(req: Request, res: Response) {
  try {
    const latestData = await IntAct.findOne().sort({ date: -1 });

    if (!latestData) {
      return res.status(404).json({ error: "No analytics data found" });
    }

    // ✅ Extract user actions data for line chart
    //const actionsData = latestData.userActions.map(entry => ({
    //  time: entry.time,         // Timestamp when the action occurred
    //  user: entry.user,         // User who performed the action
     // status: entry.status      // Type of action (e.g., "like", "post", "comment")
    //}));

    res.status(200).json({
      interactions: latestData.interactions, // ✅ NEW: User actions data for Line Graph
    });
  } catch (error) {
    console.error("Error fetching user actions:", error);
    res.status(500).json({ error: "Error fetching user actions data" });
  }
};


static async latestUserActionsRanking(req: Request, res: Response) {
  try {
    const latestData = await RanAct.findOne().sort({ date: -1 });

    if (!latestData) {
      return res.status(404).json({ error: "No analytics data found" });
    }

    // ✅ Extract user actions data for line chart
   // const actionsData = latestData.userActions.map(entry => ({
    //  time: entry.time,         // Timestamp when the action occurred
   //   user: entry.user,         // User who performed the action
   //   status: entry.status      // Type of action (e.g., "like", "post", "comment")
   // }));

    res.status(200).json({
      rankings: latestData.rankings, // ✅ NEW: User actions data for Line Graph
    });
  } catch (error) {
    console.error("Error fetching user actions:", error);
    res.status(500).json({ error: "Error fetching user actions data" });
  }
};



static async latestAnalyticsTB(req: Request, res: Response) {
  try {
    const latestData = await TimeBudgetAnalytics.findOne().sort({ date: -1 });

    if (!latestData) {
      return res.status(404).json({ error: "No analytics data found" });
    }

    res.status(200).json({ timebudget: latestData.timebudget });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Error fetching analytics data" });
  }
};


static async latestAnalyticsMotivation(req: Request, res: Response) {
  try {
    const latestData = await MotivationAnalytics.findOne().sort({ date: -1 });

    if (!latestData) {
      console.error("No motivation data found in the database.");
      return res.status(404).json({ error: "No analytics data found" });
    }

    console.log("Fetched motivation data:", latestData);
    res.status(200).json({ timebudget: latestData.timebudget });
  } catch (error) {
    console.error("Error fetching motivation data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


static async latestUserActions(req: Request, res: Response) {
  try {
    const latestData = await Actions.findOne().sort({ date: -1 });

    if (!latestData) {
      return res.status(404).json({ error: "No analytics data found" });
    }

    // ✅ Extract user actions data for line chart
    const actionsData = latestData.userActions.map(entry => ({
      time: entry.time,         // Timestamp when the action occurred
      user: entry.user,         // User who performed the action
      action: entry.action      // Type of action (e.g., "like", "post", "comment")
    }));

    res.status(200).json({
      userActions: actionsData, // ✅ NEW: User actions data for Line Graph
    });
  } catch (error) {
    console.error("Error fetching user actions:", error);
    res.status(500).json({ error: "Error fetching user actions data" });
  }
};


}
