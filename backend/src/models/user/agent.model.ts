import mongoose, { Schema, Document } from "mongoose";
import { IOpinionModel } from "../user/opinion.model";
import { IActor } from "../user/actor.model";
import { ILogger } from "../user/logger.model";

export interface IAgent {
    id: string; // Unique ID for the agent
    opinionModel: IOpinionModel; // Holds the opinion model logic
    logger: ILogger; // Tracks the agent's activity
    actor: IActor; // Governs behavior when the agent is active
    timeBudget: number; // Remaining time the agent can spend
    pastSuccess: number; // Accumulated "success" metric
    biases: Record<string, number>; // Bias parameters for decision-making
    frustration: number; // Frustration factor
  }
  