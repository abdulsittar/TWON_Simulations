import mongoose, { Schema, Document } from "mongoose";
import { IPost } from "./post.model";
import { IUser } from "./user.model";

// Comment Interface
export interface IComment extends Document {
  content: string; // Content of the comment
  createdBy: IUser["_id"]; // Reference to the user who created the comment
  post: IPost["_id"]; // Reference to the post being commented on
}

const CommentSchema: Schema = new Schema({
  content: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User model
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true }, // Reference to Post model
});

export const Comment = mongoose.model<IComment>("Comment", CommentSchema);
