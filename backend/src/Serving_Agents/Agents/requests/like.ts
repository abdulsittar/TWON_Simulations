import { IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseRequest } from './base';
import { Post } from '../models/post';

export class LikeRequest extends BaseRequest {
  @IsObject()
  @Type(() => Post)
  post!: Post;

  // JSON schema configuration
  static jsonSchemaExtra = {
    examples: [
      {
        ...BaseRequest.jsonSchemaExtra.examples[0],
        post: Post.jsonSchemaExtra.examples[0],
      },
    ],
  };
}
