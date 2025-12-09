// src/services/simulationService.ts
import { User, IUser  } from "../models/user/user.model"; 
import { Types, Schema } from "mongoose";
import { Post } from "../models/content/post.model";
import { PostLike } from "../models/content/postLike.model";
import { Comment } from "../models/content/comment.model";
import { CommentLike } from "../models/content/commentLike.model";
import { CommentDislike  } from "../models/content/commentDislike.model";
import { Repost } from "../models/content/repost.model";
import { Readpost } from "../models/content/read.model"; 
import { IAgent } from "../models/user/agent.model";
import { Reaction, AMCDOpinionModel } from "../models/user/opinion.model";
import { SimpleLogger } from "../models/user/logger.model";
import { DefaultActor } from "../models/user/actor.model";
import { Server as SocketServer } from 'socket.io';
import  responseLogger  from '../utils/logs/logger';
import { ObjectId } from "mongoose";
import { Agent } from "http";
import mongoose from "mongoose";
import { delayedFunction } from "../utils/helpers";
import { PostDislike } from "../models/content/postDislike.model";
import { ITimeBudget, TimeBudget } from "../models/user/timeBudget.model";

import { Integration } from "../Serving_Agents/Agents/integration";  
import { Persona } from "../Serving_Agents/Agents/persona";  
import { Response } from "../Serving_Agents/Agents/response";  
import { Together}  from 'together-ai'; // Correct for named exports



import { IPost } from "../models/content/post.model"; // Assuming IPost interface is imported correctly
import { IPostLike } from "../models/content/postLike.model"; // Assuming IPostLike interface is imported correctly
import { IPostDislike } from "../models/content/postDislike.model"; // Assuming IPostDislike interface is imported correctly
import { fetchAndRankPosts } from './ranker';
import connectDB from "../config/db";

import * as dotenv from "dotenv";
import { userInfo } from "os";

dotenv.config();

const posting_model = "abdulsittar72/TWON-Agent-OSN-Post-en"; 
const replying_model = "abdulsittar72/TWON-Agent-OSN-Replies-en"; 

const apiKey = process.env.TOGETHER_API_KEY;

if (!apiKey) {
  console.error('API Key is missing!');
  process.exit(1);   
}

const isTestEnvironment = process.env.NODE_ENV === 'test';

let k: string | { apiKey: string };
/*let client: Together; // Define the type of together

if (isTestEnvironment) {
  k = apiKey; // Pass as string
} else {
  k = { apiKey }; // Pass as object
}

// Check type and pass the correct value to the constructor
if (typeof k === 'string') {
  client = new Together(k); // Pass string if k is a string
} else {
  client = new Together(k.apiKey); // Pass string from k.apiKey if k is an object
}*/


const client = new Together({ apiKey });
//const client = new Together(apiKey);

const model = process.env.model;
const provider = process.env.provider;
const topic = process.env.topic;
//const num_of_loops = process.env.num_of_loops;
//num_of_loops = parseInt(num_of_loops, 10);
const totalAgents = process.env.num_of_agents;
//totalAgents= parseInt(totalAgents, 10);
//var agents = allagents.slice(0, totalAgents);

const num_of_loops = 1;  
var agents = [User];

export class SimulationService {
  private static io: SocketServer;
    
  static initialize(ioInstance: SocketServer): void {
    this.io = ioInstance;
  }

  static async runSimulation(): Promise<void> {
  this.io.emit('simulation-status', { running: true });
  
    await connectDB();
      try {
        for (let i = 0; i < num_of_loops; i++) {
        
          const agents = await User.find().populate('timeBudget');
          if (agents.length === 0) {
            responseLogger.debug("No agents to simulate.");
            return;
          }
          
          agents.forEach(agent => {
              agent.logger = new SimpleLogger();
              agent.actor = new DefaultActor();
            });
        
            for (const agent of agents) {
              const timeBudget = await TimeBudget.findById(agent.timeBudget);
              if ((timeBudget?.totalTime ?? 0) > 0 && agent.motivation > Math.random() * 100) {
                  // 🎯 Determine if the agent should log in
                  responseLogger.debug(`${timeBudget?.totalTime} - total time!`);
                  responseLogger.debug(`${agent.motivation} - motivation!`);
                  responseLogger.debug(`${agent.username} is logging in!`);
    
                  const randomAction = getRandomInt(0, 3);
                  responseLogger.debug(`Action ${i}!`);
                  responseLogger.debug(`Random Action ${randomAction}!`);
                  responseLogger.debug(`Random Agent: ${JSON.stringify(agent)}!`);
          
          
          await makeDataPublic();
          switch (randomAction) {
            case 0:
            
              await fetchAndRankPosts();
              await agent_Generate_Post_Loop(agent);
              break;
    
            case 1:
              await fetchAndRankPosts();
              await agent_Reply_Comment_Loop(agent);
              break;
    
            case 2:
              await fetchAndRankPosts();
              await agent_Like_Post_Loop(agent); 
              break;
    
            case 3:
              await fetchAndRankPosts(); 
              await agent_Dislike_Post_Loop(agent); 
              break;
    
            default:
              responseLogger.debug("Invalid action choice.");
              break;
          }
          
          const posts = await Post.find()
          var chartData = agents.map((user, index) => {
            const totalTime1 = user.timeBudget ? (user.timeBudget as ITimeBudget).totalTime || 0  : 0; 
            return {name: user.username,  visit: totalTime1 } });
            const response1 = {color: "#FF8042", title: "Total Time", dataKey: "visit", chartData, };
            this.io.emit('timebudget_totaltime', { response1 });
              
              
            chartData  = agents.map((user, index) => {
                const totalTime2 = user.timeBudget && (user.timeBudget as ITimeBudget).replenishRate !== undefined ? Math.floor(Math.random() * 101) : 20;  
            return {  name: user.username,  visit: totalTime2  } });
            const response2 = { color: "#FF8042", title: "Replenish Rate", dataKey: "visit", chartData, };
            this.io.emit('timebudget_replenish', { response2 });
              
              
            chartData  = agents.map((user, index) => {
                const totalTime = user.timeBudget ? (user.timeBudget as ITimeBudget).usedTime || 0  : 0; 
            return {  name: user.username,  visit: totalTime } });
            const response3 = { color: "#FF8042", title: "Used Time",  dataKey: "visit", chartData,};
            this.io.emit('timebudget_usedtime', { response3 });
          
            chartData = agents.map((user, index) => {
            // Log each user to ensure it has an `_id` property
            if (!user || !user._id) {
                  responseLogger.error(`User at index ${index} is missing _id: ${JSON.stringify(user)}`);
                  return { name: user?.username || "Unknown", visit: 0 };
                }
              
            responseLogger.debug(`posts ${posts.length}`);
            const userPostCount = posts.filter((post, postIndex) => { 
                  if (!post || !post.postedBy) {
                    //responseLogger.error(`Post at index ${postIndex} is missing postedBy: ${JSON.stringify(post)}`);
                    return false;
                  }
              
                  // Add extra logs for matching logic
                  //responseLogger.debug(`Comparing post.postedBy: ${post.postedBy} with user._id: ${user._id}`);
                  return post.postedBy.toString() === user._id.toString();
            }).length;
              
            responseLogger.debug(`User ${user.username} has ${userPostCount} posts`);
            return { name: user.username, visit: userPostCount };
            });
            this.io.emit("posts_per_user", { response4: { color: "#0088FE", title: "Number of Posts Per User", dataKey: "visit", chartData,}});
          
            chartData = agents.map((user, index) => {
            // Log each user to ensure it has an _id property
            if (!user || !user._id) {
                 console.error(`User at index ${index} is missing _id: ${JSON.stringify(user)}`);
                  return { name: user?.username || "Unknown", visit: 0 };
            }
                // Filter posts by this user where rank is less than 10
            const userPostCount = posts.filter((post, postIndex) => {
                // Log each post to ensure postedBy is valid
                
            if (!post || !post.postedBy) {
              console.log(post);
                console.error(`Post at index ${postIndex} is missing postedBy: ${JSON.stringify(post)}`);
                return false;
                }
                // Only count the posts with rank less than 10
            if (post.rank < 100 && post.postedBy.toString() === user._id.toString()) {
                return true;
               }
                return false;
              }).length;

              console.info(`User ${user.username} has ${userPostCount} posts with rank < 10`);
              return { name: user.username, visit: userPostCount };
              });
              // Emit the data via socket
            this.io.emit("get_postsPerUserWithLowRanking", { response5: {color: "#0088FE", title: "Number of Posts Per User (Rank < 10)",  dataKey: "visit",chartData, },});
        
        }
      }
      }
      } catch (error) {
            responseLogger.debug(`Scheduler App Error: ${error}`);
      }
      for (let timeStep = 0; timeStep < 2; timeStep++) {
        responseLogger.debug(`Running simulation for time step: ${timeStep}`);
        await delayedFunction(); // Delay of 1 second
      }
      responseLogger.debug("Simulation completed!");
  }
  
  static async updateTimeBudget(agent: IUser, value:number): Promise<void> {
    try {
      if (!agent.timeBudget) {
        responseLogger.warn(`Agent ${agent.username} has no associated time budget.`);
        return;
      }
  
      // Find the associated TimeBudget
      const timeBudget = await TimeBudget.findById(agent.timeBudget);
  
      if (!timeBudget) {
        responseLogger.warn(`TimeBudget not found for agent ${agent.username}.`);
        return;
      }
  
      // Update total time and used time
      timeBudget.totalTime = Math.max(0, timeBudget.totalTime - value); // Deduct 10 but ensure it doesn't go below 0
      timeBudget.usedTime += value;
  
      // Save the updated time budget
      await timeBudget.save();
  
      responseLogger.debug(
        `Updated time budget for agent ${agent.username}: TotalTime=${timeBudget.totalTime}, UsedTime=${timeBudget.usedTime}`
      );
    } catch (error) {
      responseLogger.error(`Error updating time budget for agent ${agent.username}: ${error}`);
    }
  }
  
  static async updateMotivation(postId: Types.ObjectId, value: number): Promise<void> {
    try {
      // Find the user who posted the post
      const user = await User.findById(postId); // Assuming post has a reference to the userId
  
      if (!user) {
        responseLogger.warn(`User not found for the post ${postId}.`);
        return;
      }
  
      // Increase the user's motivation
      let newMotivation = user.motivation + value;
  
      // Ensure motivation stays within the 0 to 100 range
      newMotivation = Math.max(0, Math.min(100, newMotivation));
  
      // Update the user's motivation
      user.motivation = newMotivation;
  
      // Log the update
      responseLogger.debug(`Updated motivation for user ${user.username}: Motivation=${user.motivation}`);
  
      // Save the updated user document
      await user.save();
    } catch (error) {
      responseLogger.error(`Error updating motivation for post ${postId}: ${error}`);
    }
  }

  static async runSimulation2(): Promise<void> {
    const users = await User.find().populate('timeBudget');

    if (users.length === 0) {
      responseLogger.debug("No agents to simulate.");
      return;
    }
    
    users.forEach(user => {
        user.logger = new SimpleLogger();
        user.actor = new DefaultActor();
      });

    // Loop through a set time for the simulation
    for (let timeStep = 0; timeStep < 10; timeStep++) {
      responseLogger.debug(`Running simulation for time step: ${timeStep}`);

      // Activate agents based on their activation probability
      for (const user of users) {
      
        user.activateAgent(); // Treating each user as an agent and activating them
      }

      var chartData = users.map((user, index) => { 

      
        const totalTime1 = user.timeBudget && (user.timeBudget as { totalTime: number }).totalTime !== undefined ? Math.floor(Math.random() * 101) : 20; 
             
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
      
        const totalTime2 = user.timeBudget && (user.timeBudget as { replenishRate: number }).replenishRate !== undefined ? Math.floor(Math.random() * 101) : 20; 
             
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
        
        const totalTime = user.timeBudget && (user.timeBudget as { usedTime: number }).usedTime !== undefined ? Math.floor(Math.random() * 101) : 20; 
             
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
      await delayedFunction(); // Delay of 1 second
    }

    responseLogger.debug("Simulation completed!");
  }
/*
  static isAgentActivated(agent: IAgent): boolean {
    // Activation function based on motivation and engagement
    const activationProbability = (agent.motivation + agent.engagement) / 2;
    return Math.random() < activationProbability; // Randomly determine if agent is activated
  }

  static async processAgentAction(agent: IAgent): Promise<void> {
    responseLogger.debug(`Processing agent ${agent.username}`);

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

export const makeDataPublic = async () => {

  try {
    const result = await Post.updateMany({}, { $set: { isPublic: true } });
    console.log(`${result.modifiedCount} Post updated to public.`);
  } catch (error) {
    console.error("Error updating Post:", error);
  }
  
  try {
    const result = await PostLike.updateMany({}, { $set: { isPublic: true } });
    console.log(`${result.modifiedCount} posts like updated to public.`);
  } catch (error) {
    console.error("Error updating posts like:", error);
  }
  
  try {
    const result = await PostDislike.updateMany({}, { $set: { isPublic: true } });
    console.log(`${result.modifiedCount} posts dislike updated to public.`);
  } catch (error) {
    console.error("Error updating posts dislike:", error);
  }

  try {
    const result = await Comment.updateMany({}, { $set: { isPublic: true } });
    console.log(`${result.modifiedCount} comments updated to public.`);
  } catch (error) {
    console.error("Error updating comments:", error);
  }
  
  try {
    const result = await CommentLike.updateMany({}, { $set: { isPublic: true } });
    console.log(`${result.modifiedCount} comments like updated to public.`);
  } catch (error) {
    console.error("Error updating comments like:", error);
  }
  
  try {
    const result = await CommentDislike.updateMany({}, { $set: { isPublic: true } });
    console.log(`${result.modifiedCount} comments dislike updated to public.`);
  } catch (error) {
    console.error("Error updating comments dislike:", error);
  }
  
};

export async function getFollowingsAndFollowers(agentUserId: string): Promise<Array<any>> {
  try {
    responseLogger.debug("Executing getFollowingsAndFollowers function");
    responseLogger.debug(`Agent User ID: ${agentUserId}`);

    // Fetch user from database by ID
    const user = await User.findById(agentUserId).populate("followings followers");

    if (!user) {
      responseLogger.error("User not found");
      return [];
    }

    // Get the list of followings and followers
    const followings = user.followings || [];
    const followers = user.followers || [];

    responseLogger.debug(`Followings count: ${followings.length}`);
    responseLogger.debug(`Followers count: ${followers.length}`);

    // Combine followings and followers into a single array
    const combinedUsers = [...followings, ...followers];

    responseLogger.debug(`Total combined users (Followings + Followers): ${combinedUsers.length}`);

    return combinedUsers;
  } catch (error) {
    responseLogger.error(`Error in getFollowingsAndFollowers: ${error}`);
    throw new Error("An error occurred while fetching followings and followers.");
  }
}


export async function getInteractionsAgentOnPosts(agnt: any ): Promise<Array<any>> {
  const postsReq: Array<any> = [];
  const posts = await Post.find({ userId: agnt.userId }).sort({ createdAt: -1 }).limit(5).exec();

  for (const post of posts) {
    postsReq.push({ action: "wrote", message: post.desc });
  }

  const postLikes = await PostLike.find({ userId: agnt.userId }).sort({ createdAt: -1 }).limit(5).exec();

  for (const like of postLikes) {
    const likedPosts = await Post.find({ postId: like.postId });

    for (const likedPost of likedPosts) {
      postsReq.push({ action: "liked", message: likedPost.desc });
    }
  }
 
  return postsReq;
}

/**
 * Fetch interactions of an agent on comments.
 * 
 * @param agnt - The agent object containing userId.
 * @returns {Promise<Array<any>>} - Array of comment interactions.
 */
export async function getInteractionsAgentOnComments(agnt: any): Promise<Array<any>> {
  const postsReq: Array<any> = [];
  const comments = await Comment.find({ userId: agnt._id }).sort({ createdAt: -1 }).limit(5).exec();

  for (const comment of comments) {
    postsReq.push({ action: "wrote", message: comment.body });
  }

  const commentLikes = await CommentLike.find({ userId: agnt._id }).sort({ createdAt: -1 }).limit(5).exec();

  for (const like of commentLikes) {
    const likedComments = await Comment.find({ _id: like.commentId });

    for (const likedComment of likedComments) {
      postsReq.push({ action: "liked", message: likedComment.body });
    }
  }

  /// Custom logic to format the posts
  const formattedPosts = (() => {
    if (postsReq.length <= 2) {
      return postsReq;
    }
    return [postsReq[0], ...postsReq.slice(-2)];
  })();

  // Return as an array
  return formattedPosts;
}

/**
 * Escape special characters in a string.
 * 
 * @param str - The input string to escape.
 * @returns {string} - Escaped string.
 */
export function addslashes(str: string): string {
  return (str + '').replace(/[\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

/**
 * Fetch the thread of an agent's interactions on comments.
 * 
 * @param agnt - The agent object.
 * @returns {Promise<any>} - The thread containing posts and comments.
 */
export async function getThreadAgentOnComments(agnt: any): Promise<any> {
  const postsThread: any[] = [];
  const postsReq: any[] = [];

  const today = new Date();
  const fifthBefore = new Date();
  fifthBefore.setDate(today.getDate() - 60);
  fifthBefore.setHours(0, 0, 0, 0);

  const query = {
    createdAt: {
      $lt: today,
      $gte: fifthBefore,
    },
  };

  await Post.find()
    .populate({ path: "comments", model: "Comment" })
    .sort({ rank: 1 })
    .limit(1)
    .exec()
    .then(async (posts) => {
      for (const post of posts) {
        const postAuthor = await User.findById(new mongoose.Types.ObjectId(post.userId));

        if (postAuthor) {
          for (const comment of post.comments) {
            const msg = {
              author: comment.username,
              message: `"${addslashes(comment.body)}"`,
            };
            postsReq.push(msg);
          }

          if (postsReq.length === 0) {
            postsReq.push({
              author: postAuthor.username,
              message: `"${addslashes(post.desc)}"`,
            });
          }
        }
      }
    });

  if (postsReq.length > 0) {
    postsThread.push({ posts: postsReq });
  }

  return postsThread;
}

/**
 * Generate a random integer between min and max (inclusive).
 * 
 * @param min - The minimum value.
 * @param max - The maximum value.
 * @returns {number} - A random integer.
 */
export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


export async function addAPost(agent: IUser,desc: string, userId: string, img?: string): Promise<void> {
  if (desc.length > 0) {
    const post = new Post({
      desc,
      userId,
      rank: 1000.0,
      pool: "0",
      isPublic:false,
      postedBy: new mongoose.Types.ObjectId(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    try {
      await post.save();
      responseLogger.debug("The post has been added");
      try{
      await SimulationService.updateTimeBudget(agent, 20);
      } catch (err) {
        responseLogger.debug(err);
      }
      
    } catch (err) {
      responseLogger.debug(err);
    }
  }
}

// Like a post
export async function likeAPost(agent: IUser,userId: string, postId: string): Promise<void> {
  try {
    responseLogger.debug("likeAPost");
    const post: IPost | null = await Post.findById(postId)
      .populate([
        { path: "likes", match: { userId } }, 
        { path: "dislikes", match: { userId } }
      ])
      .exec();
  
    if (!post){
      responseLogger.debug("no post found");
     return;
    }
  
    // Check if post is liked or disliked
    const isAlreadyLiked = post.likes && post.likes.length > 0;
    const isAlreadyDisliked = post.dislikes && post.dislikes.length > 0;
  
    // If already liked, extract the likeId
    if (isAlreadyLiked) {
      // Cast the first element of the likes array as IPostLike
      const likeId = (post.likes[0] as IPostLike)._id;
      await Post.findByIdAndUpdate(postId, { $pull: { likes: likeId } });
      await PostLike.findByIdAndDelete(likeId);
      responseLogger.debug("Removed like from post");
    } else if (isAlreadyDisliked) {
      const dislikeId = (post.dislikes[0] as IPostDislike)._id;
      await Post.findByIdAndUpdate(postId, { $pull: { dislikes: dislikeId } });
      await PostDislike.findByIdAndDelete(dislikeId);
      responseLogger.debug("Removed dislike from post");
    }

    if (!isAlreadyLiked) {
      const newLike = new PostLike({ userId, postId, isPublic:false });
      await newLike.save();
      const post = await Post.findById(postId);
      await Post.findByIdAndUpdate(postId, { $push: { likes: newLike._id } });
      responseLogger.debug("Added like to post");
      if(post?.postedBy){
        await SimulationService.updateMotivation(post?.postedBy, 2);
      }else {
        responseLogger.warn(`Post does not have a valid postedBy field.`);
      }
      
      try{
        await SimulationService.updateTimeBudget(agent, 5);
        } catch (err) {
          responseLogger.debug(err);
        }
      
    }
  } catch (err) {
    responseLogger.debug(err);
  }
}


export async function dislikeAPost(agent: IUser, userId: string, postId: string): Promise<void> {
  try {
    const post: IPost | null = await Post.findById(postId)
      .populate([
        { path: "likes", match: { userId } },
        { path: "dislikes", match: { userId } },
      ])
      .exec();

    if (!post) return;

    // Check if the post is already liked or disliked
    const isAlreadyLiked = post.likes && post.likes.length > 0;
    const isAlreadyDisliked = post.dislikes && post.dislikes.length > 0;

    // If the post is already liked, remove the like
    if (isAlreadyLiked) {
      const likeId = (post.likes[0] as IPostLike)._id; // Type cast to IPostLike
      await Post.findByIdAndUpdate(postId, { $pull: { likes: likeId } });
      await PostLike.findByIdAndDelete(likeId);
      responseLogger.debug("Removed like from post");
    } 
    // If the post is already disliked, remove the dislike
    else if (isAlreadyDisliked) {
      const dislikeId = (post.dislikes[0] as IPostDislike)._id; // Type cast to IPostDislike
      await Post.findByIdAndUpdate(postId, { $pull: { dislikes: dislikeId } });
      await PostDislike.findByIdAndDelete(dislikeId);
      responseLogger.debug("Removed dislike from post");
    }

    // If the post is not already disliked, add a new dislike
    if (!isAlreadyDisliked) {
      const newDislike = new PostDislike({ userId, postId , isPublic:false});
      await newDislike.save();
      await Post.findByIdAndUpdate(postId, { $push: { dislikes: newDislike._id } });
      responseLogger.debug("Added dislike to post");
      
      if(post?.postedBy){
        await SimulationService.updateMotivation(post?.postedBy, -2);
      }else {
        responseLogger.warn(`Post does not have a valid postedBy field.`);
      }
      
      try{
        await SimulationService.updateTimeBudget(agent, 5);
        } catch (err) {
          responseLogger.debug(err);
        }
      
    }
  } catch (err) {
    responseLogger.debug(err);
  }
}


// Add a comment
export async function addAComment(agent: IUser, desc: string, userId: string, postId: string, username: string): Promise<void> {
  if (desc.length > 0) {
    const comment = new Comment({ body: desc, userId, postId, username, isPublic:false });

    try {
      await comment.save();
      const post = await Post.findById(postId);
      if (post) {
        await post.updateOne({ $push: { comments: comment._id } });
      }
      responseLogger.debug("The comment has been added");
      if (post?.postedBy) {
        
        
        try{
          await SimulationService.updateMotivation(post.postedBy, 5);
          } catch (err) {
            responseLogger.debug(err);
          }
        
      }else {
        responseLogger.warn(`Post does not have a valid postedBy field.`);
      }
      
      try{
        await SimulationService.updateTimeBudget(agent, 20);
        } catch (err) {
          responseLogger.debug(err);
        }
      
      
    } catch (err) {
      responseLogger.debug(err);
    }
  }
}

// Like a comment
export async function likeAComment(agent: IUser,userId: string, commentId: string): Promise<void> {
  try {
    const comment = await Comment.findById(commentId)
      .populate([
        { path: "likes", match: { userId } },
        { path: "dislikes", match: { userId } },
      ]);

    if (!comment) return;

    let isAlreadyLiked = comment.likes && comment.likes.length > 0;
    let isAlreadyDisliked = comment.dislikes && comment.dislikes.length > 0;

    if (isAlreadyLiked) {
      const likeId = comment.likes[0];
      await Comment.findByIdAndUpdate(commentId, { $pull: { likes: likeId } });
      await CommentLike.findByIdAndDelete(likeId);
      responseLogger.debug("Removed like from comment");
    } else if (isAlreadyDisliked) {
      const dislikeId = comment.dislikes[0];
      await Comment.findByIdAndUpdate(commentId, { $pull: { dislikes: dislikeId } });
      await CommentDislike.findByIdAndDelete(dislikeId);
      responseLogger.debug("Removed dislike from comment");
    }

    if (!isAlreadyLiked) {
      const newLike = new CommentLike({ userId, commentId });
      await newLike.save();
      await Comment.findByIdAndUpdate(commentId, { $push: { likes: newLike._id } });
      responseLogger.debug("Added like to comment");
    }
  } catch (err) {
    responseLogger.debug(err);
  }
}

// Dislike a comment
export async function dislikeAComment(agent: IUser, userId: string, commentId: string): Promise<void> {
  try {
    const comment = await Comment.findById(commentId)
      .populate([
        { path: "likes", match: { userId } },
        { path: "dislikes", match: { userId } },
      ]);

    if (!comment) return;

    let isAlreadyLiked = comment.likes && comment.likes.length > 0;
    let isAlreadyDisliked = comment.dislikes && comment.dislikes.length > 0;

    if (isAlreadyLiked) {
      const likeId = comment.likes[0];
      await Comment.findByIdAndUpdate(commentId, { $pull: { likes: likeId } });
      await CommentLike.findByIdAndDelete(likeId);
      responseLogger.debug("Removed like from comment");
    } else if (isAlreadyDisliked) {
      const dislikeId = comment.dislikes[0];
      await Comment.findByIdAndUpdate(commentId, { $pull: { dislikes: dislikeId } });
      await CommentDislike.findByIdAndDelete(dislikeId);
      responseLogger.debug("Removed dislike from comment");
    }

    if (!isAlreadyDisliked) {
      const newDislike = new CommentDislike({ userId, commentId });
      await newDislike.save();
      await Comment.findByIdAndUpdate(commentId, { $push: { dislikes: newDislike._id } });
      responseLogger.debug("Added dislike to comment");
    }
  } catch (err) {
    responseLogger.debug(err);
  }
}

// Repost a post
export async function repostAPost(userId: string, postId: string): Promise<void> {
  try {
    const repost = new Repost({ userId, postId });
    await repost.save();
    await Post.findByIdAndUpdate(postId, { $push: { reposts: repost._id } });
    responseLogger.debug("Post reposted successfully");
  } catch (err) {
    responseLogger.debug(err);
  }
}

// Mark a post as read
export async function markPostAsRead(userId: string, postId: string): Promise<void> {
  try {
    const readEntry = await Readpost.findOne({ userId, postId });
    if (!readEntry) {
      const newReadPost = new Readpost({ userId, postId });
      await newReadPost.save();
      responseLogger.debug("Post marked as read");
    } else {
      responseLogger.debug("Post already marked as read");
    }
  } catch (err) {
    responseLogger.debug(err);
  }
}

// Agent Like Comment Loop
export async function agent_Like_Comment_Loop(randomAgent: IUser) {
  try {
    responseLogger.debug("agent_Like_Comment_Loop");

    const today = new Date();
    const Ffth_before = new Date();
    Ffth_before.setDate(today.getDate() - 30);
    Ffth_before.setHours(0, 0, 0, 0);

    responseLogger.debug(randomAgent);

    const agnts = await User.find({ username: randomAgent["username"] });
    const agnt = Array.isArray(agnts) ? agnts[0] : agnts;

    const allfofo = await getFollowingsAndFollowers(agnt._id as unknown as string);
    const comments = await Comment.find({
      userId: { $in: allfofo },
      createdAt: { $lt: today, $gte: Ffth_before },
    })
      .sort({ updatedAt: -1 })
      .limit(1);

    for (const comm of comments) {
      const comment = comm;
      const usr = await User.findById(comment.userId);
      
      if (!usr) {
        throw new Error(`User with ID ${comment.userId} not found`);
      }
      
      const pst = await Post.findById(comment.postId);
      const interactions = await getInteractionsAgentOnComments(agnt);

      const payload = {
        post: { author: usr.username, message: comment.body },
        history: { interactions },
        integration: { model, provider },
        language: "English",
        persona: [randomAgent["persona"]],
        platform: "Twitter",
      };

      const response = await fetch(`${process.env.AGENTS_URL}like/`, {
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: JSON.stringify(payload),
      });

      const res = await response.json();
      responseLogger.debug(res);

      if (res.response) {
        await likeAComment(agnt, agnt._id as unknown  as string, comment._id.toString());
      }
    }
  } catch (err) {
    responseLogger.debug("Error in agent_Like_Comment_Loop:", err);
  }
}

// Agent Like Post Loop
export async function agent_Like_Post_Loop(randomAgent: IUser) {
  try {
    responseLogger.debug("agent_Like_Post_Loop");

    const today = new Date();
    const Ffth_before = new Date();
    Ffth_before.setDate(today.getDate() - 30);
    Ffth_before.setHours(0, 0, 0, 0);

    const agnts = await User.find({ username: randomAgent["username"] });
    const agnt = Array.isArray(agnts) ? agnts[0] : agnts;

    const allfofo = await getFollowingsAndFollowers(agnt._id as unknown  as string);
    const posts = await Post.find()//({ userId: { $in: allfofo } })
      .populate({ path: "comments", model: "Comment" })
      .sort({ rank: -1 })
      .limit(1);

    for (const post of posts) {
      const usr = await User.findById(post.userId) ;
      if (!usr) {
        throw new Error(`User with ID ${post.userId} not found`);
      }
      
      const interactions = await getInteractionsAgentOnPosts(agnt);
      const prompt = `Your recent interactions in the platform are as follows:
      ${JSON.stringify(interactions, null, 2)}
      -----------------      
      Your native language is English, and you are browsing the online social network Twitter. Decide whether you like the provided post based on your personality. Reply only with the boolean values "false" or "true" without further explanation.
      Post: ${post.desc}     
      -----------------
      Response:`;
      const messages = [{ role: "user", content: prompt }];
//      const messages: { role: 'system' | 'user'; content: string }[] = [
  //      { role: 'system', content: systemMessage },
    //    { role: 'user', content: prompt }
      //]; 
      //const params = { model: "mistralai/Mistral-7B-Instruct-v0.1", "messages": messages, temperature: 0.7, max_tokens: 100, };
      
      
      try {
        const togetherResponse = await client.chat.completions.create({
          messages: [{"role": "user", "content": prompt}],
          model: posting_model,
      });
      //const togetherResponse = await client.chat.completions.create(params);
      //const params = { model: "mistralai/Mistral-7B-Instruct-v0.1", messages, temperature: 0.7, max_tokens: 100,};
      
      //const togetherResponse = await client.chat.completions.create(params);
      const decision = togetherResponse.choices?.[0]?.message?.content?.trim();
      
      responseLogger.debug(`Like Decision: ${decision}`);
      
      
      if (decision === "True") {
        await likeAPost(agnt, agnt._id as unknown  as string, post._id as string);
      }
      
    } catch (error) {
      console.error("Error during API call:", error);
    }
    }
  } catch (err) {
    responseLogger.debug("Error in agent_Like_Post_Loop:", err);
  }
}

// Agent Like Post Loop
export async function agent_Dislike_Post_Loop(randomAgent: IUser) {
  try {
    responseLogger.debug("agent_Disike_Post_Loop");

    const today = new Date();
    const Ffth_before = new Date();
    Ffth_before.setDate(today.getDate() - 30);
    Ffth_before.setHours(0, 0, 0, 0);

    const agnts = await User.find({ username: randomAgent["username"] });
    const agnt = Array.isArray(agnts) ? agnts[0] : agnts;

    const allfofo = await getFollowingsAndFollowers(agnt._id as unknown  as string);
    const posts = await Post.find()//({ userId: { $in: allfofo } })
      .populate({ path: "comments", model: "Comment" })
      .sort({ rank: -1 })
      .limit(1);

    for (const post of posts) {
      const usr = await User.findById(post.userId) ;
      if (!usr) {
        throw new Error(`User with ID ${post.userId} not found`);
      }
      
      const interactions = await getInteractionsAgentOnPosts(agnt);
      const prompt = `Your recent interactions in the platform are as follows:
      ${JSON.stringify(interactions, null, 2)}
      -----------------      
      Your native language is English, and you are browsing the online social network Twitter. Decide whether you dislike the provided post based on your personality. Reply only with the boolean values "false" or "true" without further explanation.
      Post: ${post.desc}     
      -----------------
      Response:`;
      //const messages = [{ role: "user", content: prompt }];
      //const params = { model: "mistralai/Mistral-7B-Instruct-v0.1", "messages": messages, temperature: 0.7, max_tokens: 100, }; 
      
      const togetherResponse = await client.chat.completions.create({
        messages: [{"role": "user", "content": prompt}],
        model: replying_model,
    });
      
     // const togetherResponse = await client.chat.completions.create(params);
      const decision = togetherResponse.choices?.[0]?.message?.content?.trim();
      
      responseLogger.debug(`Dislike Decision: ${decision}`);
      
      if (decision === "True") {
        await dislikeAPost(agnt, agnt._id as unknown  as string, post._id as string);
      }
    }
  } catch (err) {
    responseLogger.debug("Error in agent_Dislike_Post_Loop:", err);
  }
}


// Agent Reply Comment Loop
export async function agent_Reply_Comment_Loop(randomAgent: IUser) {
  try {
    responseLogger.debug("agent_Reply_Comment_Loop");

    const today = new Date();
    const Ffth_before = new Date();
    Ffth_before.setDate(today.getDate() - 60);
    Ffth_before.setHours(0, 0, 0, 0);

    const agnts = await User.find({ username: randomAgent["username"] });
    const agnt = agnts[0];

    if (agnt) {
      const post = await Post.findOne()
        .populate({ path: "comments", model: "Comment" })
        .sort({ rank: -1 });
        
        if (!post) {
          throw new Error(`Post not found`);
        }
      const interactions = await getInteractionsAgentOnComments(agnt);
      //const formattedInteractions = interactions.map((post) => JSON.stringify(post)).join("\n");
      const thread = await getThreadAgentOnComments(agnt);
      const prompt = `Your recent interactions in the platform are as follows:
        ${JSON.stringify(interactions, null, 2)}
        -----------------
        Your native language is English. Use this language in your response. You are browsing the online social network Twitter, and adhere to the style of the platform. Engage naturally in the conversation by writing a few-word response to the following thread based on your personality. You can also add topics that relate to the posts or comments. Omit information about your personality in your response.
        Thread: ${JSON.stringify(thread, null, 2)}
        -----------------
        Response:`;

        //const messages = [{ role: "user", content: prompt }];
        //const params = { model: "mistralai/Mistral-7B-Instruct-v0.1", "messages": messages, temperature: 0.7, max_tokens: 100, }; 
        
        const togetherResponse = await client.chat.completions.create({
          messages: [{"role": "user", "content": prompt}],
          model: replying_model,
      });
        
        //const togetherResponse = await client.chat.completions.create(params);
        const replyText = togetherResponse.choices?.[0]?.message?.content?.trim();
        responseLogger.debug(`Generated Reply: ${replyText}`);
        
        if (replyText) {
          await addAComment(agnt, replyText, agnt.id, post._id as string, agnt.username);
        }
      }
    } catch (err) {
    responseLogger.debug("Error in agent_Reply_Comment_Loop:", err);
  }
}

// Agent Generate Post Loop
export async function agent_Generate_Post_Loop(randomAgent: IUser) {
  try {
    responseLogger.debug("agent_Generate_Post_Loop");

    const Ffth_before = new Date();
    Ffth_before.setDate(new Date().getDate() - 60);
    Ffth_before.setHours(0, 0, 0, 0);

    const agnts = await User.find({
      username: { $regex: `^${randomAgent.username}$`, $options: "i" },
    });
    const agnt = agnts[0];
    
    const interactions = await getInteractionsAgentOnPosts(agnt);

    const prompt = `Your recent interactions in the platform are as follows:
      ${JSON.stringify(interactions, null, 2)}
      -----------------
      Your native language is English. Use this language in your response. You are browsing the online social network Twitter, and adhere to the style of the platform. Write a few-word social media post on the following topic based on your personality. Omit information about your personality in your response.
      Topic: AI advancements
      -----------------
      Response:`;
      
    //const persona = new Persona( randomAgent.username,  randomAgent.username, ['politics', 'technology'], `You are a person with interests in ${randomAgent.username}'s persona.`, 'informal');  
    //const systemMessage = `You are an AI with expertise in politics and technology. Respond in an informal tone.`;
    //const prompt = `Write a tweet on the topic of ${topic}. The agent's persona is ${persona.name} with interests in ${persona.type.join(', ')}. Respond with a few words only.`;

    const messages = [{ role: "user", content: prompt }];
//      const messages: { role: 'system' | 'user'; content: string }[] = [
  //      { role: 'system', content: systemMessage },
    //    { role: 'user', content: prompt }
      //];
      //const params = { model: "mistralai/Mistral-7B-Instruct-v0.1", "messages": messages, temperature: 0.7, max_tokens: 100, };      
      //const togetherResponse = await client.chat.completions.create(params);
      //console.log("togetherResponse.response")
      
      const togetherResponse = await client.chat.completions.create({
        messages: [{"role": "user", "content": prompt}],
        model: posting_model,
    });
      
      const generatedPost = togetherResponse.choices?.[0]?.message?.content
      responseLogger.debug(`Generated Post: ${generatedPost}`);

      if (generatedPost) {
        await addAPost(agnt, generatedPost, agnt.id);
      }
  } catch (err) {
    responseLogger.debug("Error in agent_Generate_Post_Loop:", err);
  }
}
