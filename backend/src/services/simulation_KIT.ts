import { Server as SocketServer } from 'socket.io';
import { getAllAgents } from './database_service';
import { emitChartData } from './chart_service';
import { performAgentAction } from './agent_Actions_KIT';
import  responseLogger  from '../utils/logs/logger';
import axios from 'axios';
import { User, IUser  } from "../models/user/user.model";  
import { Post, IPost } from "../models/content/post.model";
import { ReplyLikelihood } from "../models/user/replyLikelihood";
import mongoose, { Schema, Document, ObjectId } from "mongoose";
import connectDB from "../config/db";

interface WantToReplyEntry {
  postId: mongoose.Types.ObjectId;
  score: number;
}

const getPostsByUser = async (userId: string): Promise<IPost[]> => {
  try {
    const post = await Post.find({ postedBy:userId as unknown as mongoose.Types.ObjectId }).sort({ rank: -1 }).limit(2); // Sorting by creation date, most recent first
    if (post) {
      
      responseLogger.info(`post ${post.length}:`);
      return post; // Return as an array
      
    } else {
      return []; // Return an empty array if no post is found
    }
  } catch (error) {
    console.error(`Error fetching posts for user ${userId}:`, error);
    responseLogger.info(`Error fetching posts for user ${userId}:`, error);
    return []; // Return an empty array on error
  }
};

const getLatestPost = async (): Promise<IPost[]> => {
  try {
    // Fetch the latest post from all users, sorted by creation date
    const latestPosts = await Post.find().sort({ rank: 1 });
    if (latestPosts) {
      return latestPosts; // Return as an array
    } else {
      return []; // Return an empty array if no post is found
    }
  } catch (error) {
    console.error(`Error fetching posts:`, error);
    return []; // Return an empty array on error
  }
};

const fetchAgentFeaturesAndLabels = async (userIds: string[], exclude: number): Promise<{ agentFeatures: string[][], actionLabels: string[][], validUserIds: string[] }> => {
  const agentFeatures: string[][] = [];
  const actionLabels:  string[][] = [];
  const validUserIds: string[] = [];  // Store userIds with valid posts

  let count = 0;
  let latestPost = await getLatestPost(); 
  latestPost = latestPost.filter((post, index) => index !== exclude);
  userIds = userIds.filter((post, index) => index !== exclude);
  // Fetch posts and actionLabels for users
  for (const userId of userIds) {
    // Fetch all posts for the user and extract descriptions
    const userPosts = await getPostsByUser(userId);
    const randomNumber = Math.floor(Math.random() * userIds.length) + 1;
    // Only add users with posts
    if (userPosts.length > 1) {
      //const userPostDescriptions = userPosts.map(post => post.desc); // Convert to strings
      agentFeatures.push([userPosts[0].desc, userPosts[1].desc]);
      validUserIds.push(userId); // Track the valid user
      
      if (latestPost[count]) {
        actionLabels.push([latestPost[randomNumber].desc]);
      }else{
        actionLabels.push([latestPost[randomNumber].desc]);
      }
      
    }
    count = count + 1;
  }

  // Fetch the latest post across all users
   // Assuming this fetches the latest post across all users
 
    //const userPostDescriptions = userPosts.map(post => post.desc); // Convert to strings
    
  // If a latest post is found, push its description into actionLabels
  /*if (latestPost) {
    for (const post of latestPost) {
      actionLabels.push([userPosts[0].desc, userPosts[1].desc]);
    }
  }*/
  
  //for (let i = 0; i < agentFeatures.length-1; i++) {
  //  if (latestPost) {
  //    actionLabels.push(latestPost.desc); // Only one latest post description will be pushed
    //}
  //}
  
  responseLogger.info(`Fetched history items and current posts`);
  return { agentFeatures, actionLabels, validUserIds };
};

const getUserWithHighestScore = async () => {
  try {
    const result = await User.aggregate([
      // Unwind the wantToReply array to access the score field
      { $unwind: "$wantToReply" },

      // Sort by the score in descending order
      { $sort: { "wantToReply.score": -1 } },

      // Limit to just 1 document to get the highest score user
      { $limit: 1 },

      // Optionally, you can project the fields you want to return
      { $project: { username: 1, wantToReply: 1, score: "$wantToReply.score" } }
    ]);

    // The result will contain the user with the highest score
    console.log("User with the highest score:", result[0]);
    responseLogger.info(`User with the highest score:  ${result[0]}`);
    return result[0];
  } catch (error) {
    console.error("Error finding user with the highest score:", error);
  }
};

const setBestMatchProbabilityToZero = async (userIds: string[]): Promise<void> => {
  // Step 1: Get the highest likelihood user and post
  const bestMatch = await getHighestLikelihoodPostAndUser(userIds);
const session = await mongoose.startSession();
    session.startTransaction();
  // If no best match is found, exit early
  if (!bestMatch) {
    console.warn('No best match found.');
    return;
  }

  // Step 2: Find the ReplyLikelihood document for the best match user and post
  const likelihood = await ReplyLikelihood.findOne({ userId: bestMatch.userId, postId: bestMatch.postId });
  
  // If a match exists, update its score
  if (likelihood) {
  
    likelihood.score = 0;  // Set the score to zero for the best match


    // Step 3: Save the updated likelihood document
    await likelihood.validate();
    await likelihood.save();
    await session.commitTransaction();
    session.endSession();
    console.log(`Updated the score to 0 for user ${bestMatch.userId} on post ${bestMatch.postId}`);
    responseLogger.info(`Updated the score to 0 for user ${bestMatch.userId} on post ${bestMatch.postId}`);
  } else {
    console.warn(`No ReplyLikelihood found for user ${bestMatch.userId} and post ${bestMatch.postId}`);
  }
};

const getHighestLikelihoodPostAndUser = async (userIds: string[]): Promise<{ userId: string, postId: string | mongoose.Types.ObjectId, score: number } | null> => {
  const latestPosts = await getLatestPost(); // Fetch all latest posts

  if (!latestPosts || latestPosts.length === 0) {
    console.warn('No latest posts found.');
    responseLogger.info(`No latest posts found.`);
    return null; // Exit early if no posts are found
  }

  let highestScore = -Infinity;  // Initialize to negative infinity
  const latestPosts2 = latestPosts[0]
  
  
  const bestMatchArray = await ReplyLikelihood.find({
    userId: { $in: userIds },
    postId: latestPosts2._id  // Ensure that _id is the correct ObjectId
  
  }).sort({ score: -1 }).limit(1);
  
  const bestMatch = bestMatchArray.length > 0 ? bestMatchArray[0] : null;

  if (bestMatch) {
    console.log(`Best match found: User ${bestMatch.userId} for Post ${bestMatch.postId} with score ${bestMatch.score}`);
    responseLogger.info(`Best match found: User ${bestMatch.userId} for Post ${bestMatch.postId} with score ${bestMatch.score}`);
  } else {
    responseLogger.info(`No valid matches found for users and posts ${latestPosts2.id} `);
    console.warn('No valid matches found for users and posts.');
  }

  return bestMatch ? {
    userId: bestMatch.userId.toString(),
    postId: bestMatch.postId.toString(),
    score: bestMatch.score
  } : null;
};

const updateUserScores = async (userIds: string[], probabilities: number[]): Promise<void> => {
  const latestPosts = await getLatestPost(); // Fetch all latest posts
  const latestPosts2 = latestPosts[0]
  if (!latestPosts || latestPosts.length === 0) {
    console.warn('No latest posts found.');
    return; // Exit early if no posts are found
  }

  const bulkOperations: any[] = [];

  // Iterate over each user and each post
  userIds.forEach((userId, userIndex) => {
    latestPosts.forEach((post, postIndex) => {
    if(postIndex == 0 && userIndex == 0){
      responseLogger.info(`userId ${userId}.`);
      responseLogger.info(`postId ${post._id}.`);
      responseLogger.info(`score ${probabilities[userIndex] * 10}.`);
    }
      bulkOperations.push({
        updateOne: {
          filter: { userId, postId: post._id },
          update: { score: probabilities[userIndex] * 10 }, // Convert probability to score
          upsert: true, // Create a new document if it doesn't exist
        },
      });
    });
  });

  if (bulkOperations.length > 0) {
    await ReplyLikelihood.bulkWrite(bulkOperations);
    console.log(`Updated reply likelihood scores for ${userIds.length} users and ${latestPosts.length} posts.`);
    
    responseLogger.info(`Updated reply likelihood scores for ${userIds.length} users and ${latestPosts.length} posts.`);
    responseLogger.info(`Updated reply likelihood scores for ${userIds.length} users and ${latestPosts2.id} posts.`);

  } else {
    console.warn('No valid updates found.');
  }
};

const updateWantToReplyForAllUsers = async (agents: any[], probabilities: number[]): Promise<void> => {
  const bulkOps: any[] = [];

  for (let i = 0; i < agents.length; i++) {
    try {
      const agent = agents[i];
      if (!agent) {
        console.warn(`Agent not found with ID: ${agent._id}`);
        continue;
      }

      // Check if probabilities length matches with wantToReply length
      if (agent.wantToReply.length !== probabilities.length) {
        console.error(`Length mismatch for agent ${agent._id}: wantToReply length is ${agent.wantToReply.length}, but probabilities length is ${probabilities.length}`);
        continue;
      }

      // Prepare the update operation for this agent
      const updatedWantToReply = agent.wantToReply.map((entry: WantToReplyEntry, index: number) => ({
        postId: entry.postId,
        score: probabilities[index] * 10, // Scale probability to a score (0 to 10)
      }));

      bulkOps.push({
        updateOne: {
          filter: { _id: agent._id },
          update: { $set: { wantToReply: updatedWantToReply } },
        },
      });

    } catch (error) {
      console.error(`Error preparing bulk update for agent ${agents[i]._id}:`, error);
    }
  }

  if (bulkOps.length > 0) {
    try {
      // Perform the bulk update in one request
      const result = await User.bulkWrite(bulkOps);
      console.log(`Bulk update completed. Modified ${result.modifiedCount} users.`);
    } catch (error) {
      console.error('Error performing bulk update:', error);
    }
  } else {
    console.warn('No operations to perform. No users were updated.');
  }
};

function shuffleArray(array: any[]): any[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Pick a random index
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}
export class SimulationService {
  private static io: SocketServer;
  private static timerStarted: boolean = false;
  private static seconds: number = 0;
  private static isSimulationRunning = false;
  private static timerInterval: NodeJS.Timeout | null = null;
  
  static stopSimulation(): void {
    this.isSimulationRunning = false;
    this.stopTimer();
    this.io.emit('simulation-status', { running: false });
  }
  
     
  
  static async getAgentActionProbabilities(agentFeatures: string[][], actionLabels: string[][]): Promise<number[]> {
    try {
        // Convert agentFeatures into a numerical format (if needed)
        const flattenedFeatures = agentFeatures.flat().map((feature: string) => {
            return feature.length; // Example transformation, adjust as needed
        });
  
        // Prepare JSON payload for the Flask API
        const payload = {
           agentFeatures, 
           actionLabels
        };
        
        console.log("payload");
        console.log(payload);
        
        const batch_history1 = [...payload.agentFeatures];
        const batch_post1 = [...payload.actionLabels];
        
        console.log({batch_history1,batch_post1});
        
        //responseLogger.info(batch_history1);
        //responseLogger.info(batch_post1);
        
        responseLogger.info(batch_history1.length);
        responseLogger.info(batch_post1.length);
        
        let response;
        if (batch_history1.length == 1) {
          const batch_history = batch_history1[0];
          let batch_post = batch_post1[0];
          responseLogger.info(batch_post);
          batch_post = shuffleArray(batch_post);
          responseLogger.info(batch_post);
          //responseLogger.info(batch_history);
          //responseLogger.info(batch_post);
          response = await axios.post('http://127.0.0.1:5000/predict',{ batch_history,batch_post});
      }else{
        const batch_history = batch_history1;
          let batch_post = batch_post1[0];
          responseLogger.info(batch_post);
          batch_post = shuffleArray(batch_post);
          responseLogger.info(batch_post);
        //
        //responseLogger.info(batch_post);
        response = await axios.post('http://127.0.0.1:5000/predict',{ batch_history,batch_post});
  
  }
        
  
        // Make a POST request to Flask API
        //const response = await axios.post('http://127.0.0.1:5000/predict',{ batch_history,batch_post});
        
  
        // Extract probabilities from the response
        const probabilities = response.data.predictions;
        responseLogger.info(`probabilities ${probabilities}`);
        console.log(probabilities);
        
  
        return probabilities; // Return the output probabilities
  
    } catch (error) {
        console.error('Error calling Flask API:', error);
        throw new Error('Failed to get predictions from Flask API');
    }
  }
    
    
  static initialize(ioInstance: SocketServer): void {
    this.io = ioInstance;
    // Start timer only once
    if (!this.timerStarted) {
      this.startTimer();
      this.timerStarted = true;
    }
  }

  private static startTimer() {
    if (this.timerInterval) return; // Prevent duplicate intervals

    this.timerInterval = setInterval(() => {
      this.io.emit('timer-update', { seconds: this.seconds });
      this.seconds += 1;
    }, 1000);
  }

  private static stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.seconds = 0; // Optional: reset timer if desired
  }


  static async runSimulation(currentTime: number): Promise<void> {
    this.isSimulationRunning = true;
    this.startTimer();
    let agents = await getAllAgents();
    responseLogger.info("runSimulation KIT");
    if (agents.length === 0) return;
    const totalAgents = agents.length;

    //for (let i = 0; i < 3; i++) {
      //await performAgentAction(agents[i], 0);
    //}
    
    /*for (const agent of agents) {
      if (!this.isSimulationRunning) {
        responseLogger.info("Simulation stopped.");
        break;
      }
      if (agent.activateAgent(currentTime, agent.loggedIn)) {
        await performAgentAction(agent, 0);
      }
    }*/
    
    for (let i = 0; i < 5; i++) {
      if (!this.isSimulationRunning) {
        responseLogger.info("Simulation stopped.");
        break;
      }
     agents = await getAllAgents();
    const passiveCount_1 = Math.floor(totalAgents * 0.2); // 20% Like
    const passiveCount_2 = Math.floor(totalAgents * 0.2); // 20% Like
    const semiActiveCount = Math.floor(totalAgents * 0.3); // 30% Comment 
    
    let currentAgent = 0;
    for (let i = 0; i < totalAgents; i++) {
      if (!this.isSimulationRunning) {
        responseLogger.info("Simulation stopped.");
        break;
      }
    
      if (agents[i].activateAgent(currentTime, agents[i].loggedIn)) {
      
        const randomNumber = Math.floor(Math.random() * 100) + 1;
        responseLogger.info(`randomNumber  ${randomNumber}`);
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
this.stopSimulation();
//for (let i = 0; i < totalAgents; i++) {
//    agents[i].activateAgent(currentTime, agents[i].loggedIn)
//}
  }
}
