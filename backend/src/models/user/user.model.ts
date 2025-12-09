import mongoose, { Schema, Document } from "mongoose";
import { ITimeBudget } from "./timeBudget.model";
import { IOpinionModel, AMCDOpinionModel, Reaction } from "../user/opinion.model";
import { ILogger, SimpleLogger } from "../user/logger.model";
import { IActor, DefaultActor } from "../user/actor.model";
import  responseLogger  from '../../utils/logs/logger';
import { Analytics } from "../../models/content/analytics.model";
import { IPost } from "../content/post.model"; 

// User Interface with agent-like behavior
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  loggedIn: boolean;
  name: string;
  email: string;
  persona: string;
  motivation: number;
  engagement: number; // Engagement level of the user
  success: number; // Success level of the user
  timeBudget: ITimeBudget["_id"]; // Reference to TimeBudget model
  followers: IUser["_id"][]; // Array of user references (followers)
  followings: IUser["_id"][]; // Array of user references (followings)
  notificationEffect: number;
  timeSpent: number;
    // New agent-like fields
  opinionModel: IOpinionModel; // Agent's Opinion Model
  logger: ILogger; // Logger for the agent's actions
  actor: IActor; // Actor for the agent's behavior
  frustration: number; // Frustration factor
  biases: Record<string, number>; // Biases affecting decisions
  timeBudgetRemaining: number; // Remaining time budget for the agent
  entertainmentScore: number;
  nextActivationTime?: number;
  // Methods for agent behavior
  assignAndSaveScores(probabilities: number[]): void;
  activateAgent(): boolean; // Method to activate agent's behavior
  updateOpinion(reactions: Reaction[]): void; // Update opinion based on interactions
  performActions(): void; // Method to make the agent perform actions
  activateAgent(currentTime: number, online: boolean): boolean;
  
  calculateTimeUtility(timeSpent: number, timeBudget: number): number;
  calculateFeedbackUtility(feedbackScore: number): number;
  calculateEntertainmentUtility(entertainmentScore: number): number;
  calculateEUon(timeSpent: number, entertainmentScore: number, feedbackScore: number): number;
  calculateNetUtilityDifference(EUon: number): number;
  calculateLogonProbability(): number;
  
}

interface WantToReplyEntry {
  postId: mongoose.Types.ObjectId;
  score: number;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true },
    loggedIn: { type: Boolean, required: true },
    name: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    motivation: { type: Number, required: true },
    notificationEffect: { type: Number, required: true },
    engagement: { type: Number, required: true },
    success: { type: Number, required: true },
    timeSpent: { type: Number, required: true },
    feedbackScore: { type: Number, required: true },
    entertainmentScore: { type: Number, required: true },
    timeBudget: { type: Schema.Types.ObjectId, ref: "TimeBudget", required: true }, // Reference to TimeBudget
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }], // Array of user references (followers)
    followings: [{ type: Schema.Types.ObjectId, ref: "User" }], // Array of user references (followings)
    isPublic:{ type: Boolean, required: true },
    // New agent-specific fields
    opinionModel: {
      type: Schema.Types.Mixed, // Storing as mixed to handle flexible structures
      required: true,
    },
    logger: {
      type: Schema.Types.Mixed, // Storing as mixed for logger
      required: true,
    },
    actor: {
      type: Schema.Types.Mixed, // Storing as mixed for actor
      required: true,
    },
    frustration: { type: Number, required: true },
    biases: { type: Map, of: Number, required: true }, // Biases stored as key-value pairs
    timeBudgetRemaining: { type: Number, required: true, default: 100 }, // Starting budget
  },
  { timestamps: true }
);


UserSchema.methods.assignAndSaveScores = async function (probabilities: number[]): Promise<void> {
  this.wantToReply = this.wantToReply.map((entry: WantToReplyEntry, index: number) => ({
    postId: entry.postId,
    score: probabilities[index] * 10, // Convert probability into a score between 0 and 10
  }));

  await this.save();
};

// Time Utility Calculation
UserSchema.methods.calculateTimeUtility = function (timeSpent: number, timeBudget: number): number {
  const excessTime = Math.max(timeSpent - timeBudget, 0);
  const uBase = Math.log(1 + Math.exp(timeSpent - timeBudget)); // Log function for time spent
  const penalty = excessTime > 0 ? Math.log(1 + 0.5) : 0; // Penalty if exceeding budget
  return -(uBase + 0.5 * penalty); // Total time utility (negative as it's a cost)
};

// Social Feedback Utility Calculation
UserSchema.methods.calculateFeedbackUtility = function (feedbackScore: number): number {
  if (feedbackScore >= 0) {
    return Math.log(1 + feedbackScore); // Positive feedback utility
  } else {
    return -1 * Math.log(1 - feedbackScore); // Negative feedback utility
  }
};

// Entertainment Utility Calculation
UserSchema.methods.calculateEntertainmentUtility = function (entertainmentScore: number): number {
  if (entertainmentScore >= 0) {
    return Math.log(1 + entertainmentScore); // Positive entertainment utility
  } else {
    return -1 * Math.log(1 - entertainmentScore); // Negative entertainment utility
  }
};

// Expected Utility of Logging On (EUon)
UserSchema.methods.calculateEUon = function (timeSpent: number, entertainmentScore: number, feedbackScore: number): number {
  const timeUtility = this.calculateTimeUtility(this.timeBudget.usedTime, this.timeBudget.totalTime);
  const feedbackUtility = this.calculateFeedbackUtility(feedbackScore);
  const entertainmentUtility = this.calculateEntertainmentUtility(entertainmentScore);

  return 0.4 * timeUtility + 0.3 * entertainmentUtility + 0.3 * feedbackUtility;
};

// Net Utility Difference (ΔEUon)
UserSchema.methods.calculateNetUtilityDifference = function (EUon: number): number {
  const EUon_0 = 0; // Utility of not logging on (0 in this case)
  return EUon - EUon_0;
};


// Logon Probability Calculation
UserSchema.methods.calculateLogonProbability = function (): number {
  const EUon = this.calculateEUon(this.timeBudget.usedTime, this.entertainmentScore, this.feedbackScore);
  const deltaEUon = this.calculateNetUtilityDifference(EUon);
  const deltaTime = 1; // Default time step (this can vary depending on the model or timestep)
  const sensitivityFactor = 1.5; // Decision sensitivity factor

  return 1 / (1 + Math.exp(-deltaTime * sensitivityFactor * deltaEUon)); // Logistic function
};


UserSchema.methods.activateAgent = async function (currentTime: number, online: boolean): Promise<boolean> {
  // *** Calculate Utilities BEFORE Activation ***
  const timeUtility = this.calculateTimeUtility(this.timeBudget.usedTime, this.timeBudget.totalTime);
  const feedbackUtility = this.calculateFeedbackUtility(this.feedbackScore);
  const entertainmentUtility = this.calculateEntertainmentUtility(this.entertainmentScore);
  const loginUtility = this.calculateEUon(this.timeBudget.usedTime, this.entertainmentScore, this.feedbackScore);
  const logonProbability = this.calculateLogonProbability();

  // *** Validate Utilities Before Logging ***
  if ([timeUtility, feedbackUtility, entertainmentUtility, loginUtility].some(value => isNaN(value) || value === Infinity)) {
    responseLogger.error(`Invalid Utility Detected for ${this.username}. Skipping activation.`);
    return false; // Prevent activation if any utility is invalid
  }

  // *** Log Only Required Information ***
  responseLogger.debug(`User = ${this.username}`);
  responseLogger.debug(`motivation = ${this.motivation}`);
  responseLogger.debug(`engagement = ${this.engagement}`);
  responseLogger.debug(`success = ${this.success}`);
  responseLogger.debug(`time budget = ${this.timeBudget.totalTime}`);
  responseLogger.debug(`frustration = ${this.frustration}`);
  responseLogger.debug(`notification effect = ${this.notificationEffect}`);
  responseLogger.debug(`time spent = ${this.timeBudget.usedTime}`);
  responseLogger.debug(`time utility = ${timeUtility}`);
  responseLogger.debug(`feedback utility = ${feedbackUtility}`);
  responseLogger.debug(`entertainment utility = ${entertainmentUtility}`);
  responseLogger.debug(`login utility = ${loginUtility}`);
  responseLogger.debug(`login probability = ${logonProbability}`);

  // *** Validate Logon Probability Before Activating ***
  if (isNaN(logonProbability) || logonProbability < 0 || logonProbability > 1) {
    responseLogger.error(`Invalid Logon Probability for ${this.username}. Skipping activation.`);
    return false;
  }
// ✅ **Update Analytics Data**

const today = new Date().setHours(0, 0, 0, 0);
let analytics = await Analytics.findOne({ date: today });


if (!analytics) {
  analytics = new Analytics({
    date: today,
    userGrowth: [],
    featureUsage: [],
    heatmapData: [],
    userActivity: []
  });
}

if (this.timeBudget.totalTime > 0 && logonProbability > 0.5) { // (loginProbability) greater than (Random number between 0 and 1)     
  //await User.updateOne({ username: this.username }, { $set: { loggedIn: true } });

  try {
    

    // 1️⃣ Update `loggedIn` status for the current user in MongoDB
    await User.updateOne({ username: this.username }, { loggedIn: true });

    // 2️⃣ Fetch analytics record for today, create if not found
    

  

    // 3️⃣ Fetch all users and active users
    const allUsers = await User.find({}, "username loggedIn");
    
    // Ensure userActivity array is initialized
   // if (!Array.isArray(analytics.userActivity)) {
    //  analytics.userActivity = [];
    //}

    // 4️⃣ Update user activity log
    const newActivityEntries  = allUsers.map(user => ({
      time: Date.now(),
      user: user.username,
      status: user.loggedIn ? 1 : 0,
      action: user.loggedIn ? "login" : "inactive"
    }));
    
    analytics.userActivity.push(...newActivityEntries);

    // Save analytics record
    await analytics.save();

    responseLogger.debug("Updated userActivity:", JSON.stringify(analytics.userActivity));

  } catch (error) {
    responseLogger.error(`Error updating analytics: ${error}`);
  }

  this.logger.logEvent(`Agent ${this.username} activated at ${Date.now()}.`);
  this.actor?.performActions?.(this);
  return true;
  
} else {
  try {
    const today = new Date().setHours(0, 0, 0, 0);

    // 1️⃣ Update `loggedIn` status for the current user in MongoDB
    await User.updateOne({ username: this.username }, { loggedIn: false });

    // 2️⃣ Fetch analytics record for today, create if not found

    // 3️⃣ Fetch all users and active users
    const allUsers = await User.find({}, "username loggedIn");
    
    // Ensure userActivity array is initialized
    //if (!Array.isArray(analytics.userActivity)) {
    //  analytics.userActivity = [];
    //}

    // 4️⃣ Update user activity log
    const newActivityEntries  = allUsers.map(user => ({
      time: Date.now(),
      user: user.username,
      status: user.loggedIn ? 1 : 0,
      action: user.loggedIn ? "login" : "inactive"
    }));

    analytics.userActivity.push(...newActivityEntries);

    // Save analytics record
    await analytics.save();

    responseLogger.debug("Updated userActivity:", JSON.stringify(analytics.userActivity));

  } catch (error) {
    responseLogger.error(`Error updating analytics: ${error}`);
  }

  this.logger.logEvent(`Agent ${this.username} deactivated at ${Date.now()}.`);
  this.actor?.performActions?.(this);
  return false;
}


return false;
};



UserSchema.methods.updateOpinion = function (reactions: Reaction[]): void {
  // Update opinion based on reactions using the AMCDOpinionModel
  this.opinionModel.updateOpinion(reactions);
};

UserSchema.methods.performActions = function (): void {
  // Perform actions based on the agent's actor
  this.actor.performActions(this);
};



export const User = mongoose.model<IUser>("User", UserSchema);
