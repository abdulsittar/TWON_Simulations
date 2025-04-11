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
import { SimulationService } from "./simulationService";

import { Integration } from "../Serving_Agents/Agents/integration";  
import { Persona } from "../Serving_Agents/Agents/persona";  
import { Response } from "../Serving_Agents/Agents/response";  
import { Together } from 'together-ai';
import { Actions } from "../models/content/actions.model";
import { IntAct } from "../models/content/interAna.model";
import { TimeBudgetAnalytics } from "../models/content/timebudgetAna.model";
import { MotivationAnalytics } from "../models/content/motAnalytics.model";

import { IPost } from "../models/content/post.model"; // Assuming IPost interface is imported correctly
import { IPostLike } from "../models/content/postLike.model"; // Assuming IPostLike interface is imported correctly
import { IPostDislike } from "../models/content/postDislike.model"; // Assuming IPostDislike interface is imported correctly
import { fetchAndRankPosts } from './ranker';
import connectDB from "../config/db";

import * as dotenv from "dotenv";
import { userInfo } from "os";
import e from "express";
import { agent } from "supertest";

dotenv.config();

const apiKey = process.env.TOGETHER_API_KEY;

if (!apiKey) {
  console.error('API Key is missing!');
  process.exit(1);   
}

//const together = new Together({ apiKey });
//const together = new Together({ apiKey });
//const together = new Together(apiKey);

//let together: any;


// Check if we're in the test environment
const isTestEnvironment = process.env.NODE_ENV === 'test';

let k: string | { apiKey: string };
//let together: Together; // Define the type of together

if (isTestEnvironment) {
  k = apiKey; // Pass as string
} else {
  k = { apiKey }; // Pass as object
}

// Check type and pass the correct value to the constructor
/*if (typeof k === 'string') {
  together = new Together(k); // Pass string if k is a string
} else {
  together = new Together(k.apiKey); // Pass string from k.apiKey if k is an object
}*/

const together = new Together({ apiKey });



//const together = new Together(apiKey); 
 
const model = process.env.model;
const provider = process.env.provider;
const topic = process.env.topic;
//const num_of_loops = process.env.num_of_loops;
//num_of_loops = parseInt(num_of_loops, 10);
const totalAgents = process.env.num_of_agents;
//totalAgents= parseInt(totalAgents, 10);
//var agents = allagents.slice(0, totalAgents);
const posting_model = "abdulsittar72/TWON-Agent-OSN-Post-en"; 
const replying_model = "abdulsittar72/TWON-Agent-OSN-Replies-en";

export const performAgentAction = async (agent: IUser, actionType: number, post?: IPost) => {
  let actionName = "";
  let postId = null;
  var startTime = 0;
  var endTime = 0;
  startTime = performance.now();
  await fetchAndRankPosts();
  endTime = performance.now(); 
  responseLogger.info(`fetchAndRankPosts --- Execution time: ${(endTime - startTime) / 1000} seconds`);
  switch (actionType) {
    case 0: 
      startTime = performance.now(); 
      await agent_Generate_Post_Loop(agent);  
      actionName = "post"; 
      endTime = performance.now(); 
      //responseLogger.info(`agent_Generate_Post_Loop --- Execution time: ${(endTime - startTime) / 1000} seconds`); 
      break;
      
    case 1: 
          const posId = ""; 
          startTime = performance.now(); 
          
          //if (post) {
            postId = await agent_Reply_Comment_Loop(agent);//, post._id as mongoose.Types.ObjectId); 
            actionName = "comment"; 
            endTime = performance.now(); 
            console.log(`Performing action with post:`, post);
       // } else {
            // Handle the case where no post is provided
         //   console.log(`Performing action without a post`);
          //}
          //responseLogger.info(`agent_Reply_Comment_Loop --- Execution time: ${(endTime - startTime) / 1000} seconds`); 
          break;
      
    case 2: startTime = performance.now(); postId = await agent_Like_Post_Loop(agent); actionName = "like"; endTime = performance.now(); responseLogger.info(`agent_Like_Post_Loop --- Execution time: ${(endTime - startTime) / 1000} seconds`); break;
    case 3: startTime = performance.now(); postId = await agent_Dislike_Post_Loop(agent); actionName = "dislike"; endTime = performance.now(); responseLogger.info(`agent_Dislike_Post_Loop --- Execution time: ${(endTime - startTime) / 1000} seconds`); break;
    default: console.error("Invalid action type");
  }
  //await saveUserAction(agent.username, actionName, postId);
  
};

const saveUserAction = async (username: string, actionNo: string, postId: string | null | undefined) => {
  responseLogger.info(`Final 1111 ${actionNo} ${postId ? `on post ${postId}` : ''}`);
  try {
    const today = new Date().setHours(0, 0, 0, 0);
    let analytics = await Actions.findOne({ date: today });

    if (!analytics) {
      analytics = new Actions({
        date: today,
        userActions: [],
      });
    }

    // Handle postId: convert to ObjectId if string, otherwise leave as null
    //let objectIdField: any = null;  // objectIdField will now be structured as required
    //if (postId) {
    //  objectIdField = { type: mongoose.Types.ObjectId, ref: 'Post', required: false, default: null, value: new mongoose.Types.ObjectId(postId) };
   // }

    // Push structured objectIdField to userActions
    analytics.userActions.push({
      time: Date.now(),
      user: username,
      action:actionNo,
      postId: null,  // Assign structured ObjectId field
    });

    await analytics.save();
    responseLogger.info(`User action logged: ${username} ${actionNo} ${postId ? `on post ${postId}` : ''}`);
  } catch (error) {
    responseLogger.error(`Error logging user action for ${username}: ${error}`);
  }
};


const saveUserMotivation = async (username: string, motivation: number) => {
  try {
    const today = new Date().setHours(0, 0, 0, 0);
    let analytics = await MotivationAnalytics.findOne({ date: today });

    if (!analytics) {
      analytics = new MotivationAnalytics({
        date: today,
        timebudget: [],
      });
    }

    // Push structured objectIdField to userActions
    analytics.timebudget.push({
      time: Date.now(),
      user: username,
      motivation,
    });

    await analytics.save();
    responseLogger.info(`User action logged: ${username} ${motivation}`);
  } catch (error) {
    responseLogger.error(`Error logging user action for ${username}: ${error}`);
  }
};


const saveUserTimeBudget = async (username: string, total: number) => {
  try {
    const today = new Date().setHours(0, 0, 0, 0);
    let analytics = await TimeBudgetAnalytics.findOne({ date: today });

    if (!analytics) {
      analytics = new TimeBudgetAnalytics({
        date: today,
        timebudget: [],
      });
    }

    // Push structured objectIdField to userActions
    analytics.timebudget.push({
      time: Date.now(),
      user: username,
      total,
    });

    await analytics.save();
    responseLogger.info(`User action logged: ${username} ${total}`);
  } catch (error) {
    responseLogger.error(`Error logging user action for ${username}: ${error}`);
  }
};

// ===========================
//  Agent Actions on Posts
// ===========================

// Generate a Post
export async function agent_Generate_Post_Loop(randomAgent: IUser) {
    try {
      responseLogger.info('agent_Generate_Post_Loop');
  
      const agnts = await User.find({
        username: { $regex: `^${randomAgent.username}$`, $options: "i" },
      });
      const agnt = agnts[0];
      let persona = "You are a social media user with a political neutral leaning. Post a Tweet about the following topic:";
      
      const interactions = await getInteractionsAgentOnPosts(agnt);
      const thread = await getThreadAgentOnComments(agnt);
      let prompt = `${topic}
        ${JSON.stringify(persona, null, 2)}
        -----------------`;
        
        if (interactions.length > 0) {
            prompt += `\nYour recent interactions on the platform are as follows:
            ${JSON.stringify(interactions, null, 2)}
            -----------------`;
        }
        
        prompt += `\nYour native language is English. Use this language in your response. You are browsing the online social network Twitter and adhere to the style of the platform. Write a few-word social media post on the following topic based on your personality.`;
        
        if (thread.length > 0) {
            prompt += `\n-----------------\nYou are on Twitter. Engage naturally in the conversation by responding concisely to the following thread based on your personality.\nThread: ${JSON.stringify(thread, null, 2)}\n-----------------`;
        }
        
        prompt += `\nResponse:`;
  
      //const messages = [{ role: "user", content: prompt }];
      //const params = { model: "mistralai/Mistral-7B-Instruct-v0.1", messages, temperature: 0.7, max_tokens: 100 };
  
  
  
      const generatedPost = await together.chat.completions.create({
        messages: [{"role": "system", "content": persona}, {"role": "user", "content": prompt}],
        model: posting_model,
    });
  
      //const togetherResponse = await client.chat.completions.create(params);
      const reply = generatedPost.choices?.[0]?.message?.content?.trim();
  
      //responseLogger.info(`Generated Post: ${reply}`);
      
      //responseLogger.info({ Post: generatedPost.choices[0].message.content});
    
      responseLogger.debug({ 
        agentId: agnt.id,
        username: agnt.username,
        persona,
        interactions,
        thread,
        prompt,
        model: posting_model,
        generated_post: generatedPost
    });
      
      
  
      if (reply) {
        await addAPost(agnt, reply, agnt.id);
      }else{
        await SimulationService.updateTimeBudget(agnt, 20);
        const timeBudget = await TimeBudget.findById(agnt.timeBudget);
  
      if (!timeBudget) {
        responseLogger.warn(`TimeBudget not found for agent ${agnt.username}.`);
        return;
      }

      await saveUserTimeBudget(agnt.username, timeBudget.totalTime);
      }
    } catch (err) {
      responseLogger.error("Error in agent_Generate_Post_Loop:", err);
    }
  }
  
  // Like a Post
  export async function agent_Like_Post_Loop(randomAgent: IUser) {
    try {
      //responseLogger.info("agent_Like_Post_Loop");
  
      const agnts = await User.find({ username: randomAgent.username });
      const agnt = agnts[0];
  
      const posts = await Post.find()
        .populate({ path: "comments", model: "Comment" })
        .sort({ rank: -1 })
        .limit(1);
  
      for (const post of posts) {
        const usr = await User.findById(post.userId);
        if (!usr) throw new Error(`User with ID ${post.userId} not found`);
  
        let persona = 'You are a social media user with a political neutral leaning. Reply only with "false" or "true"';
        
        const interactions = await getInteractionsAgentOnPosts(agnt);
        
        let prompt = `Your native language is English. You are browsing Twitter. Decide whether to like this post based on your personality.
          Post: ${post.desc}`;
          
          if (interactions.length > 0) {
            prompt += `\nYour recent interactions on the platform are as follows:
            ${JSON.stringify(interactions, null, 2)}
            -----------------`;
        }
        prompt += `Response:`;
  
        const messages = [{ role: "user", content: prompt }];
        const params = { model: posting_model, messages, temperature: 0.7, max_tokens: 100 };
  
        //const togetherResponse = await together.chat.completions.create({
        //  messages: [{"role": "system", "content": persona}, {"role": "user", "content": prompt}],
       //   model: replying_model,
     // });
      
      const randomNumber = Math.floor(Math.random() * 2);
  
      //const togetherResponse = await together.chat.completions.create({params});
      //const decision = togetherResponse.choices?.[0]?.message?.content?.trim();

      let decision;
      if (randomNumber == 0) {decision = "true"}
      else if (randomNumber) {decision = "false"}


      responseLogger.info({ Like: decision});
      responseLogger.info(`Like Decision: ${decision}`);
  
        responseLogger.debug({ 
          agentId: agnt.id,
          username: agnt.username,
          persona,
          interactions,
          prompt,
          model: replying_model,
          Like: decision
      });
        //responseLogger.info(`Like Decision: ${decision}`);
  
        if (decision === "true") {
          await likeAPost(agnt, agnt._id as unknown as string, post._id as string);
          return post._id.toString();
        }else{
          await SimulationService.updateMotivation(post.postedBy, 2);
          await saveUserMotivation(agnt.username, agnt.motivation);
          await SimulationService.updateTimeBudget(agnt, 5);
          
          const timeBudget = await TimeBudget.findById(agnt.timeBudget);
  
      if (!timeBudget) {
        responseLogger.warn(`TimeBudget not found for agent ${agnt.username}.`);
        return;
      }

      await saveUserTimeBudget(agnt.username, timeBudget.totalTime);
        }
        //if (decision === "false") {
        //  await dislikeAPost(agnt, agnt._id as unknown as string, post._id as string);
        //}
      }
    } catch (err) {
      responseLogger.info("Error in agent_Like_Post_Loop:", err);
    }
    return null;
  }
  
  // Dislike a Post
  export async function agent_Dislike_Post_Loop(randomAgent: IUser) {
    try {
      //responseLogger.debug("agent_Dislike_Post_Loop");
  
      const agnts = await User.find({ username: randomAgent.username });
      const agnt = agnts[0];
  
      const posts = await Post.find()
        .populate({ path: "comments", model: "Comment" })
        .sort({ rank: -1 })
        .limit(1);
  
      for (const post of posts) {
        const usr = await User.findById(post.userId);
        if (!usr) throw new Error(`User with ID ${post.userId} not found`);
  
  
        let persona = 'You are a social media user with a political neutral leaning. Reply only with "false" or "true"';
        
        const interactions = await getInteractionsAgentOnPosts(agnt);
        
        let prompt = `Your native language is English. You are browsing Twitter. Decide whether to dislike this post based on your personality.
          Post: ${post.desc}`;
          
          if (interactions.length > 0) {
            prompt += `\nYour recent interactions on the platform are as follows:
            ${JSON.stringify(interactions, null, 2)}
            -----------------`;
        }
        prompt += `Response:`;
  
        //const messages = [{ role: "user", content: prompt }];
        //const params = { model: "mistralai/Mistral-7B-Instruct-v0.1", messages, temperature: 0.7, max_tokens: 100 };
        
         //const togetherResponse = await together.chat.completions.create({
        //  messages: [{"role": "system", "content": persona}, {"role": "user", "content": prompt}],
       //   model: replying_model,
     // });
      
      const randomNumber = Math.floor(Math.random() * 2);
  
      //const togetherResponse = await together.chat.completions.create({params});
      //const decision = togetherResponse.choices?.[0]?.message?.content?.trim();

      let decision;
      if (randomNumber == 0) {decision = "true"}
      else if (randomNumber) {decision = "false"}


      responseLogger.info({ Like: decision});
      responseLogger.info(`Like Decision: ${decision}`);
  
        responseLogger.debug({ 
          agentId: agnt.id,
          username: agnt.username,
          persona,
          interactions,
          prompt,
          model: replying_model,
          Like: decision
      });
      
        //responseLogger.debug(`Dislike Decision: ${decision}`);
  
        if (decision === "true") {
          await dislikeAPost(agnt, agnt._id as unknown as string, post._id as string);
          return post._id.toString();
        }else{
          await SimulationService.updateMotivation(post.postedBy, -2);
          await saveUserMotivation(agnt.username, agnt.motivation);
          await SimulationService.updateTimeBudget(agnt, 5);
          const timeBudget = await TimeBudget.findById(agnt.timeBudget);
  
      if (!timeBudget) {
        responseLogger.warn(`TimeBudget not found for agent ${agnt.username}.`);
        return;
      }

      await saveUserTimeBudget(agnt.username, timeBudget.totalTime);
        }
      }
    } catch (err) {
      responseLogger.error("Error in agent_Dislike_Post_Loop:", err);
    }
    return null;
  }
  
  // ===========================
  //  Agent Actions on Comments
  // ===========================
  
  // Reply to a Comment
  export async function agent_Reply_Comment_Loop(randomAgent: IUser){//, postId: mongoose.Types.ObjectId) {
    try {
      //responseLogger.debug("agent_Reply_Comment_Loop");
  
      const agnts = await User.find({ username: randomAgent.username });
      const agnt = agnts[0];
      let persona = "You are a social media user with a political neutral leaning. Respond to the following Tweet:";
      
      let post = await Post.find()//postId: postId })
      .populate({ path: "comments", model: "Comment" })
      .sort({ rank: -1 });
  
      if (post.length === 0) {
        const fallbackPost = await Post.findOne()  // Find the first post
          .populate({ path: "comments", model: "Comment" })
          .sort({ rank: -1 });
      
        // If fallbackPost is found, wrap it in an array
        post = fallbackPost ? [fallbackPost] : [];
      }
  
      if (!post) throw new Error("Post not found");
  
      const interactions = await getInteractionsAgentOnComments(agnt);
      const thread = await getThreadAgentOnComments(agnt);   
        let prompt = `\nYour native language is English. Use this language in your response. You are browsing the online social network Twitter and adhere to the style of the platform. Write a few-word social media post on the following topic based on your personality.`;
        
        
        if (interactions.length > 0) {
            prompt += `\nYour recent interactions on the platform are as follows:
            ${JSON.stringify(interactions, null, 2)}
            -----------------`;
        }
      
        if (thread.length > 0) {
            prompt += `You are on Twitter. Engage naturally in the conversation by responding concisely to the following thread based on your personality.\nThread: ${JSON.stringify(thread, null, 2)}\n-----------------`;
        }
        
        prompt += `\nResponse:`;
  
      //const messages = [{ role: "user", content: prompt }];
      //const params = { model: "mistralai/Mistral-7B-Instruct-v0.1", messages, temperature: 0.7, max_tokens: 100 };
  
      const togetherResponse = await together.chat.completions.create({
        messages: [{"role": "system", "content": prompt}, {"role": "user", "content": persona}],
        model: replying_model,
    });
  
      //const togetherResponse = await together.chat.completions.create({params});
      const replyText = togetherResponse.choices?.[0]?.message?.content?.trim();
      responseLogger.info('Dislike: decision');
      responseLogger.info({ Comment: replyText});
  
      responseLogger.debug({ 
        agentId: agnt.id,
        username: agnt.username,
        persona,
        interactions,
        thread,
        prompt,
        model: replying_model,
        generated_post: replyText
    });
  
      //responseLogger.debug(`Generated Reply: ${replyText}`);
  
      if (replyText) {
        const post1 = post[0];
        await addAComment(agnt, replyText, agnt.id, post1._id.toString(), agnt.username);
        return post1._id.toString();
      }else{
        await SimulationService.updateTimeBudget(agnt, 20);
        const timeBudget = await TimeBudget.findById(agnt.timeBudget);
  
      if (!timeBudget) {
        responseLogger.warn(`TimeBudget not found for agent ${agnt.username}.`);
        return;
      }

      await saveUserTimeBudget(agnt.username, timeBudget.totalTime);
      }
    } catch (err) {
      responseLogger.error("Error in agent_Reply_Comment_Loop:", err);
    }
    return null;
  }
  
  // Like a Comment
  export async function agent_Like_Comment_Loop(randomAgent: IUser) {
    try {
      responseLogger.info("agent_Like_Comment_Loop");
  
      const agnts = await User.find({ username: randomAgent.username });
      const agnt = agnts[0];
  
      const allfofo = await getFollowingsAndFollowers(agnt._id as unknown  as string);
      const comments = await Comment.find({ userId: { $in: allfofo } }).limit(1);
  
      for (const comment of comments) {
        const interactions = await getInteractionsAgentOnComments(agnt);
  
        const payload = {
          post: { message: comment.body },
          history: { interactions },
          language: "English",
          platform: "Twitter",
        };
  
        const response = await fetch(`${process.env.AGENTS_URL}like/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
  
        const res = await response.json();
        if (res.response) {
          await likeAComment(agnt, agnt._id as unknown as string, comment._id.toString());
        }
      }
    } catch (err) {
      responseLogger.error("Error in agent_Like_Comment_Loop:", err);
    }
  }
  


/**
 * Fetch followings and followers of a user.
 */
export async function getFollowingsAndFollowers(agentUserId: string): Promise<Array<any>> {
    try {
      responseLogger.info("Executing getFollowingsAndFollowers function");
      responseLogger.info(`Agent User ID: ${agentUserId}`);
  
      const user = await User.findById(agentUserId).populate("followings followers");
      if (!user) {
        responseLogger.error("User not found");
        return [];
      }
      
      const combinedUsers = [...(user.followings || []), ...(user.followers || [])];
      responseLogger.info(`Total combined users (Followings + Followers): ${combinedUsers.length}`);
      return combinedUsers;
    } catch (error) {
      responseLogger.error(`Error in getFollowingsAndFollowers: ${error}`);
      throw new Error("An error occurred while fetching followings and followers.");
    }
  }
  
  /**
   * Fetch interactions of an agent on posts.
   */
  export async function getInteractionsAgentOnPosts(agnt: any): Promise<Array<any>> {
    const postsReq: Array<any> = [];
    const start = performance.now();
  
    const posts = await Post.find({ userId: agnt.userId }).sort({ createdAt: -1 }).limit(5).exec();
    posts.forEach(post => postsReq.push({ action: "wrote", message: post.desc }));
  
    const postLikes = await PostLike.find({ userId: agnt.userId }).sort({ createdAt: -1 }).limit(5).exec();
    for (const like of postLikes) {
      const likedPosts = await Post.find({ postId: like.postId });
      likedPosts.forEach(likedPost => postsReq.push({ action: "liked", message: likedPost.desc }));
    }
    const end = performance.now();
    const timeTakenInSeconds = (end - start) / 1000;
    saveInteractionsAna("Took", 5, timeTakenInSeconds)
    
  
    return postsReq;
  }
  
  /**
   * Fetch interactions of an agent on comments.
   */
  export async function getInteractionsAgentOnComments(agnt: any): Promise<Array<any>> {
    const postsReq: Array<any> = [];
  
    const comments = await Comment.find({ userId: agnt._id }).sort({ createdAt: -1 }).limit(5).exec();
    comments.forEach(comment => postsReq.push({ action: "wrote", message: comment.body }));
  
    const commentLikes = await CommentLike.find({ userId: agnt._id }).sort({ createdAt: -1 }).limit(5).exec();
    for (const like of commentLikes) {
      const likedComments = await Comment.find({ _id: like.commentId });
      likedComments.forEach(likedComment => postsReq.push({ action: "liked", message: likedComment.body }));
    }
  
    return postsReq.length <= 2 ? postsReq : [postsReq[0], ...postsReq.slice(-2)];
  }
  
  /**
   * Escape special characters in a string.
   */
  export function addslashes(str: string): string {
    return str.replace(/["']/g, '\\$&').replace(/\u0000/g, '\\0');
  }
  
  /**
   * Fetch the thread of an agent's interactions on comments.
   */
  export async function getThreadAgentOnComments(agnt: any): Promise<any> {
    const start = performance.now();
    const postsThread: any[] = [];
    const postsReq: any[] = [];
  
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 60);
    pastDate.setHours(0, 0, 0, 0);
  
    const query = { userId: agnt.id, createdAt: { $lt: today, $gte: pastDate } };
  
    const posts = await Post.find(query).populate("comments").sort({ rank: 1 }).limit(1).exec();
    for (const post of posts) {
      const postAuthor = await User.findById(post.userId);
      if (postAuthor) {
        post.comments.forEach(comment => postsReq.push({ message: `"${addslashes(comment.body)}"` }));
        if (postsReq.length === 0) postsReq.push({message: `"${addslashes(post.desc)}"` });
      }
    }
  
    const end = performance.now();
    const timeTakenInSeconds = (end - start) / 1000;
    saveInteractionsAna("Took", 5, timeTakenInSeconds)
  
    if (postsReq.length > 0) postsThread.push({ posts: postsReq });
    return postsThread;
  }
  
  
  const saveInteractionsAna = async (username: string, status: number, spendTime: number) => {
    try {
      const today = new Date().setHours(0, 0, 0, 0);
      let analytics = await IntAct.findOne({ date: today });
  
      if (!analytics) {
        analytics = new IntAct({
          date: today,
          userActions: [],
        });
      }
  
      // Push structured objectIdField to userActions
      analytics.interactions.push({
        time: Date.now(),
        spendTime: spendTime,
        user: username,
        status,
      });
  
      await analytics.save();
      responseLogger.info(`User action logged`);
    } catch (error) {
      responseLogger.error(`Error logging user action for ${username}: ${error}`);
    }
  };
  
  /**
   * Generate a random integer between min and max (inclusive).
   */
  export function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  /**
   * Add a new post.
   */
  export async function addAPost(agent: IUser, desc: string, userId: string, img?: string): Promise<void> {
    if (desc.length === 0) return;
  
    const post = new Post({ desc, userId, rank: 1000.0, pool: "0", isPublic: false, postedBy: new mongoose.Types.ObjectId(userId), createdAt: new Date(), updatedAt: new Date() });
    try {
      await post.save();
      responseLogger.info("The post has been added");
      await SimulationService.updateTimeBudget(agent, 20);
      //responseLogger.info(`Final 1111 `);
      await saveUserAction(agent.username, "post", "");
      responseLogger.info("saveUserAction  post");
      const timeBudget = await TimeBudget.findById(agent.timeBudget);
  
      if (!timeBudget) {
        responseLogger.warn(`TimeBudget not found for agent ${agent.username}.`);
        return;
      }

      await saveUserTimeBudget(agent.username, timeBudget.totalTime);
    } catch (err) {
      responseLogger.info(err);
    }
  }
  
  /**
   * Like or dislike a post.
   */
  export async function likeAPost(agent: IUser, userId: string, postId: string): Promise<void> {
    await toggleLikeDislikePost(agent, userId, postId, true);
  }
  
  export async function dislikeAPost(agent: IUser, userId: string, postId: string): Promise<void> {
    await toggleLikeDislikePost(agent, userId, postId, false);
  }
  
  /**
   * Helper function to toggle like/dislike on a post.
   */
  async function toggleLikeDislikePost(agent: IUser, userId: string, postId: string, isLike: boolean) {
    try {
      const post = await Post.findById(postId).populate(["likes", "dislikes"]);
  
      if (!post) return;
  
      // Explicitly define the expected types
      interface ILike {
        _id: string;
        userId: string;
      }
  
      interface IDislike {
        _id: string;
        userId: string;
      }
  
      const likes = post.likes as ILike[] || [];
      const dislikes = post.dislikes as IDislike[] || [];
  
      const oppositeField = isLike ? "dislikes" : "likes";
      const sameField = isLike ? "likes" : "dislikes";
      const Model = isLike ? PostLike : PostDislike;
      const valueChange = isLike ? 2 : -2;
  
      const existingLike = likes.find(like => like.userId.toString() === userId);
      const existingDislike = dislikes.find(dislike => dislike.userId.toString() === userId);
  
      if (existingLike) {
        await Model.findByIdAndDelete(existingLike._id);
        await Post.findByIdAndUpdate(postId, { $pull: { [sameField]: existingLike._id } });
      } else {
        if (existingDislike) {
          await Model.findByIdAndDelete(existingDislike._id);
          await Post.findByIdAndUpdate(postId, { $pull: { [oppositeField]: existingDislike._id } });
        }
        const newEntry = new Model({ userId, postId, isPublic: false });
        await newEntry.save();
        await Post.findByIdAndUpdate(postId, { $push: { [sameField]: newEntry._id } });
        if (post.postedBy) await SimulationService.updateMotivation(post.postedBy, valueChange);
        await saveUserMotivation(agent.username, agent.motivation);
      }
  
      await SimulationService.updateTimeBudget(agent, 5);
      const timeBudget = await TimeBudget.findById(agent.timeBudget);
  
      if (!timeBudget) {
        responseLogger.warn(`TimeBudget not found for agent ${agent.username}.`);
        return;
      }

      await saveUserTimeBudget(agent.username, timeBudget.totalTime);
    } catch (err) {
      responseLogger.info(err);
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
        responseLogger.info("The comment has been added");
        //responseLogger.info(`Final 1111 `);
        await saveUserAction(agent.username, "comment", postId);
        responseLogger.info("saveUserAction  comment");
        if (post?.postedBy) {
          
          
          try{
            await SimulationService.updateMotivation(post.postedBy, 5);
            await saveUserMotivation(agent.username, agent.motivation);
            } catch (err) {
              responseLogger.info(err);
            }
          
        }else {
          responseLogger.warn(`Post does not have a valid postedBy field.`);
        }
        
        try{
          await SimulationService.updateTimeBudget(agent, 20);
          const timeBudget = await TimeBudget.findById(agent.timeBudget);
  
      if (!timeBudget) {
        responseLogger.warn(`TimeBudget not found for agent ${agent.username}.`);
        return;
      }

      await saveUserTimeBudget(agent.username, timeBudget.totalTime);
          } catch (err) {
            responseLogger.info(err);
          }
        
        
      } catch (err) {
        responseLogger.info(err);
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
  