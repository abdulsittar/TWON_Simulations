import { getRandomInt, agentGeneratePostLoop, agentLikePostLoop, agentLikeCommentLoop, agentReplyCommentLoop } from '../utils';
import { User } from '../models/User';
import { responseLogger } from '../utils/logger';

const num_of_loops = 10; // Define number of loops you want

export const runAction = async () => {
  try {
    for (let i = 0; i < num_of_loops; i++) {
      const randomIndex = getRandomInt(0, agents.length - 1);
      const randomAgent = agents[randomIndex];

      const randomAction = getRandomInt(0, 3);
      responseLogger.log(`Action ${i}!`);
      responseLogger.log(`Random Action ${randomAction}!`);
      responseLogger.log(`Random Agent: ${JSON.stringify(randomAgent)}!`);

      switch (randomAction) {
        case 0:
          await agentGeneratePostLoop(randomAgent);
          // Optionally add agentLikePostLoop here
          break;

        case 1:
          await agentGeneratePostLoop(randomAgent);
          // Optionally add agentLikeCommentLoop here
          break;

        case 2:
          await agentGeneratePostLoop(randomAgent);
          // Optionally add agentReplyCommentLoop here
          break;

        case 3:
          responseLogger.log(randomAgent);
          await agentGeneratePostLoop(randomAgent);
          break;

        default:
          responseLogger.log("Invalid action choice.");
          break;
      }
    }
  } catch (error) {
    responseLogger.log(`Scheduler App Error: ${error}`);
  }
};

export const initializeScheduler = async () => {
  try {
    await connectDB(); // Assuming connectDB is imported from the appropriate utils
    console.log('MongoDB connected successfully');
    responseLogger.log(`Number of agents: ${agents.length}`);
    responseLogger.log(`List of agents: ${JSON.stringify(agents)}`);

    // Uncomment if you want to set interval for running actions
    // setInterval(runAction, serDelayTime);

    await runAction();

    responseLogger.log(`Scheduler app listening on port ${process.env.network_port}!`);
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1); // Exit if the connection fails
  }
};
