import mongoose, { Schema, Document } from "mongoose";
 
import { Agent } from "../user/agentClass.model";

export class Simulator {
    agents: Agent[] = [];
    timeStep: number;
  
    constructor(timeStep: number) {
      this.timeStep = timeStep;
    }
  
    addAgent(agent: Agent): void {
      this.agents.push(agent);
    }
  
    runSimulation(duration: number): void {
      const steps = Math.floor(duration / this.timeStep);
      for (let step = 0; step < steps; step++) {
        console.log(`Time Step: ${step}`);
        this.agents.forEach((agent) => agent.activate());
        this.replenishTimeBudget();
      }
    }
  
    replenishTimeBudget(): void {
      this.agents.forEach((agent) => {
        agent.timeBudget += this.timeStep;
      });
    }
  }
  