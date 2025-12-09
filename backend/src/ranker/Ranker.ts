import { Ranking_Post, computePostFields } from './Ranking_Post';
import { Decay } from './Decay';
import { Engagement } from './Engagement';
import { Noise } from './Noise';
import  responseLogger  from '../utils/logs/logger';

interface Request {
  items: Ranking_Post[];
  mode: 'random' | 'chronological' | 'ranked';
  referenceDatetime: Date;
  decay: Decay;
  engagement: Engagement;
  noise: Noise;
  weights: {
    likes: number;
    dislikes: number;
    reposts: number;
    comments: number;
    commentsLikes: number;
    commentsDislikes: number;
  };
}

interface Response {
  logPath?: string;
  request: Request;
  rankingMap: Record<string, number>;
}

export class Ranker {
  logPath?: string;

  constructor(logPath?: string) {
    this.logPath = logPath;
  }

  public rank(req: Request): Response {
    const rankingMap: Record<string, number> = Object.fromEntries(
      req.items.map((post) => [post.id, this.computePostScore(req, post)])
    );

    return {
      logPath: this.logPath,
      request: req,
      rankingMap,
    };
  }

  private computePostScore(req: Request, post: Ranking_Post): number {
    computePostFields(post);
    
    

    if (req.mode === 'random') {
      return Math.random();
    }

    if (req.mode === 'chronological') {
      return post.timestamp.getTime() / 1000;
    }

    const observations: number[] = [
      req.weights.likes *
        req.engagement.calculate(post.likes, req.referenceDatetime, req.decay),
      req.weights.dislikes *
        req.engagement.calculate(post.dislikes, req.referenceDatetime, req.decay),
      req.weights.reposts *
        req.engagement.calculate(post.reposts, req.referenceDatetime, req.decay),
      req.weights.comments *
        req.engagement.calculate(post.comments, req.referenceDatetime, req.decay),
      req.weights.commentsLikes *
        req.engagement.calculate(post.commentsLikes, req.referenceDatetime, req.decay),
      req.weights.commentsDislikes *
        req.engagement.calculate(post.commentsDislikes, req.referenceDatetime, req.decay),
    ];
    //responseLogger.debug(`Post Rank: ${observations}`);

    return (
      req.noise.generate() *
      (req.engagement.func === 'count_based'
        ? req.decay.calculate(post.timestamp, req.referenceDatetime) * observations.reduce((a, b) => a + b, 0)
        : observations.reduce((a, b) => a + b, 0))
    );
  }
}
