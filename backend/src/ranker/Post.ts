export interface Post {
    id: string;
    timestamp: Date;
    likes: Date[];
    dislikes: Date[];
    reposts: Date[];
    comments: Post[];
  
    commentsTimestamp: Date[];
    commentsLikes: Date[];
    commentsDislikes: Date[];
  }
  
  export const computePostFields = (post: Post): void => {
    post.commentsTimestamp = post.comments.map((comment) => comment.timestamp);
  
    post.commentsLikes = post.comments.flatMap((comment) => comment.likes);
  
    post.commentsDislikes = post.comments.flatMap((comment) => comment.dislikes);
  };
  