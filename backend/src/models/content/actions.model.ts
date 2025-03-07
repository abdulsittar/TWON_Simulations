// models/analytics.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IActions extends Document {
  date: Date;
  userActions: [
    {
      time: Number,
      user: String,
      action: String, // e.g., "like", "post", "comment"
      postId: mongoose.Schema.Types.ObjectId | null;
    }
  ];
}


const AnalyticsSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    userActions: [
      {
        time: { type: Number, required: true },
        user: { type: String, required: true },
        action: { type: String, required: true },
        postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: false, default: null }
      }
    ]
  },
  { timestamps: true }
);

export const Actions = mongoose.model<IActions>("Actions", AnalyticsSchema);
