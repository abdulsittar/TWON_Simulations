
  //@param {number} k The steepness of the activation function.
  //@param {number} b The bias of the activation function.
  //@returns {number} The result of the activation function.
 
//export function activation(k: number, b: number): number {
 //   return 2 / (1 + Math.exp(-k * b)) - 1;
  //}
  
  import { ITimeBudget } from "../models/user/timeBudget.model";
  import { IUser } from "../models/user/user.model";
  //import { sigmoid } from "../utils/math";
  import  responseLogger  from '../utils/logs/logger';
  
  /**
   * Determines if an agent should log in based on motivation, notifications, and time budget.
   * @param agent - The agent (user) object
   * @returns boolean - Whether the agent logs in or not
   */
  export async function shouldUserLogin(agent: IUser): Promise<boolean> {
    try {
      const motivation = await getMotivation(agent);
      const timeBudget = await getTimeBudget(agent);
      const notificationEffect = await getNotificationEffect(agent);
  
      // 🎯 Compute probability of logging in (Equation 2)
      const flogin = sigmoid(motivation + notificationEffect); // Motivation + Notifications
      const hlogin = timeBudget.totalTime > 0 ? sigmoid(timeBudget.totalTime) : 0; // Step function for time budget
  
      // Final login probability
      const loginProbability = flogin * hlogin;
  
      // Log details for debugging
      responseLogger.debug(
        `Login Probability for ${agent.username}: ${loginProbability.toFixed(3)} (Motivation: ${motivation}, Time: ${timeBudget}, Notifications: ${notificationEffect})`
      );
  
      // Determine if user logs in based on probability
      return Math.random() < loginProbability; // Compare to a random number between 0-1
    } catch (error) {
      responseLogger.error(`Error in shouldUserLogin for ${agent.username}:`, error);
      return false;
    }
  }
  
  export async function getMotivation(agent: IUser): Promise<number> {
    return agent.motivation || 0.5; // Default motivation if not set
  }
  
  export async function getTimeBudget(agent: IUser): Promise<ITimeBudget> {
    return agent.timeBudget as ITimeBudget; // Default: 0 (if exhausted)
  }
  
  export async function getNotificationEffect(agent: IUser): Promise<number> {
    return agent.notificationEffect > 10 ? -0.2 : 0.1 * agent.notificationEffect; // Fatigue model
  }
  
  export function sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }
  
  
  
  
  
  
  
  