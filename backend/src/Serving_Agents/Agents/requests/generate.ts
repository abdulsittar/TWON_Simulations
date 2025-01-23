import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseRequest } from './base';

// Enum for length options
enum LengthOptions {
  FewWord = 'few-word',
  SingleSentence = 'single-sentence',
  Short = 'short',
  Long = 'long',
}

// GenerateRequestOptions class
export class GenerateRequestOptions {
  @IsBoolean()
  retrieveGoogleNews: boolean = false;

  @IsBoolean()
  includeNewsSrcLink: boolean = false;
}

// GenerateRequest class
export class GenerateRequest extends BaseRequest {
  @IsString()
  topic!: string;

  @IsEnum(LengthOptions)
  length: LengthOptions = LengthOptions.FewWord;

  @ValidateNested()
  @Type(() => GenerateRequestOptions)
  options: GenerateRequestOptions = new GenerateRequestOptions();

  // JSON schema configuration
  static jsonSchemaExtra = {
    examples: [
      {
        ...BaseRequest.jsonSchemaExtra.examples[0],
        topic: 'Cookies: A round and delicious treat.',
        length: LengthOptions.FewWord,
        options: {
          retrieveGoogleNews: false,
          includeNewsSrcLink: false
        }
      },
    ],
  };
}
