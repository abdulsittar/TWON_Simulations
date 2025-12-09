export class Noise {
    low: number;
    high: number;
  
    constructor(low: number, high: number) {
      this.low = low;
      this.high = high;
    }
  
    public generate(): number {
      return Math.random() * (this.high - this.low) + this.low;
    }
  
    public drawSamples(n: number): number[] {
      return Array.from({ length: n }, () => this.generate());
    }
  }
  