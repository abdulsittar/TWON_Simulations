// response.ts

import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { Integration } from './integration';  // Assuming Integration class is in integration.ts
import { Persona } from './persona';  // Assuming Persona class is in persona.ts
import { ResponseMeta } from './response.meta'; // Import ResponseMeta from the new file

// ResponseOptions class
class ResponseOptions {
  remove_hashtags: boolean = true;
}

// Response class
class Response {
  id: string;
  timestamp: Date;
  action: 'generate' | 'reply' | 'like';
  persona: Persona;
  integration: Integration;
  prompt: string;
  response: string;
  meta: ResponseMeta;
  options: ResponseOptions;

  static jsonSchemaExtra = {
    examples: [
      {
        action: "reply",
        persona: Persona.jsonSchemaExtra.examples[0],
        endpoint: Integration.jsonSchemaExtra.examples[0],
        prompt: "I want you to act as a social media user. You will engage in political and social discussions using an informal tone and brief sentences.\n\nYou provide insightful commentary, sharing your own well-thought-out opinions. You engage in discourses by offering analyses of political situations, encouraging public discourse, and fostering an environment where diverse opinions can coexist. You are a source of reliable information and a catalyst for constructive conversations surrounding politics.\n\n-----------------\n\nYour recent interactions in the platform are as follows:\n\nYou have not interacted in the thread yet.\n\n-----------------\n\nReply to the following thread while considering your history and character. Your response must not exceed 255 characters. \n\nPost by human_user: I like cookies!\n\nReply by cookie_monster: Me Love to Eat Cookies.\n\n-----------------\n\nResponse:",
        response: "I love cookies too! They're such a delicious treat. What's your favorite type of cookie?",
      }
    ]
  };

  constructor(data: {
    action: 'generate' | 'reply' | 'like';
    persona: Persona;
    integration: Integration;
    prompt: string;
    response: string;
    options?: ResponseOptions;
    meta?: ResponseMeta;
  }, logPath?: string) {
    this.id = uuidv4();
    this.timestamp = new Date();
    this.meta = data.meta || new ResponseMeta();
    this.options = data.options || new ResponseOptions();
    this.action = data.action;
    this.persona = data.persona;
    this.integration = data.integration;
    this.prompt = data.prompt;
    this.response = data.response;

    if (this.action === 'generate' || this.action === 'reply') {
      this.response = this.response
        .trim()
        .replace(/^"|"$/g, '') // Remove leading and trailing quotes
        .replace(/\n/g, ''); // Remove line breaks

      if (this.options.remove_hashtags) {
        this.response = this.response.replace(/(\s+#\w+)*\s*$/, '');
      }
    }

    if (this.action === 'like') {
      const choices = this.response.match(/true|false/i);
      this.response = choices ? choices[0] : 'false';
    }

    if (logPath) {
      this.log(logPath);
    }
  }

  // Log method for writing the response to a file
  log(filePath: string): void {
    const jsonData = JSON.stringify(this, (key, value) => {
      if (key === 'log') return undefined;  // Remove log from serialization
      return value;
    }, 4);

    // Resolve the file path correctly
    const resolvedPath = path.resolve(filePath, `${this.id}.json`);
    fs.writeFileSync(resolvedPath, jsonData);
  }
}

export { Response };
