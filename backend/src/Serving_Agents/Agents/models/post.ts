import { IsString } from 'class-validator';

export class Post {
  @IsString()
  author: string = '';  // Default value

  @IsString()
  message: string = '';  // Default value

  // JSON schema examples
  static jsonSchemaExtra = {
    examples: [
      { author: 'human_user', message: 'I like cookies!' },
      { author: 'cookie_monster', message: 'Me Love to Eat Cookies.' },
    ],
  };

  // String representation of the Post
  toString(): string {
    return `Post by @${this.author}: ${this.message}`.trim();
  }
}
