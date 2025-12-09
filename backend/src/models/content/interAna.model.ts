// models/analytics.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IntActions extends Document {
  date: Date;
  interactions: [
    {
      time: Number,
      spendTime: Number,
      user: String,
      status: Number
    }
  ];
}


const IntActionSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    interactions: [
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

export const IntAct = mongoose.model<IntActions>("IntAct", IntActionSchema);
