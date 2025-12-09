// models/analytics.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface RanActions extends Document {
  date: Date;
  rankings: [
    {
      time: Number,
      spendTime:  Number, 
      user: String,
      status: Number
    }
  ];
}


const RanActionsSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    rankings: [
      {
        time: { type: Number, required: true },
        spendTime: { type: Number, required: true },
        user: { type: String, required: true },
        status: { type: Number, required: true }
      }
    ]
  },
  { timestamps: true }
);

export const RanAct = mongoose.model<RanActions>("RanAct", RanActionsSchema);
