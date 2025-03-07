// models/analytics.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IAnalytics extends Document {
  date: Date;
  userGrowth: [{ name: String, timestamps: [{ time: Number, status: Number }] }];
  featureUsage: { name: string; value: number }[];
  heatmapData: number[][];
  userActivity: { time: number; user: string; status: number; action: string }[];  // Add action here
}


const AnalyticsSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    userGrowth: [
      {
        name: { type: String, required: true },
        timestamps: [
          {
            time: { type: Number, required: true },
            status: { type: Number, required: true }
          }
        ]
      }
    ],
    featureUsage: [
      {
        name: { type: String, required: true },
        value: { type: Number, required: true }
      }
    ],
    heatmapData: [[{ type: Number }]],
    userActivity: [
      {
        time: { type: Number, required: true },
        user: { type: String, required: true },
        status: { type: Number, required: true },
        action: { type: String, required: true }  // Add action field here
      }
    ]
  },
  { timestamps: true }
);



export const Analytics = mongoose.model<IAnalytics>("Analytics", AnalyticsSchema);
