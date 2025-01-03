import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "../user/user.model";

// Post Interface
export interface IPost extends Document {
  content: string; // Content of the post
  createdBy: IUser["_id"]; // Reference to the user who created the post
  success: number; // Success of the post
}

const PostSchema: Schema = new Schema({
  content: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User model
  success: { type: Number, required: true },
});

export const Post = mongoose.model<IPost>("Post", PostSchema);
