// src/services/simulationService.ts
import { User } from "../models/user/user.model";
import { IAgent } from "../models/user/agent.model";
import { Reaction, AMCDOpinionModel } from "../models/user/opinion.model";
import { getRandomInt, delayedFunction } from "../utils/helpers"; // Custom utility functions
import { SimpleLogger } from "../models/user/logger.model";
import { DefaultActor } from "../models/user/actor.model";
import { Server as SocketServer } from 'socket.io';
import  responseLogger  from '../utils/logs/logger';

export class SimulationService {
  private static io: SocketServer;
    
  static initialize(ioInstance: SocketServer): void {
    this.io = ioInstance;
  }

  static async runSimulation(): Promise<void> {
    const users = await User.find().populate('timeBudget');

    if (users.length === 0) {
      responseLogger.info("No agents to simulate.");
      return;
    }
    
    users.forEach(user => {
        user.logger = new SimpleLogger();
        user.actor = new DefaultActor();
      });

    // Loop through a set time for the simulation
    for (let timeStep = 0; timeStep < 10; timeStep++) {
      responseLogger.info(`Running simulation for time step: ${timeStep}`);

      // Activate agents based on their activation probability
      for (const user of users) {
      
        user.activateAgent(); // Treating each user as an agent and activating them
      }

      var chartData = users.map((user, index) => {
        const totalTime1 = user.timeBudget && user.timeBudget.totalTime !== undefined
        ? Math.floor(Math.random() * 101)  // Random value between 0 and 100
        : 20; 
             
             return {
        name: user.username, // Label the users as User 1, User 2, etc.
        visit: totalTime1 // Revenue is the totalTime from TimeBudget
      }
      });
      
      // Define the response structure
      const response1 = {
        color: "#FF8042",
        title: "Total Time", // Title of the chart
        dataKey: "visit", // The key representing the data in the chart (revenue)
        chartData , // The user-specific chart data (each user's totalTime as revenue, limited to 7 users)
      };

      this.io.emit('timebudget_totaltime', { response1 });
      
      
      chartData  = users.map((user, index) => {
        const totalTime2 = user.timeBudget && user.timeBudget.replenishRate !== undefined
        ? Math.floor(Math.random() * 101)  // Random value between 0 and 100
        : 20; 
             
             return {
        name: user.username, // Label the users as User 1, User 2, etc.
        visit: totalTime2 // Revenue is the totalTime from TimeBudget
      }
      });
      
      // Define the response structure
      const response2 = {
        color: "#FF8042",
        title: "Replenish Rate", // Title of the chart
        dataKey: "visit", // The key representing the data in the chart (revenue)
        chartData, // The user-specific chart data (each user's totalTime as revenue, limited to 7 users)
      };

      this.io.emit('timebudget_replenish', { response2 });
      
      
      
       chartData  = users.map((user, index) => {
        const totalTime = user.timeBudget && user.timeBudget.usedTime !== undefined
        ? Math.floor(Math.random() * 101)  // Random value between 0 and 100
        : 20; 
             
             return {
        name: user.username, // Label the users as User 1, User 2, etc.
        visit: totalTime // Revenue is the totalTime from TimeBudget
      }
      });
      
      // Define the response structure
      const response3 = {
        color: "#FF8042",
        title: "Used Time", // Title of the chart
        dataKey: "visit", // The key representing the data in the chart (revenue)
        chartData, // The user-specific chart data (each user's totalTime as revenue, limited to 7 users)
      };

      this.io.emit('timebudget_usedtime', { response3 });
      

      // Emit simulation state to clients via WebSocket
      /*const simulationState = users.map(user => ({
        id: user.id,
        actorState: "On"
      }));

      this.io.emit('actor_status', { timeStep, simulationState });*/
      
     // socket.emit('update-data', response.data);
      

      // Optional: Add a small delay to simulate real-time simulation
      await delayedFunction(); // Delay of 1 second
    }

    responseLogger.info("Simulation completed!");
  }
/*
  static isAgentActivated(agent: IAgent): boolean {
    // Activation function based on motivation and engagement
    const activationProbability = (agent.motivation + agent.engagement) / 2;
    return Math.random() < activationProbability; // Randomly determine if agent is activated
  }

  static async processAgentAction(agent: IAgent): Promise<void> {
    responseLogger.info(`Processing agent ${agent.username}`);

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
