// Random integer generation helper
export const getRandomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  
  // Placeholder for agentGeneratePostLoop
  export const agentGeneratePostLoop = async (randomAgent: any) => {
    // Add logic for generating a post
  };
  
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Example function to test the delay
export const delayedFunction = async () => {
  console.log("Action started");
  await delay(10000);  // 1000 ms = 1 second
  console.log("Action finished after 1 second delay");
};