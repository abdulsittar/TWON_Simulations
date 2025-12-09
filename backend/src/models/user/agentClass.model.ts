import mongoose, { Schema, Document } from "mongoose";
import { IAgent } from "../user/agent.model";
import { IOpinionModel } from "../user/opinion.model";
import { IActor } from "../user/actor.model";
import { ILogger } from "../user/logger.model";

export class Agent implements IAgent {
    id: string;
    opinionModel: IOpinionModel;
    logger: ILogger;
    actor: IActor;
    timeBudget: number;
    pastSuccess: number;
    biases: Record<string, number>;
    frustration: number;
  
    constructor(
      id: string,
      opinionModel: IOpinionModel,
      logger: ILogger,
      actor: IActor,
      timeBudget: number,
      pastSuccess: number,
      biases: Record<string, number>,
      frustration: number
    ) {
      this.id = id;
      this.opinionModel = opinionModel;
      this.logger = logger;
      this.actor = actor;
      this.timeBudget = timeBudget;
      this.pastSuccess = pastSuccess;
      this.biases = biases;
      this.frustration = frustration;
    }
  
    activate(): void {
      if (this.canActivate()) {
        this.logger.logEvent(`Agent ${this.id} activated.`);
        this.actor.performActions(this);
      }
    }
  
    canActivate(): boolean {
      // Example activation logic
      return this.timeBudget > 0 && Math.random() < 0.5;
    }
  }
  