import { TimeBudget } from "../models/user/timeBudget.model";
import { Post } from "../models/content/post.model";
import { SimpleLogger } from "../models/user/logger.model";
import { User, IUser } from "../models/user/user.model";

//export const getAllAgents = async () => await User.find().populate('timeBudget');

export async function getAllAgents(): Promise<IUser[]> {
  const agents = await User.find().populate('timeBudget').exec();

  return agents.map(agent => {
    agent.logger = new SimpleLogger(); // ✅ Reattach SimpleLogger instance
    return agent;
  });
}

export const getPostsByUser = async (userId: string) => await Post.find({ postedBy: userId });

export const updateUserMotivation = async (userId: string, value: number) => {
  const user = await User.findById(userId);
  if (user) {
    user.motivation = Math.max(0, Math.min(100, user.motivation + value));
    await user.save();
  }
};
