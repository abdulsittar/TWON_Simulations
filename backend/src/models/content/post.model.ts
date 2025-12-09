import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "../user/user.model"; // Assuming you have a User model interface
import { IComment } from "../content/comment.model"; // Assuming you have a Comment model interface
import { IPostLike } from "../content/postLike.model"; // Assuming you have a PostLike model interface
import { IPostDislike } from "../content/postDislike.model"; // Assuming you have a PostDislike model interface
import { IRepost } from "../content/repost.model"; // Assuming you have a Repost model interface

// Post Interface
export interface IPost extends Document {
  _id: string | mongoose.Types.ObjectId;
  userId: string;
  desc: string;
  img?: string;
  reposts: IRepost["_id"][];
  pool: string;
  rank: number;
  likes: IPostLike["_id"][];
  dislikes: IPostDislike["_id"][];
  isPublic:boolean;
  //comments: IComment["_id"][];
  comments: IComment[]; 
  postedBy: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const PostSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
      maxlength: 500,
    },
    img: {
      type: String,
    },
    isPublic:{ type: Boolean, required: true },
    reposts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Repost",
      },
    ],
    pool: {
      type: String,
      default: "0",
    },
    rank: {
      type: Number,
      default: 0.0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PostLike",
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PostDislike",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Post = mongoose.model<IPost>("Post", PostSchema);
