import { Request, Response } from "express";
import { Post } from "../models/content/post.model";
import { User, IUser  } from "../models/user/user.model";


export class PostController {
  // Create a new post
  static async createPost(req: Request, res: Response) {
    try {
      console.log(req.body);
      const post = new Post(req.body);
      const savedPost = await post.save();
      console.log("User saved:", savedPost);
      res.status(200).json(savedPost);
    } catch (error) {
      res.status(400).json({ error: "Error creating post" });
    }
  }
  
  static async get_postsPerUser(req: Request, res: Response) {
    try {
      console.error("Fetching posts per users");

      // Fetch users and posts from the database
      const agents = await User.find().populate("timeBudget");
      const posts = await Post.find();

      // Calculate post count per user
      const chartData = agents.map((user) => {
        if (!user || !user._id) {
          return { name: "Unknown", visit: 0 };
        }

        const userPostCount = posts.filter((post) => {
          return post?.postedBy?.toString() === user._id.toString();
        }).length;

        return {
          name: user.username, // User's name
          visit: userPostCount, // Count of posts for the user
        };
      });

      // Construct the final response
      const response = {
        color: "#FF8042",
        title: "Total Time",
        dataKey: "visit",
        chartData,
      };

      // Send the response as JSON
      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Error fetching users" });
    }
  }
  
  
  static async get_postsPerUserWithLowRanking(req: Request, res: Response) {
    try {
      console.error("Fetching posts per users with ranking less than 10");
  
      // Fetch users from the database (no need to filter by rank here)
      const users = await User.find().populate("timeBudget");
  
      // Fetch posts from the database with their `postedBy` field populated
      const posts = await Post.find().populate("postedBy");
  
      // Calculate post count per user where posts have rank less than 10
      const chartData = users.map((user) => {
        if (!user || !user._id) {
          return { name: "Unknown", visit: 0 };
        }
  
        // Filter posts by this user where post rank is less than 10
        const userPostCount = posts.filter((post) => {
          return (
            post.postedBy?.toString() === user._id.toString() && post.rank < 10
          );
        }).length;
  
        return {
          name: user.username, // User's name
          visit: userPostCount, // Count of posts with rank < 10 for the user
        };
      });
  
      // Construct the final response
      const response = {
        color: "#FF8042",
        title: "Posts per User (Rank < 10)",
        dataKey: "visit",
        chartData,
      };
  
      // Send the response as JSON
      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching posts per user:", error);
      res.status(500).json({ error: "Error fetching posts per user" });
    }
  }
  
  
  
}
