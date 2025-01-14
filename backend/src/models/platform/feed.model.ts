import mongoose, { Schema, Document } from "mongoose";
import { IPost } from "../content/post.model";

export interface IFeed extends Document {
  options: string[]; // Feed options like 'Random', 'Chronological'
  posts: IPost["_id"][]; // Array of Post references
}

const FeedSchema: Schema = new Schema({
  options: [{ type: String }], // Feed options
  posts: [{ type: Schema.Types.ObjectId, ref: "Post" }], // References to Post model
});

export const Feed = mongoose.model<IFeed>("Feed", FeedSchema);
