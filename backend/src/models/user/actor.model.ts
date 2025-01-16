import mongoose, { Schema, Document } from "mongoose";
import { IAgent } from "../user/agent.model";

export interface IActor {
    performActions(agent: IAgent): void;
  }
  
  export class DefaultActor {
    performActions(user: any): void {
      console.log(`User ${user.username} is performing actions...`);
      // Example: Go through posts and decide on actions
      //for (let i = 0; i < 3; i++) {
      //  console.log(`Agent ${agent.id} reacted to a post.`);
      //}
    }
  }
  