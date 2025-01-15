import mongoose, { Schema, Document } from "mongoose";
import { ITimeBudget } from "./timeBudget.model";

// User Interface
export interface IUser extends Document {
  username: string;
  name: string;
  email: string;
  motivation: number;
  engagement: number; // Engagement level of the user
  success: number; // Success level of the user
  timeBudget: ITimeBudget["_id"]; // Reference to TimeBudget model
  followers: IUser["_id"][]; // Array of user references (followers)
  followings: IUser["_id"][]; // Array of user references (followings)
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true },
  name: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  motivation: { type: Number, required: true },
  engagement: { type: Number, required: true },
  success: { type: Number, required: false },
  timeBudget: { type: Schema.Types.ObjectId, ref: "TimeBudget", required: true }, // Reference to TimeBudget
  followers: [{ type: Schema.Types.ObjectId, ref: "User" }], // Array of user references (followers)
  followings: [{ type: Schema.Types.ObjectId, ref: "User" }], // Array of user references (followings)
});

export const User = mongoose.model<IUser>("User", UserSchema);
