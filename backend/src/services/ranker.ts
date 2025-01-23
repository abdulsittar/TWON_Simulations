import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import models
import { Post } from "../models/content/post.model";
import { PostLike } from "../models/content/postLike.model";
import { PostDislike } from "../models/content/postDislike.model";

import { Comment, IComment } from "../models/content/comment.model";
import { CommentLike } from "../models/content/commentLike.model";
import { CommentDislike  } from "../models/content/commentDislike.model";
import { Repost } from "../models/content/repost.model";

// Import Ranker
import { Ranker } from '../ranker/Ranker';
import { Decay } from '../ranker/Decay';
import { Engagement } from '../ranker/Engagement';
import { Noise } from '../ranker/Noise';

// Load environment variables
dotenv.config();

const responseLogger = (() => {
  const log = (...args: unknown[]): void => {
    const timestamp = new Date().toISOString();
    console.log(`[responseLogger ${timestamp}]`, ...args);
  };

  return { log };
})();

const getArrayOfValuesRepost = (dict: Record<string, { createdAt: Date }>): Date[] => {
  return Object.values(dict).map((entry) => entry.createdAt);
};

const filteredComments = (comments: { id: string, likes: Date[], dislikes: Date[], timestamp: Date }[]): { id: string, likes: Date[], dislikes: Date[], timestamp: Date }[] => {
  return comments.filter((x) => x != null);
};


const getArrayOfValuesComments = (comments: IComment[]): Array<{ id: string, likes: Date[], dislikes: Date[], timestamp?: Date }> => {
  return comments.map((comment) => ({
    id: comment._id.toString(),
    likes: comment.likes?.map((like) => like.createdAt) || [],
    dislikes: comment.dislikes?.map((dislike) => dislike.createdAt) || [],
    timestamp: comment.createdAt,  // It can be undefined
  }));
};



const fetchAllPosts = async (): Promise<void> => {
  try {
    responseLogger.log('Connecting to the database...');
    await mongoose.connect(process.env.DB_URL || '');

    const posts = await Post.find({})
      .populate([
        { path: 'reposts', model: Repost, select: 'createdAt _id' },
        { path: 'likes', model: PostLike, select: 'createdAt _id' },
        { path: 'dislikes', model: PostDislike, select: 'createdAt _id' },
        {
          path: 'comments', // Populate the comments array
          model: Comment,
          select: 'body userId username likes dislikes createdAt', // Select fields for the comment
          populate: [
            { path: 'likes', model: CommentLike, select: 'createdAt _id' },
            { path: 'dislikes', model: CommentDislike, select: 'createdAt _id' },
          ],
        },
      ])
      .exec();

    // Ensure that post.comments is treated as an array of IComment
   /* const items = posts.map((post) => ({
      id: post._id.toString(),
      reposts: arrayToRecord(post.reposts as { _id: string; createdAt: Date }[]),
      likes: arrayToRecord(post.likes as { _id: string; createdAt: Date }[]),
      dislikes: arrayToRecord(post.dislikes as { _id: string; createdAt: Date }[]),
      comments: filteredComments(getArrayOfValuesComments(post.comments as unknown as IComment[])), // Explicitly cast post.comments
      timestamp: post.createdAt,
    }));*/
    
    const items = posts.map((post) => ({
      id: post._id.toString(),
      reposts: arrayToRecord(post.reposts as { _id: string; createdAt: Date }[]),
      likes: arrayToRecord(post.likes as { _id: string; createdAt: Date }[]),
      dislikes: arrayToRecord(post.dislikes as { _id: string; createdAt: Date }[]),
      comments: filteredComments(getArrayOfValuesComments(post.comments)),
      timestamp: post.createdAt || new Date(), // Ensure timestamp is always a Date
    }));
    
    
    /*const items = posts.map((post) => ({
      id: post._id.toString(),
      reposts: arrayToRecord(post.reposts as { _id: string; createdAt: Date }[]),
      likes: arrayToRecord(post.likes as { _id: string; createdAt: Date }[]),
      dislikes: arrayToRecord(post.dislikes as { _id: string; createdAt: Date }[]),
      comments: filteredComments(
        getArrayOfValuesComments(post.comments) // post.comments should now be populated with full IComment objects
      ),
      timestamp: post.createdAt,
      commentsTimestamp: post.comments?.map((comment) => comment.createdAt) || [],
      commentsLikes: post.comments?.map((comment) => comment.likes.length) || [],
      commentsDislikes: post.comments?.map((comment) => comment.dislikes.length) || [],
    }));*/
    
    // Continue your logic as usual
    

      const arrayToRecord = (array: { _id: string; createdAt: Date }[]): Record<string, { createdAt: Date }> => {
        return array.reduce((acc, item) => {
          acc[item._id] = { createdAt: item.createdAt };
          return acc;
        }, {} as Record<string, { createdAt: Date }>);
      };
      
      const getArrayOfValuesComments = (comments: IComment[]): Array<{ id: string, likes: Date[], dislikes: Date[], timestamp: Date }> => {
        return comments.map((comment) => ({
          id: comment._id.toString(),
          likes: comment.likes?.map((like) => like.createdAt) || [],
          dislikes: comment.dislikes?.map((dislike) => dislike.createdAt) || [],
          timestamp: comment.createdAt || new Date(),  // Fallback to current date if undefined
        }));
      };
    
    // Create an instance of Ranker
    const ranker = new Ranker();


const rankingPayload = {
    items,
    weights: { likes: 1.0, dislikes: 1.0, reposts: 1.0, comments: 1.0 },
    engagement: new Engagement('count_based', false),
    noise: new Noise(0.6, 1.4),
    decay: new Decay(0.2, 3 * 24 * 60 * 60), // Decay with 3 days in seconds
    referenceDatetime: new Date(),  // Updated to referenceDatetime in camelCase
    mode: 'ranked',
    
};

// Use the Ranker to rank posts
const response = ranker.rank(rankingPayload);

// Update the posts in the database with the computed ranks
for (const [key, rank] of Object.entries(response.rankingMap)) {
  await Post.updateOne({ _id: key }, { $set: { rank } });
}

responseLogger.log('Posts ranked and updated successfully.');

  } catch (error) {
    responseLogger.log('Error fetching posts:', error);
  }
};

const app = express();

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  fetchAllPosts();
});
