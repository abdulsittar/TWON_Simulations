// models/analytics.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ITimeBudgetAna extends Document {
  date: Date;
  timebudget: { time: number; user: string; total: number; }[];  // Add action here
}


const ITimeBudgetAnaSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    timebudget: [
      {
        time: { type: Number, required: true },
        user: { type: String, required: true },
        total: { type: Number, required: true }
      }
    ]
  },
  { timestamps: true }
);



export const TimeBudgetAnalytics = mongoose.model<ITimeBudgetAna>("TimeBudgetAnalytics", ITimeBudgetAnaSchema);
