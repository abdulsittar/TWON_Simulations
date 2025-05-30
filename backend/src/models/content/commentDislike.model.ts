import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "../user/user.model"; // Assuming you have a User model interface
import { IComment } from "../content/comment.model"; // Assuming you have a Comment model interface

// CommentDislike Interface
export interface ICommentDislike extends Document {
  userId: IUser["_id"];
  commentId: IComment["_id"];
  createdAt?: Date;
  updatedAt?: Date;
  isPublic:boolean;
}

const CommentDislikeSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublic:{ type: Boolean, required: true },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

export const CommentDislike = mongoose.model<ICommentDislike>(
  "CommentDislike",
  CommentDislikeSchema
);
