import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "../user/user.model";
import { IPost } from "../content/post.model";

export interface IReplyLikelihood extends Document {
  userId: IUser["_id"]; // Reference to User
  postId: IPost["_id"]; // Reference to Post
  score: number; // Probability score of the user replying
  createdAt: Date;
  updatedAt: Date;
}

const ReplyLikelihoodSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    score: { type: Number, default: 0, required: true }, // Default likelihood score
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Ensure that a user has only one score per post
ReplyLikelihoodSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const ReplyLikelihood = mongoose.model<IReplyLikelihood>("ReplyLikelihood", ReplyLikelihoodSchema);
