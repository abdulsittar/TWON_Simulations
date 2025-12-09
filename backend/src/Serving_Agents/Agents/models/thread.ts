import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Post } from './post'; // Make sure you import the Post model correctly

export class Thread {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Post)  // Ensuring the array contains Post objects
  posts: Post[] = [];

  // Static property to hold JSON schema examples
  static jsonSchemaExtra = {
    examples: [
      {
        posts: [
          Post.jsonSchemaExtra.examples[0], // Accessing the Post example
          Post.jsonSchemaExtra.examples[1], // Accessing another Post example
        ],
      },
    ],
  };

  // Getter to return the length of the posts
  get length(): number {
    return this.posts.length;
  }

  // String representation of the Thread
  toString(): string {
    // Limit to 2 posts: if more than 2, show the first and last post, otherwise show all
    const postsToShow = this.length <= 2 ? this.posts : [this.posts[0], ...this.posts.slice(-2)];

    return postsToShow.map((post) => post.toString()).join('\n');
  }
}
