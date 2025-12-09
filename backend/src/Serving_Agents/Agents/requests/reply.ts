import { IsString, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseRequest } from './base';
import { Thread } from '../models/thread';

export class ReplyRequest extends BaseRequest {
  @ValidateNested()
  @Type(() => Thread)
  thread!: Thread;

  @IsString()
  @IsIn(['few-word', 'single-sentence', 'short', 'long'])
  length: 'few-word' | 'single-sentence' | 'short' | 'long' = 'few-word';

  // JSON schema configuration for documentation or validation
  static jsonSchemaExtra = {
    examples: [
      {
        ...BaseRequest.jsonSchemaExtra.examples[0],
        thread: Thread.jsonSchemaExtra.examples[0],
        length: 'few-word',
      },
    ],
  };
}
