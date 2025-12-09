import mongoose, { Schema, Document } from 'mongoose';

export interface ITimeBudget extends Document {
  totalTime: number;
  replenishRate?: number; // Optional field
  usedTime: number;
}

const TimeBudgetSchema: Schema = new Schema({
  totalTime: { type: Number, required: true, default: 5 },
  replenishRate: { type: Number, required: false, default: 10 },
  usedTime: { type: Number, default: 0 },
});

export const TimeBudget = mongoose.model<ITimeBudget>("TimeBudget", TimeBudgetSchema);
