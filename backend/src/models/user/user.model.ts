import mongoose, { Schema, Document } from "mongoose";
import { ITimeBudget } from "./timeBudget.model";
import { IOpinionModel, AMCDOpinionModel, Reaction } from "../user/opinion.model";
import { ILogger, SimpleLogger } from "../user/logger.model";
import { IActor, DefaultActor } from "../user/actor.model";

// User Interface with agent-like behavior
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

  // New agent-like fields
  opinionModel: IOpinionModel; // Agent's Opinion Model
  logger: ILogger; // Logger for the agent's actions
  actor: IActor; // Actor for the agent's behavior
  frustration: number; // Frustration factor
  biases: Record<string, number>; // Biases affecting decisions
  timeBudgetRemaining: number; // Remaining time budget for the agent

  // Methods for agent behavior
  activateAgent(): void; // Method to activate agent's behavior
  updateOpinion(reactions: Reaction[]): void; // Update opinion based on interactions
  performActions(): void; // Method to make the agent perform actions
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true },
    name: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    motivation: { type: Number, required: true },
    engagement: { type: Number, required: true },
    success: { type: Number, required: true },
    timeBudget: { type: Schema.Types.ObjectId, ref: "TimeBudget", required: true }, // Reference to TimeBudget
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }], // Array of user references (followers)
    followings: [{ type: Schema.Types.ObjectId, ref: "User" }], // Array of user references (followings)

    // New agent-specific fields
    opinionModel: {
      type: Schema.Types.Mixed, // Storing as mixed to handle flexible structures
      required: true,
    },
    logger: {
      type: Schema.Types.Mixed, // Storing as mixed for logger
      required: true,
    },
    actor: {
      type: Schema.Types.Mixed, // Storing as mixed for actor
      required: true,
    },
    frustration: { type: Number, required: true },
    biases: { type: Map, of: Number, required: true }, // Biases stored as key-value pairs
    timeBudgetRemaining: { type: Number, required: true, default: 100 }, // Starting budget
  },
  { timestamps: true }
);

UserSchema.methods.activateAgent = function (): void {
  if (this.timeBudgetRemaining > 0 && Math.random() < 0.5) {
    // Check if logger is available and has the `logEvent` method
    if (this.logger && typeof this.logger.logEvent === "function") {
      this.logger.logEvent(`Agent ${this.username} activated.`);
    } else {
      console.warn("Logger is not properly initialized for this user.", this.logger);
    }

    // Check if actor is available and has `performActions` method
    if (this.actor && typeof this.actor.performActions === "function") {
      this.actor.performActions(this); // Perform actions if actor is valid
    } else {
      console.warn("Actor is not properly initialized or missing 'performActions' method.", this.actor);
    }
  }
};



UserSchema.methods.updateOpinion = function (reactions: Reaction[]): void {
  // Update opinion based on reactions using the AMCDOpinionModel
  this.opinionModel.updateOpinion(reactions);
};

UserSchema.methods.performActions = function (): void {
  // Perform actions based on the agent's actor
  this.actor.performActions(this);
};

export const User = mongoose.model<IUser>("User", UserSchema);
