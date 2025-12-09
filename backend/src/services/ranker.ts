import mongoose from "mongoose";
import dotenv from "dotenv";

// Import models
import { Post, IPost } from "../models/content/post.model";
import { PostLike, IPostLike } from "../models/content/postLike.model";
import { PostDislike, IPostDislike } from "../models/content/postDislike.model";
import { Comment, IComment } from "../models/content/comment.model";
import { CommentLike, ICommentLike } from "../models/content/commentLike.model";
import { CommentDislike, ICommentDislike } from "../models/content/commentDislike.model";
import { Repost } from "../models/content/repost.model";
import  responseLogger  from '../utils/logs/logger';
// Import Ranker components
import { Ranking_Post } from "../ranker/Ranking_Post";
import { Ranker } from "../ranker/Ranker";
import { Decay } from "../ranker/Decay";
import { Engagement } from "../ranker/Engagement";
import { Noise } from "../ranker/Noise";
import { RanAct } from "../models/content/rankAna.model";
//import { Post } from "../Serving_Agents/Agents/models/post";

// Load environment variables
dotenv.config();

//const responseLogger = {
//  log: (...args: unknown[]): void => {
//    console.log(`[responseLogger ${new Date().toISOString()}]`, ...args);
 // },
//};

const getArrayOfValuesComments = (comments: IComment[]): Array<{ id: string, likes: Date[], dislikes: Date[], timestamp: Date }> => {
  return comments.map((comment) => ({
    id: comment._id.toString(),
    // Filter out undefined values after mapping the 'createdAt' property
    likes: (comment.likes as IPostLike[]).map((like) => like.createdAt).filter((date): date is Date => date !== undefined),
    dislikes: (comment.dislikes as IPostDislike[]).map((dislike) => dislike.createdAt).filter((date): date is Date => date !== undefined),
    timestamp: comment.createdAt || new Date(),  // Fallback to current date if undefined
  }));
};

// Helper to convert an array into a record
const arrayToRecord = (array: { _id: string; createdAt: Date }[]): Record<string, { createdAt: Date }> =>
  array.reduce((acc, item) => {
    acc[item._id] = { createdAt: item.createdAt };
    return acc;
  }, {} as Record<string, { createdAt: Date }>);

// Helper to process comments
const processComments = (comments: IComment[]): Array<{ id: string; likes: Date[]; dislikes: Date[]; timestamp: Date }> =>
  comments.map((comment) => ({
    id: comment._id.toString(),
    likes: (comment.likes as { createdAt: Date }[])?.map((like) => like.createdAt) || [],
    dislikes: (comment.dislikes as { createdAt: Date }[])?.map((dislike) => dislike.createdAt) || [],
    timestamp: comment.createdAt || new Date(), // Ensure timestamp is always valid
  }));


  const filteredComments = (comments: { id: string, likes: Date[], dislikes: Date[], timestamp: Date }[]): { id: string, likes: Date[], dislikes: Date[], timestamp: Date }[] => {
    return comments.filter((x) => x != null);
  };

  export const fetchAndRankPosts = async (): Promise<void> => {
    try {
     // const start = performance.now();
      const posts: IPost[] = await Post.find()
        .populate('reposts')
        .populate('likes')
        .populate('dislikes')
        .populate('comments')
        .lean()
        .exec(); 
        
      responseLogger.info("Ranked total posts", posts.length);
      responseLogger.info(posts.length);
        
      const items: Ranking_Post[] = posts.map((post) => {
        // Ensure reposts, likes, and dislikes are typed correctly
        const reposts = post.reposts as { createdAt: Date }[];
        const likes = post.likes as { createdAt: Date }[];
        const dislikes = post.dislikes as { createdAt: Date }[]; 
        const commentsTimestamp = post.comments.map((comment) => comment.createdAt ?? new Date());
        const commentsLikes = post.comments.flatMap((comment) => 
          Array.isArray(comment.likes) ? comment.likes.map((like) => (like as ICommentLike).createdAt).filter((createdAt) => createdAt instanceof Date) : []
        );
        const commentsDislikes = post.comments.flatMap((comment) => 
          Array.isArray(comment.dislikes) ? comment.dislikes.map((dislike) => (dislike as ICommentDislike).createdAt).filter((createdAt) => createdAt instanceof Date) : []
        ); 
        if (!post.createdAt) {
          throw new Error('Post createdAt is undefined. Ensure this field is populated in your database.');
        } 
        const timestamp: Date = post.createdAt;
        const comments: IComment[] = post.comments.map((comment) => ({
          createdAt: comment.createdAt ?? new Date(),  
        }) as IComment); 
        return {
          id: post._id.toString(),
          reposts: reposts.map((r) => r.createdAt), // Map to an array of Date[]
          likes: likes.map((l) => l.createdAt), // Map to an array of Date[]
          dislikes: dislikes.map((d) => d.createdAt),
          timestamp, // Ensure this is always a Date
          comments:commentsTimestamp, // Ensure this is a Date[]
          commentsLikes, // Now this is a Date[] (filtered)
          commentsDislikes, // Now this is a Date[] (filtered)
        };
      }); 
      let mode : 'random' | 'chronological' | 'ranked' = 'ranked'; // or dynamically assigned value
      const rankingPayload = {
        items,
        weights: { likes: 1.0, dislikes: 1.0, reposts: 1.0, comments: 1.0, commentsLikes: 1.0, commentsDislikes: 1.0 },
        engagement: new Engagement('count_based', false),
        noise: new Noise(0.6, 1.4),
        decay: new Decay(0.2, 3 * 24 * 60 * 60), // Decay with 3 days in seconds
        referenceDatetime: new Date(),
        mode: mode, // Dynamically assigned, but still one of the allowed values
      };
  
    const start = performance.now();
    const ranker = new Ranker(); 
    const response = ranker.rank(rankingPayload);
    
    const bulkOps = [];

    // Push update operations to the bulkOps array
    for (const [postId, rank] of Object.entries(response.rankingMap)) {
      bulkOps.push({
        updateOne: {
          filter: { _id: postId },
          update: { $set: { rank } },
        },
      });
    }

    // Perform bulk write if there are operations to execute
    if (bulkOps.length > 0) {
      await Post.bulkWrite(bulkOps);
    }
    
    for (const [postId, rank] of Object.entries(response.rankingMap)) {
      await Post.updateOne({ _id: postId }, { $set: { rank } });
    }
    const end = performance.now();
    const timeTakenInSeconds = (end - start) / 1000; 
    saveRankingAna("Took", 5, timeTakenInSeconds); 
    
  } catch (error) {
    responseLogger.info("Error fetching or ranking posts:", error);
  } finally {
   // mongoose.connection.close();
    responseLogger.info("Database connection closed.");
  }
};

// Run the process
// fetchAndRankPosts();


const saveRankingAna = async (username: string, status: number, spendTime: number) => {
  try {
    const today = new Date().setHours(0, 0, 0, 0);
    let analytics = await RanAct.findOne({ date: today });

    if (!analytics) {
      analytics = new RanAct({
        date: today,
        rankings: [],
      });
    }

    // Push structured objectIdField to userActions
    analytics.rankings.push({
      time: Date.now(),
      spendTime: spendTime,
      user: username,
      status,
    });

    await analytics.save();
    responseLogger.info(`User action logged:`);
  } catch (error) {
    responseLogger.error(`Error logging user action for ${username}: ${error}`);
  }
};