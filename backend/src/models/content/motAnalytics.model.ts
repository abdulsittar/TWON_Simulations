// models/analytics.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IMotivationAna extends Document {
  date: Date;
  timebudget: { time: number; user: string; motivation: number; }[];  // Add action here
}


const IMotivationAnaSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    timebudget: [
      {
        time: { type: Number, required: true },
        user: { type: String, required: true },
        motivation: { type: Number, required: true }
      }
    ]
  },
  { timestamps: true }
);



export const MotivationAnalytics = mongoose.model<IMotivationAna>("MotivationAnalytics", IMotivationAnaSchema);
