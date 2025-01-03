import mongoose, { Schema, Document } from "mongoose";

// TimeBudget Schema
export interface ITimeBudget extends Document {
  totalTime: number; // Total time available for the user
  replenishRate: number; // Rate at which time is replenished (e.g., per hour)
}

const TimeBudgetSchema: Schema = new Schema({
  totalTime: { type: Number, required: true },
  replenishRate: { type: Number, required: true },
  usedTime: { type: Number, default: 0 },
});

export const TimeBudget = mongoose.model<ITimeBudget>("TimeBudget", TimeBudgetSchema);
