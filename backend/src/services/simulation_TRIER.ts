import { Server as SocketServer } from 'socket.io';
import { getAllAgents } from './database_service';
import { emitChartData } from './chart_service';
import { performAgentAction } from './agent_Actions';
import  responseLogger  from '../utils/logs/logger';
import axios from 'axios';
import { User, IUser  } from "../models/user/user.model";  
import { Post, IPost } from "../models/content/post.model";
import { ReplyLikelihood } from "../models/user/replyLikelihood";
import mongoose, { Schema, Document, ObjectId } from "mongoose";

interface WantToReplyEntry {
  postId: mongoose.Types.ObjectId;
  score: number;
}

const getPostsByUser = async (userId: string): Promise<IPost[]> => {
  try {
    const post = await Post.findOne({ postedBy: userId }).sort({ createdAt: -1 }).limit(2); // Sorting by creation date, most recent first
    if (post) {
      return [post]; // Return as an array
    } else {
      return []; // Return an empty array if no post is found
    }
  } catch (error) {
    console.error(`Error fetching posts for user ${userId}:`, error);
    return []; // Return an empty array on error
  }
};

const getLatestPost = async (): Promise<IPost[]> => {
  try {
    // Fetch the latest post from all users, sorted by creation date
    const latestPosts = await Post.find().sort({ createdAt: -1 });
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


const fetchAgentFeaturesAndLabels = async (userIds: string[]): Promise<{ agentFeatures: string[][], actionLabels: string[][], validUserIds: string[] }> => {
  const agentFeatures: string[][] = [];
  const actionLabels: string[][] = [];
  const validUserIds: string[] = [];  // Store userIds with valid posts

  // Fetch posts and actionLabels for users
  for (const userId of userIds) {
    // Fetch all posts for the user and extract descriptions
    const userPosts = await getPostsByUser(userId);
    
    // Only add users with posts
    if (userPosts.length > 2) {
      //const userPostDescriptions = userPosts.map(post => post.desc); // Convert to strings
      agentFeatures.push([...userPosts[0].desc,userPosts[1].desc]);
      validUserIds.push(userId); // Track the valid user
    }
  }

  // Fetch the latest post across all users
  const latestPost = await getLatestPost(); // Assuming this fetches the latest post across all users

  // If a latest post is found, push its description into actionLabels
  if (latestPost) {
    const userPostDescriptions = latestPost.map(post => post.desc);
    actionLabels.push(userPostDescriptions); // Only one latest post description will be pushed
  }
  
  //for (let i = 0; i < agentFeatures.length-1; i++) {
  //  if (latestPost) {
  //    actionLabels.push(latestPost.desc); // Only one latest post description will be pushed
    //}
  //}
  

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
    return result[0];
  } catch (error) {
    console.error("Error finding user with the highest score:", error);
  }
};

const setBestMatchProbabilityToZero = async (userIds: string[]): Promise<void> => {
  // Step 1: Get the highest likelihood user and post
  const bestMatch = await getHighestLikelihoodPostAndUser(userIds);

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
    await likelihood.save();
    console.log(`Updated the score to 0 for user ${bestMatch.userId} on post ${bestMatch.postId}`);
  } else {
    console.warn(`No ReplyLikelihood found for user ${bestMatch.userId} and post ${bestMatch.postId}`);
  }
};

const getHighestLikelihoodPostAndUser = async (userIds: string[]): Promise<{ userId: string, postId: string | mongoose.Types.ObjectId, score: number } | null> => {
  const latestPosts = await getLatestPost(); // Fetch all latest posts

  if (!latestPosts || latestPosts.length === 0) {
    console.warn('No latest posts found.');
    return null; // Exit early if no posts are found
  }

  let highestScore = -Infinity;  // Initialize to negative infinity
  let bestMatch: { userId: string, postId: string | mongoose.Types.ObjectId, score: number } | null = null;

  // Iterate over each user and each post to compare scores
  for (const userId of userIds) {
    for (const post of latestPosts) {
      // Get the score for this user and post
      const likelihood = await ReplyLikelihood.findOne({ userId, postId: post._id });

      if (likelihood) {
        const score = likelihood.score;

        // Compare if this score is higher than the highest score found so far
        if (score > highestScore) {
          highestScore = score;
          bestMatch = { userId, postId: post._id, score };  // Store the best match
        }
      }
    }
  }

  if (bestMatch) {
    console.log(`Best match found: User ${bestMatch.userId} for Post ${bestMatch.postId} with score ${bestMatch.score}`);
  } else {
    console.warn('No valid matches found for users and posts.');
  }

  return bestMatch;  // Return the best match (userId, postId, score)
};


const updateUserScores = async (userIds: string[], probabilities: number[]): Promise<void> => {
  const latestPosts = await getLatestPost(); // Fetch all latest posts

  if (!latestPosts || latestPosts.length === 0) {
    console.warn('No latest posts found.');
    return; // Exit early if no posts are found
  }

  const bulkOperations: any[] = [];

  // Iterate over each user and each post
  userIds.forEach((userId, userIndex) => {
    latestPosts.forEach((post) => {
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


export class SimulationService {
  private static io: SocketServer; 
    
    
  static async initialize(ioInstance: SocketServer): Promise<void> {
    this.io = ioInstance;
   
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
      
      const batch_history = [...payload.agentFeatures];
      const batch_post = payload.actionLabels;
      
      console.log({batch_history,batch_post});
      

      // Make a POST request to Flask API
      const response = await axios.post('http://127.0.0.1:5001/predict',{ batch_history,batch_post});
      

      // Extract probabilities from the response
      const probabilities = response.data.predictions;
      console.log(probabilities);
      

      return probabilities; // Return the output probabilities

  } catch (error) {
      console.error('Error calling Flask API:', error);
      throw new Error('Failed to get predictions from Flask API');
  }
}




  static async runSimulation(currentTime: number): Promise<void> {
    let agents = await getAllAgents();
    if (agents.length === 0) return;
    const totalAgents = agents.length;

    //for (let i = 0; i < 3; i++) {
      //await performAgentAction(agents[i], 0);
    //}    
    //for (const agent of agents) {
    //  if (agent.activateAgent(currentTime, agent.loggedIn)) {
    //    await performAgentAction(agent, 0);
    // }
  //}
    
    for (let i = 0; i < 10; i++) {
      agents = await getAllAgents();
      const passiveCount_1 = Math.floor(totalAgents * 0.1); // 20% Like
      const passiveCount_2 = Math.floor(totalAgents * 0.9); // 20% Like 
    
    for (let i = 0; i < totalAgents; i++) {
      if (agents[i].activateAgent(currentTime, agents[i].loggedIn)) {
      let actionType: number;
      const randomNumber = Math.floor(Math.random() * 100) + 1;
      responseLogger.info(`randomNumber  ${randomNumber}`);
      
      if (randomNumber <= 20) {
        actionType = 0; // post
        await performAgentAction(agents[i], actionType);
        
      } else if (randomNumber> 20) {
        actionType = 1; 
        try {
          const userIds = await User.find().select("_id"); // Fetch only _id fields
          console.log(userIds);
          const user_ids = userIds.map(user => user._id.toString());
          
          const { agentFeatures, actionLabels, validUserIds } = await fetchAgentFeaturesAndLabels(user_ids);
        if (agentFeatures.length > 0 && actionLabels.length > 0) {
          try {
          
            console.log(`agentFeatures for Agent  :`, agentFeatures);
            console.log(`actionLabels for Agent :`, actionLabels);
            const probabilities = await SimulationService.getAgentActionProbabilities(agentFeatures, actionLabels);
            console.log(`Probabilities for Agent:`, probabilities);
            //await updateWantToReplyForAllUsers(agents, probabilities);
            await updateUserScores(validUserIds, probabilities);
            const bestMatch = await getHighestLikelihoodPostAndUser(user_ids);
            
            const user_1 = await User.findOne({ _id: bestMatch?.userId });
            const post_1 = await Post.findOne({ _id: bestMatch?.postId });
            if (user_1 && post_1) {
              // If user_1 is found, perform the action
              await performAgentAction(user_1, actionType, post_1);
            } else {
              console.error(`User with ID ${bestMatch?.userId} not found.`);
            }
            await setBestMatchProbabilityToZero([bestMatch?.userId as string]);
            
          } catch (error) {
            console.error(`Error calculating probabilities for Agent ${agents[i]._id}:`, error);
          }
          
          
        }
      } catch (error) {
          console.error("Error fetching user IDs:", error);
        }
        
        
        
        //const agentFeatures = [["History 1.a", "History 1.b"], ["History 2.a", "History 2.b"]];
        //const actionLabels = ["Post 1", "Post 2"];
        //const probabilities = await SimulationService.getAgentActionProbabilities(agentFeatures, actionLabels);
        
      }
      
      /*
      try {
            // Assuming the agent has some features that are passed to the model
            const agentFeatures = agents[j].getAgentFeatures(); // This should return a structured set of features
            actionType = await SimulationService.classifyAgentAction(agentFeatures);

            // Log and decide the action based on classification
            responseLogger.info(`Predicted action type: ${actionType}`);
          } catch (error) {
            // Fallback to random action if classification fails
            actionType = randomNumber <= 20 ? 0 : 1;
            responseLogger.error('Fallback to random action due to classification failure.');
          }
      */
      
      
      //emitChartData(this.io, agents);
    }
  }
}

//for (let i = 0; i < totalAgents; i++) {
//    agents[i].activateAgent(currentTime, agents[i].loggedIn)
//}
  }
}
