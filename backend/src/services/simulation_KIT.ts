import { Server as SocketServer } from 'socket.io';
import { getAllAgents } from './database_service';
import { emitChartData } from './chart_service';
import { performAgentAction } from './agent_Actions';


export class SimulationService {
  private static io: SocketServer;
    
  static initialize(ioInstance: SocketServer): void {
    this.io = ioInstance;
  }

  static async runSimulation(currentTime: number): Promise<void> {
    let agents = await getAllAgents();
    if (agents.length === 0) return;
    const totalAgents = agents.length;


    //for (let i = 0; i < 3; i++) {
      //await performAgentAction(agents[i], 0);
    //}
    
    for (const agent of agents) {
      
      if (agent.activateAgent(currentTime, agent.loggedIn)) {
        await performAgentAction(agent, 0);
      }
    }
    
    for (let i = 0; i < 5; i++) {
     agents = await getAllAgents();
    const passiveCount_1 = Math.floor(totalAgents * 0.2); // 20% Like
    const passiveCount_2 = Math.floor(totalAgents * 0.2); // 20% Like
    const semiActiveCount = Math.floor(totalAgents * 0.3); // 30% Comment 
    
    for (let i = 0; i < totalAgents; i++) {
      if (agents[i].activateAgent(currentTime, agents[i].loggedIn)) {
      let actionType: number;

      if (i < passiveCount_1) {
        actionType = 3; // Like
      } else if (i < passiveCount_1 + passiveCount_2) {
        actionType = 2;
      } else if (i < passiveCount_1 + passiveCount_2 + semiActiveCount) {
        actionType = 1; // Comment
      } else {
        actionType = 0; // Post
      }
      
      await performAgentAction(agents[i], actionType);
      //emitChartData(this.io, agents);
    }
  }
  
}

for (let i = 0; i < totalAgents; i++) {
    agents[i].activateAgent(currentTime, agents[i].loggedIn)
}
  }
}
