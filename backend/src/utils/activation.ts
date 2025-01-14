// utils/activation.ts

/**
 * Activation function to calculate the activation value.
 * Formula: activation(k, b) = k * b
 * Where:
 * k = User's motivation (between 0 and 100)
 * b = Available time percentage (between 0 and 1)
 * 
 * @param k - The user's motivation
 * @param b - The available time percentage
 * @returns The activation value
 */
export const activation = (k: number, b: number): number => {
    // Ensure both inputs are within the expected range (k: 0-100, b: 0-1)
    if (k < 0 || k > 100) {
      throw new Error("Motivation (k) must be between 0 and 100.");
    }
  
    if (b < 0 || b > 1) {
      throw new Error("Available time (b) must be between 0 and 1.");
    }
  
    // Calculate the activation value as the product of motivation and available time
    const activationValue = k * b;
    
    // Return the activation value
    return activationValue;
  };
  