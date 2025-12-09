export interface ISentimentScores {
    [username: string]: {
      hate: number;
      not_hate: number;
      non_offensive: number;
      irony: number;
      neutral: number;
      positive: number;
      negative: number;
    };
  }
  