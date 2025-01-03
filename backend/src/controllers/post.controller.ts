import { Request, Response } from "express";
import { Post } from "../models/content/post.model";

export class PostController {
  // Create a new post
  static async createPost(req: Request, res: Response) {
    try {
      const post = new Post(req.body);
      const savedPost = await post.save();
      res.status(201).json(savedPost);
    } catch (error) {
      res.status(400).json({ error: "Error creating post" });
    }
  }
}
