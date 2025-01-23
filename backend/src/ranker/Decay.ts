export class Decay {
    minimum: number;
    referenceTimedelta: number; // Seconds
  
    constructor(minimum: number, referenceTimedelta: number) {
      this.minimum = minimum;
      this.referenceTimedelta = referenceTimedelta;
    }
  
    public calculate(
      observationDatetime: Date,
      referenceDatetime: Date
    ): number {
      const decay: number =
        1.0 -
        (referenceDatetime.getTime() - observationDatetime.getTime()) /
          (this.referenceTimedelta * 1000);
  
      return Math.max(decay, this.minimum);
    }
  }
  