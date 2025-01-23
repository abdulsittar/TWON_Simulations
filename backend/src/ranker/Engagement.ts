import { Decay } from './Decay';

type EngagementFunc = 'count_based' | 'decay_based';

export class Engagement {
  func: EngagementFunc;
  logNormalize: boolean;

  constructor(func: EngagementFunc, logNormalize: boolean) {
    this.func = func;
    this.logNormalize = logNormalize;
  }

  public calculate(items: Date[], referenceDatetime?: Date, decay?: Decay): number {
    const score: number =
      this.func === 'count_based'
        ? items.length
        : this.getDecayedScore(items, referenceDatetime!, decay!);

    return this.logNormalize ? Math.log(score) : score;
  }

  private getDecayedScore(items: Date[], referenceDatetime: Date, decay: Decay): number {
    return items.reduce(
      (sum, item) => sum + decay.calculate(item, referenceDatetime),
      0
    );
  }
}
