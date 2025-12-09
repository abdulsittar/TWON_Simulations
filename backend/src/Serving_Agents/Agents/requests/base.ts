import { IsArray, IsIn, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Integration } from '../integration'; // import Integration
import { Persona } from '../persona';
import { History } from '../models/history';

export class BaseRequest {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Persona)
  persona: string[] = []; // Update PersonaType if necessary

  // Pass the required arguments for Integration instantiation
  @ValidateNested()
  @Type(() => Integration)
  integration: Integration = new Integration(
    Integration.jsonSchemaExtra.examples[0].provider, // Referencing jsonSchemaExtra from Integration
    Integration.jsonSchemaExtra.examples[0].model,
    Integration.jsonSchemaExtra.examples[0].clientOpenAI,
    Integration.jsonSchemaExtra.examples[0].clientTogether,
    Integration.jsonSchemaExtra.examples[0].endpoints,
    Integration.jsonSchemaExtra.examples[0].callts
  );

  @IsString()
  @IsIn(['English', 'German', 'Dutch'])
  language: 'English' | 'German' | 'Dutch' = 'English';

  @IsString()
  @IsIn(['Twitter', 'Reddit', 'Facebook', 'Telegram'])
  platform: 'Twitter' | 'Reddit' | 'Facebook' | 'Telegram' = 'Twitter';

  @ValidateNested()
  @Type(() => History)
  history: History = new History();
    static jsonSchemaExtra: any;
}
