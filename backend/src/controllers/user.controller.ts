import { Request, Response } from "express";
import { User } from "../models/user/user.model";
import { TimeBudget } from "../models/user/timeBudget.model";


// Route to fetch total time for each user
export const getTotalTime = async (req: Request, res: Response) => { 
    try {
      const users = await User.find().populate('timeBudget'); // Populating timeBudget to get its details
      console.error('No fetching total time:', users);
      const chartData = users.map(user => {
        const timeBudget = user.timeBudget;
        const availableTime = timeBudget.totalTime - timeBudget.usedTime; // Total time available (after usedTime)
        
        return {
          name: user.username, // Assuming you want the username as the name
          visit: availableTime, // Using the available time as the visit count
        };
      });
  
      const data = {
        title: "Total Visit", // The title of the chart
        color: "#FF8042", // The color for the chart (You can change it)
        dataKey: "visit", // The key for the value in chart data
        chartData, // The array of data with usernames and total time
      };
  
      return res.json(data);
    } catch (error) {
      console.error('Easdf asd fa dsdftotal time:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }


export class UserController {
  // Create a new user
  static async createUser(req: Request, res: Response) {
    try {
      // Create a time budget first
      const timeBudget = new TimeBudget(req.body.timeBudget);
      const savedTimeBudget = await timeBudget.save();

      // Create a new user
      const user = new User({
        ...req.body,
        timeBudget: savedTimeBudget._id, // Reference the TimeBudget
      });

      const savedUser = await user.save();
      res.status(201).json(savedUser);
    } catch (error) {
      res.status(400).json({ error: "Error creating user" });
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

      // Update User
      const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(400).json({ error: "Error updating user" });
    }
  }
}