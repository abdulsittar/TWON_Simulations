// src/services/simulationService.ts
import { User, IUser  } from "../models/user/user.model";
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

const model = process.env.model;
const provider = process.env.provider;
const topic = process.env.topic;
//const num_of_loops = process.env.num_of_loops;
//num_of_loops = parseInt(num_of_loops, 10);
const totalAgents = process.env.num_of_agents;
//totalAgents= parseInt(totalAgents, 10);
//var agents = allagents.slice(0, totalAgents);

const num_of_loops = 10;  
var agents = [User];

export class SimulationService {
  private static io: SocketServer;
    
  static initialize(ioInstance: SocketServer): void {
    this.io = ioInstance;
  }

  static async runSimulation(): Promise<void> {
    const agents = await User.find().populate('timeBudget');

    if (agents.length === 0) {
      responseLogger.info("No agents to simulate.");
      return;
    }
    
    agents.forEach(agent => {
        agent.logger = new SimpleLogger();
        agent.actor = new DefaultActor();
      });

      try {
        for (let i = 0; i < num_of_loops; i++) {
          const randomIndex = getRandomInt(0, agents.length - 1);
          const randomAgent = agents[randomIndex];
          randomAgent.activateAgent();
    
          const randomAction = getRandomInt(0, 3);
          responseLogger.info(`Action ${i}!`);
          responseLogger.info(`Random Action ${randomAction}!`);
          responseLogger.info(`Random Agent: ${JSON.stringify(randomAgent)}!`);
    
          switch (randomAction) {
            case 0:
              await agent_Generate_Post_Loop(randomAgent);
              
              /*var chartData = agents.map((user, index) => {
                const totalTime1 = user.timeBudget && user.timeBudget.totalTime !== undefined ? Math.floor(Math.random() * 101) : 20; 
                return {name: user.username,  visit: totalTime1 } });
              const response1 = {color: "#FF8042", title: "Total Time", dataKey: "visit", chartData, };
              this.io.emit('timebudget_totaltime', { response1 });
              
              
              chartData  = agents.map((user, index) => {
                const totalTime2 = user.timeBudget && user.timeBudget.replenishRate !== undefined ? Math.floor(Math.random() * 101) : 20;  
                return {  name: user.username,  visit: totalTime2  } });
              const response2 = { color: "#FF8042", title: "Replenish Rate", dataKey: "visit", chartData, };
              this.io.emit('timebudget_replenish', { response2 });
              
              
              chartData  = agents.map((user, index) => {
                const totalTime = user.timeBudget && user.timeBudget.usedTime !== undefined ? Math.floor(Math.random() * 101) : 20; 
                return {  name: user.username,  visit: totalTime } });
              const response3 = { color: "#FF8042", title: "Used Time",  dataKey: "visit", chartData,};
              this.io.emit('timebudget_usedtime', { response3 });*/
                            
              break;
    
            case 1:
              await agent_Generate_Post_Loop(randomAgent);
              
              
              break;
    
            case 2:
              await agent_Generate_Post_Loop(randomAgent);
              
              
              break;
    
            case 3:
              responseLogger.info(randomAgent);
              await agent_Generate_Post_Loop(randomAgent);
              
              
              break;
    
            default:
              responseLogger.info("Invalid action choice.");
              
              
              break;
          }
        }
      } catch (error) {
        responseLogger.info(`Scheduler App Error: ${error}`);
      }
    for (let timeStep = 0; timeStep < 10; timeStep++) {
      responseLogger.info(`Running simulation for time step: ${timeStep}`);
       
      await delayedFunction(); // Delay of 1 second
    }

    responseLogger.info("Simulation completed!");
  }

  static async runSimulation2(): Promise<void> {
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

export async function getFollowingsAndFollowers(agentUserId: string): Promise<Array<any>> {
  try {
    responseLogger.info("Executing getFollowingsAndFollowers function");
    responseLogger.info(`Agent User ID: ${agentUserId}`);

    // Fetch user from database by ID
    const user = await User.findById(agentUserId).populate("followings followers");

    if (!user) {
      responseLogger.error("User not found");
      return [];
    }

    // Get the list of followings and followers
    const followings = user.followings || [];
    const followers = user.followers || [];

    responseLogger.info(`Followings count: ${followings.length}`);
    responseLogger.info(`Followers count: ${followers.length}`);

    // Combine followings and followers into a single array
    const combinedUsers = [...followings, ...followers];

    responseLogger.info(`Total combined users (Followings + Followers): ${combinedUsers.length}`);

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

  return postsReq;
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


export async function addAPost(desc: string, userId: string, img?: string): Promise<void> {
  if (desc.length > 0) {
    const post = new Post({
      desc,
      userId,
      img,
      rank: 1000.0,
      pool: "0",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    try {
      await post.save();
      responseLogger.info("The post has been added");
    } catch (err) {
      responseLogger.info(err);
    }
  }
}

// Like a post
export async function likeAPost(userId: string, postId: string): Promise<void> {
  try {
    const post = await Post.findById(postId)
      .populate([
        { path: "likes", match: { userId } },
        { path: "dislikes", match: { userId } },
      ])
      .exec();

    if (!post) return;

    const isAlreadyLiked = post.likes && post.likes.length > 0;
    const isAlreadyDisliked = post.dislikes && post.dislikes.length > 0;

    if (isAlreadyLiked) {
      const likeId = post.likes[0]._id;
      await Post.findByIdAndUpdate(postId, { $pull: { likes: likeId } });
      await PostLike.findByIdAndDelete(likeId);
      responseLogger.info("Removed like from post");
    } else if (isAlreadyDisliked) {
      const dislikeId = post.dislikes[0]._id;
      await Post.findByIdAndUpdate(postId, { $pull: { dislikes: dislikeId } });
      await PostDislike.findByIdAndDelete(dislikeId);
      responseLogger.info("Removed dislike from post");
    }

    if (!isAlreadyLiked) {
      const newLike = new PostLike({ userId, postId });
      await newLike.save();
      await Post.findByIdAndUpdate(postId, { $push: { likes: newLike._id } });
      responseLogger.info("Added like to post");
    }
  } catch (err) {
    responseLogger.info(err);
  }
}

// Dislike a post
export async function dislikeAPost(userId: string, postId: string): Promise<void> {
  try {
    const post = await Post.findById(postId)
      .populate([
        { path: "likes", match: { userId } },
        { path: "dislikes", match: { userId } },
      ])
      .exec();

    if (!post) return;

    const isAlreadyLiked = post.likes && post.likes.length > 0;
    const isAlreadyDisliked = post.dislikes && post.dislikes.length > 0;

    if (isAlreadyLiked) {
      const likeId = post.likes[0]._id;
      await Post.findByIdAndUpdate(postId, { $pull: { likes: likeId } });
      await PostLike.findByIdAndDelete(likeId);
      responseLogger.info("Removed like from post");
    } else if (isAlreadyDisliked) {
      const dislikeId = post.dislikes[0]._id;
      await Post.findByIdAndUpdate(postId, { $pull: { dislikes: dislikeId } });
      await PostDislike.findByIdAndDelete(dislikeId);
      responseLogger.info("Removed dislike from post");
    }

    if (!isAlreadyDisliked) {
      const newDislike = new PostDislike({ userId, postId });
      await newDislike.save();
      await Post.findByIdAndUpdate(postId, { $push: { dislikes: newDislike._id } });
      responseLogger.info("Added dislike to post");
    }
  } catch (err) {
    responseLogger.info(err);
  }
}


// Add a comment
export async function addAComment(desc: string, userId: string, postId: string, username: string): Promise<void> {
  if (desc.length > 0) {
    const comment = new Comment({ body: desc, userId, postId, username });

    try {
      await comment.save();
      const post = await Post.findById(postId);
      if (post) {
        await post.updateOne({ $push: { comments: comment._id } });
      }
      responseLogger.info("The comment has been added");
    } catch (err) {
      responseLogger.info(err);
    }
  }
}

// Like a comment
export async function likeAComment(userId: string, commentId: string): Promise<void> {
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
      responseLogger.info("Removed like from comment");
    } else if (isAlreadyDisliked) {
      const dislikeId = comment.dislikes[0];
      await Comment.findByIdAndUpdate(commentId, { $pull: { dislikes: dislikeId } });
      await CommentDislike.findByIdAndDelete(dislikeId);
      responseLogger.info("Removed dislike from comment");
    }

    if (!isAlreadyLiked) {
      const newLike = new CommentLike({ userId, commentId });
      await newLike.save();
      await Comment.findByIdAndUpdate(commentId, { $push: { likes: newLike._id } });
      responseLogger.info("Added like to comment");
    }
  } catch (err) {
    responseLogger.info(err);
  }
}

// Dislike a comment
export async function dislikeAComment(userId: string, commentId: string): Promise<void> {
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
      responseLogger.info("Removed like from comment");
    } else if (isAlreadyDisliked) {
      const dislikeId = comment.dislikes[0];
      await Comment.findByIdAndUpdate(commentId, { $pull: { dislikes: dislikeId } });
      await CommentDislike.findByIdAndDelete(dislikeId);
      responseLogger.info("Removed dislike from comment");
    }

    if (!isAlreadyDisliked) {
      const newDislike = new CommentDislike({ userId, commentId });
      await newDislike.save();
      await Comment.findByIdAndUpdate(commentId, { $push: { dislikes: newDislike._id } });
      responseLogger.info("Added dislike to comment");
    }
  } catch (err) {
    responseLogger.info(err);
  }
}

// Repost a post
export async function repostAPost(userId: string, postId: string): Promise<void> {
  try {
    const repost = new Repost({ userId, postId });
    await repost.save();
    await Post.findByIdAndUpdate(postId, { $push: { reposts: repost._id } });
    responseLogger.info("Post reposted successfully");
  } catch (err) {
    responseLogger.info(err);
  }
}

// Mark a post as read
export async function markPostAsRead(userId: string, postId: string): Promise<void> {
  try {
    const readEntry = await Readpost.findOne({ userId, postId });
    if (!readEntry) {
      const newReadPost = new Readpost({ userId, postId });
      await newReadPost.save();
      responseLogger.info("Post marked as read");
    } else {
      responseLogger.info("Post already marked as read");
    }
  } catch (err) {
    responseLogger.info(err);
  }
}

// Agent Like Comment Loop
export async function agent_Like_Comment_Loop(randomAgent: IUser) {
  try {
    responseLogger.info("agent_Like_Comment_Loop");

    const today = new Date();
    const Ffth_before = new Date();
    Ffth_before.setDate(today.getDate() - 30);
    Ffth_before.setHours(0, 0, 0, 0);

    responseLogger.info(randomAgent);

    const agnts = await User.find({ username: randomAgent["username"] });
    const agnt = Array.isArray(agnts) ? agnts[0] : agnts;

    const allfofo = await getFollowingsAndFollowers(agnt._id);
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
      responseLogger.info(res);

      if (res.response) {
        await likeAComment(agnt._id, comment._id.toString());
      }
    }
  } catch (err) {
    responseLogger.info("Error in agent_Like_Comment_Loop:", err);
  }
}

// Agent Like Post Loop
export async function agent_Like_Post_Loop(randomAgent: IUser) {
  try {
    responseLogger.info("agent_Like_Post_Loop");

    const today = new Date();
    const Ffth_before = new Date();
    Ffth_before.setDate(today.getDate() - 30);
    Ffth_before.setHours(0, 0, 0, 0);

    const agnts = await User.find({ username: randomAgent["username"] });
    const agnt = Array.isArray(agnts) ? agnts[0] : agnts;

    const allfofo = await getFollowingsAndFollowers(agnt._id);
    const posts = await Post.find({ userId: { $in: allfofo } })
      .populate({ path: "comments", model: "Comment" })
      .sort({ rank: -1 })
      .limit(1);

    for (const post of posts) {
      const usr = await User.findById(post.userId) ;
      if (!usr) {
        throw new Error(`User with ID ${post.userId} not found`);
      }
      
      const interactions = await getInteractionsAgentOnPosts(agnt);

      const payload = {
        post: { author: usr.username, message: post.desc },
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
      responseLogger.info(res);

      if (res.response) {
        await likeAPost(agnt._id, post._id);
      }
    }
  } catch (err) {
    responseLogger.info("Error in agent_Like_Post_Loop:", err);
  }
}

// Agent Reply Comment Loop
export async function agent_Reply_Comment_Loop(randomAgent: IUser) {
  try {
    responseLogger.info("agent_Reply_Comment_Loop");

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
      const thread = await getThreadAgentOnComments(agnt);

      const payload = {
        history: { interactions },
        integration: { model, provider },
        language: "English",
        length: "few-word",
        persona: [randomAgent.persona],
        platform: "Twitter",
        thread,
      };

      const response = await fetch(`${process.env.AGENTS_URL}reply/`, {
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: JSON.stringify(payload),
      });

      const res = await response.json();
      responseLogger.info(res);

      if (res.response) {
        await addAComment(res.response, agnt.id, post._id, agnt.username);
      }
    }
  } catch (err) {
    responseLogger.info("Error in agent_Reply_Comment_Loop:", err);
  }
}

// Agent Generate Post Loop
export async function agent_Generate_Post_Loop(randomAgent: IUser) {
  try {
    responseLogger.info("agent_Generate_Post_Loop");

    const Ffth_before = new Date();
    Ffth_before.setDate(new Date().getDate() - 60);
    Ffth_before.setHours(0, 0, 0, 0);

    const agnts = await User.find({
      username: { $regex: `^${randomAgent.username}$`, $options: "i" },
    });
    const agnt = agnts[0];

    if (agnt) {
      const allfofo = await getFollowingsAndFollowers(agnt._id);
      const interactions = await getInteractionsAgentOnComments(agnt);

      const payload = {
        history: { interactions },
        integration: { model, provider },
        language: "English",
        length: "few-word",
        persona: [randomAgent.persona],
        platform: "Twitter",
        topic,
      };

      const response = await fetch(`${process.env.AGENTS_URL}generate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: JSON.stringify(payload),
      });

      const res = await response.json();
      responseLogger.info(res);

      if (res.response) {
        await addAPost(res.response, agnt.id);
      }
    }
  } catch (err) {
    responseLogger.info("Error in agent_Generate_Post_Loop:", err);
  }
}
