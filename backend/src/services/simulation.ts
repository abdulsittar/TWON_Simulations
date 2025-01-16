// src/services/simulationService.ts
import { User } from "../models/user/user.model";
import { IAgent } from "../models/user/agent.model";
import { Reaction, AMCDOpinionModel } from "../models/user/opinion.model";
import { getRandomInt, delayedFunction } from "../utils/helpers"; // Custom utility functions
import { SimpleLogger } from "../models/user/logger.model";
import { DefaultActor } from "../models/user/actor.model";

export class SimulationService {
  static async runSimulation(): Promise<void> {
    const users = await User.find({}); // Fetch all users from the database

    if (users.length === 0) {
      console.log("No agents to simulate.");
      return;
    }
    
    users.forEach(user => {
        user.logger = new SimpleLogger();
        user.actor = new DefaultActor();
      });

    // Loop through a set time for the simulation
    for (let timeStep = 0; timeStep < 10; timeStep++) {
      console.log(`Running simulation for time step: ${timeStep}`);

      // Activate agents based on their activation probability
      for (const user of users) {
      
        user.activateAgent(); // Treating each user as an agent and activating them
      }

      // Optional: Add a small delay to simulate real-time simulation
      await delayedFunction(); // Delay of 1 second
    }

    console.log("Simulation completed!");
  }
/*
  static isAgentActivated(agent: IAgent): boolean {
    // Activation function based on motivation and engagement
    const activationProbability = (agent.motivation + agent.engagement) / 2;
    return Math.random() < activationProbability; // Randomly determine if agent is activated
  }

  static async processAgentAction(agent: IAgent): Promise<void> {
    console.log(`Processing agent ${agent.username}`);

    // Simulate agent actions, like reading posts, reacting to them, or creating new posts
    const reactions: Reaction[] = this.generateReactions(agent);

    // Update the agent's opinion based on reactions
    agent.opinionModel.updateOpinion(reactions);

    // Optionally, save the agent's updated state (e.g., engagement, opinion, etc.)
    await agent.save();
  }

  static generateReactions(agent: IAgent): Reaction[] {
    // Generate random reactions for the agent (this could be based on posts, topics, etc.)
    const topics = ["politics", "sports", "technology"];
    const reactions: Reaction[] = topics.map((topic) => ({
      topic,
      value: getRandomInt(-3, 3), // Random reaction value between -3 and 3
    }));

    return reactions;
  }*/
}
