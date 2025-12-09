import { IComment } from "../models/content/comment.model";

export interface Ranking_Post {
    id: string;
    timestamp: Date;
    likes: Date[];
    dislikes: Date[];
    reposts: Date[];
    comments: Date[]; 
    commentsLikes: Date[];
    commentsDislikes: Date[];
  }
  
  export const computePostFields = (post: Ranking_Post): void => {
    post.comments = post.comments.map((comment) => comment ?? new Date());
  
    post.commentsLikes = post.likes.map((comment) => comment ?? new Date());
    
    post.commentsDislikes = post.dislikes.map((comment) => comment ?? new Date());

  };
  