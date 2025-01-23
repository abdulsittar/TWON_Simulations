import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Interaction } from './interaction';

export class History {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Interaction)
    interactions: Interaction[] = [];

  // JSON schema configuration
  static jsonSchemaExtra = {
    examples: [
      {
        interactions: [
          Interaction.jsonSchemaExtra.examples[0],
          Interaction.jsonSchemaExtra.examples[1],
        ],
      },
    ],
  };
/*
  // Length property
  get length(): number {
    return this.interactions.length;
  }

  // String representation
  toString(): string {
    if (this.interactions.length === 0) {
      return 'You have not interacted in the platform yet.';
    }

    return this.interactions
      .slice(-2)
      .map((interaction) => interaction.toString())
      .join('\n');
  }*/
}
