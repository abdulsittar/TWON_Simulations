import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "../user/user.model"; // Assuming you have a User model interface
import { IPost } from "../content/post.model"; // Assuming you have a Post model interface

// PostLike Interface
export interface IPostLike extends Document {
  userId: IUser["_id"];
  postId: IPost["_id"];
  createdAt?: Date;
  updatedAt?: Date;
  isPublic:boolean;
}

const PostLikeSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublic:{ type: Boolean, required: true },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

export const PostLike = mongoose.model<IPostLike>("PostLike", PostLikeSchema);
