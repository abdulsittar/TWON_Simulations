import { Request, Response } from "express";
import { User } from "../models/user/user.model";
import { TimeBudget } from "../models/user/timeBudget.model"; // Assuming TimeBudget model exists
import { AMCDOpinionModel } from "../models/user/opinion.model";
import { SimpleLogger } from "../models/user/logger.model";
import { DefaultActor } from "../models/user/actor.model";

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
          timeBudget: savedTimeBudget._id, // Reference to the saved TimeBudget
          opinionModel,  // Add the opinionModel for the agent's opinions
          logger,        // Add the logger for the agent's actions
          actor,         // Add the actor defining how the agent behaves
          frustration: Math.floor(Math.random() * 50), // Default frustration level
          biases:{ politics: Math.random() },     // Default empty biases
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

  static async get_totalTime(req: Request, res: Response) {
    try {
      console.error("Fetching get All Users");
      const users = await User.find().populate("timeBudget"); // Populate timeBudget if it's a reference
      
      const chartData = users.map((user, index) => {
      const totalTime = user.timeBudget && user.timeBudget.totalTime ? user.timeBudget.totalTime : 20;
      return {
        name: `U ${index + 1}`, // Label the users as User 1, User 2, etc.
        visit: totalTime // Revenue is the totalTime from TimeBudget
      }
      });
      
      // Define the response structure
      const response = {
        color: "#FF8042",
        title: "Total Visit", // Title of the chart
        dataKey: "visit", // The key representing the data in the chart (revenue)
        chartData, // The user-specific chart data (each user's totalTime as revenue, limited to 7 users)
      };
      
      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Error fetching users" });
    }
  }
  
  static async get_replenishTime(req: Request, res: Response) {
    try {
      console.error("Fetching get All Users");
      const users = await User.find().populate("timeBudget"); // Populate timeBudget if it's a reference
      
      const chartData = users.map((user, index) => {
      const totalTime = user.timeBudget && user.timeBudget.replenishRate ? user.timeBudget.replenishRate : 20;
      return {
        name: `U ${index + 1}`, // Label the users as User 1, User 2, etc.
        visit: totalTime // Revenue is the totalTime from TimeBudget
      }
      });
      
      // Define the response structure
      const response = {
        color: "#FF8042",
        title: "Total Visit", // Title of the chart
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
      const totalTime = user.timeBudget && user.timeBudget.usedTime ? user.timeBudget.usedTime : 20;
      return {
        name: `U ${index + 1}`, // Label the users as User 1, User 2, etc.
        visit: totalTime // Revenue is the totalTime from TimeBudget
      }
      });
      
      // Define the response structure
      const response = {
        color: "#FF8042",
        title: "Total Visit", // Title of the chart
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
}
