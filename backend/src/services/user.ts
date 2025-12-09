import { User } from "../models/user/user.model";
import { activation } from "../utils/activation";

export const calculateActivation = async (userId: string): Promise<number> => {
  // Fetch user with populated timeBudget
  const user = await User.findById(userId).populate("timeBudget");

  if (!user || !user.timeBudget) {
    throw new Error("User or time budget not found");
  }

  // Calculate the available time percentage (b)
  const timeBudget = user.timeBudget as any; // Cast to access populated fields
  const availableTime = (timeBudget.totalTime - timeBudget.usedTime) / timeBudget.totalTime;

  // Calculate the activation using user motivation (k) and availableTime (b)
  const activationValue = activation(user.motivation, availableTime);

  return activationValue;
};
