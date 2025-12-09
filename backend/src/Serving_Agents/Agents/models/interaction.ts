import { IsString } from 'class-validator';

export class Interaction {
  @IsString()
  action: string;

  @IsString()
  message: string;

  constructor(action: string, message: string) {
    this.action = action;
    this.message = message;
  }

  // JSON schema examples
  static jsonSchemaExtra = {
    examples: [
      { action: 'liked', message: 'Sweets make the world go round!' },
      { action: 'wrote', message: 'As a kid, I fell into a jar of honey.' },
    ],
  };

  // String representation of the Interaction
  toString(): string {
    return `You ${this.action} the message: ${this.message}`.trim();
  }
}
