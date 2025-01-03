/**
 * The activation function.
 * @param {number} k The steepness of the activation function.
 * @param {number} b The bias of the activation function.
 * @returns {number} The result of the activation function.
 */
export function activation(k: number, b: number): number {
    return 2 / (1 + Math.exp(-k * b)) - 1;
  }
  