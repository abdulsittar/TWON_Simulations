import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "../user/user.model"; // Assuming you have a User model interface
import { IPost } from "../content/post.model"; // Assuming you have a Post model interface
import { ICommentLike } from "../content/commentLike.model"; // Assuming you have a CommentLike model interface
import { ICommentDislike } from "../content/commentDislike.model"; // Assuming you have a CommentDislike model interface

// Comment Interface
export interface IComment extends Document {
  _id: mongoose.Types.ObjectId;
  body: string;
  userId: IUser["_id"];
  username: string;
  likes: ICommentLike["_id"][];
  dislikes: ICommentDislike["_id"][];
  postId: IPost["_id"];
  createdAt?: Date;
  updatedAt?: Date;
  isPublic:boolean;
}

const CommentSchema: Schema = new Schema(
  {
    body: {
      type: String,
      required: true,
    },
    isPublic:{ type: Boolean, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CommentLike",
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CommentDislike",
      },
    ],
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

export const Comment = mongoose.model<IComment>("Comment", CommentSchema);
