
import mongoose, { Schema, Document } from "mongoose"; 
import { IActor } from "../user/actor.model";
import { ILogger } from "../user/logger.model";

export interface IOpinionModel {
    opinion: Record<string, number>; // Opinions on various topics (topic: value)
    updateOpinion(reactions: Reaction[]): void; // Update opinion based on interactions
  }
  
  export class AMCDOpinionModel implements IOpinionModel {
    opinion: Record<string, number>;
  
    constructor(initialOpinion: Record<string, number>) {
      this.opinion = initialOpinion;
    }
  
    updateOpinion(reactions: Reaction[]): void {
      reactions.forEach((reaction) => {
        // Logic for updating opinions based on Axelrod's model
        const { topic, value } = reaction;
        if (this.opinion[topic] !== undefined) {
          this.opinion[topic] += value; // Example update logic
        }
      });
    }
  }
  
  export interface Reaction {
    topic: string;  // The topic that the reaction is related to (e.g., "politics", "sports", etc.)
    value: number;  // The value of the reaction (e.g., positive, negative, or neutral)
  }
  
  