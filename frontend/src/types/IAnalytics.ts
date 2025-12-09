export interface IAnalytics {
  userGrowth: { name: string; value: number }[];
  featureUsage: { name: string; value: number }[];
  heatmapData: number[][];
  userActivity: { time: number; user: string; status: number }[];  // ✅ Add this line
  userActions: {time: number; user: string; action: string}[];

}