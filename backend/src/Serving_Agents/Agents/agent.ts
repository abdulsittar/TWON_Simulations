import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as glob from 'glob';

import { Article } from './article';
import { Persona } from './persona';
import { Response } from './response';
import { ResponseMeta } from './response.meta';

import { BaseRequest} from './requests/base';
import { GenerateRequest} from './requests/generate';
import { LikeRequest} from './requests/like';
import { ReplyRequest} from './requests/reply';

dotenv.config();

interface AgentsConfig {
  personaSrcPath: string;
  promptSrcPath: string;
  logPath?: string;
}

export class Agents {
  private personaSrcPath: string;
  private promptSrcPath: string;
  private logPath?: string;

  private personas: Record<string, Persona> = {};
  private prompts: Record<string, string> = {};

  constructor(config: AgentsConfig) {
    this.personaSrcPath = config.personaSrcPath;
    this.promptSrcPath = config.promptSrcPath;
    this.logPath = config.logPath;

    this.personas = this.loadPersonas();
    this.prompts = this.loadPrompts();
  }

  private loadPersonas(): Record<string, Persona> {
    const personas: Record<string, Persona> = {};
    const files = glob.sync(`${this.personaSrcPath}/*.json`);

    files.forEach((personaFile) => {
      const nameParts = path.basename(personaFile, '.json').split('.');
      const key = `${nameParts[0]}.${nameParts[1]}`;
      const personaData = JSON.parse(fs.readFileSync(personaFile, 'utf8'));
      personas[key] = new Persona(personaData);
    });

    return personas;
  }

  private loadPrompts(): Record<string, string> {
    const prompts: Record<string, string> = {};
    const files = glob.sync(`${this.promptSrcPath}/*.txt`);

    files.forEach((promptFile) => {
      const nameParts = path.basename(promptFile, '.txt').split('.');
      const key = `${nameParts[0]}.${nameParts[1]}`;
      prompts[key] = fs.readFileSync(promptFile, 'utf8');
    });

    return prompts;
  }

  public call(action: string, request: BaseRequest, slots: Record<string, any> = {}): Response {
    const persona = Persona.mergePersonas(
      request.language.toLowerCase(),
      request.persona,
      this.personas
    );
    const promptTemplate = this.prompts[`${request.language.toLowerCase()}.${action}`];
    const prompt = promptTemplate
      .replace(/\{language\}/g, request.language)
      .replace(/\{platform\}/g, request.platform)
      .replace(/\{history\}/g, request.history)
      .replace(/\{([^}]+)\}/g, (_, key) => slots[key] || '');

    return new Response({
      action,
      prompt,
      response: request.integration(persona.toString(), prompt),
      persona,
      integration: request.integration,
      logPath: this.logPath,
    });
  }

  public generate(request: GenerateRequest): Response {
    let response: Response;

    if (request.options.retrieveGoogleNews) {
      try {
        const article = new Article({
          topic: request.topic,
          language: request.language,
          country: request.language,
        });

        response = this.call('generate', request, {
          topic: article.toString(),
          length: request.length,
        });

        response.meta = new ResponseMeta({ retrievedSource: article.url });

        if (request.options.includeNewsSrcLink) {
          response.response = `${response.response}\n\n${article.url}`;
        }
      } catch (error) {
        response = this.call('generate', request, {
          topic: request.topic,
          length: request.length,
        });
        console.error(response);
      }
    } else {
      response = this.call('generate', request, {
        topic: request.topic,
        length: request.length,
      });
      console.error(response);
    }

    return response;
  }

  public reply(request: ReplyRequest): Response {
    return this.call('reply', request, {
      thread: request.thread,
      length: request.length,
    });
  }

  public like(request: LikeRequest): Response {
    return this.call('like', request, {
      post: request.post,
    });
  }
}
