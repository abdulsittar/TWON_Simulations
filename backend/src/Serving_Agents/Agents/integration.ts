import { IsEnum, IsString } from 'class-validator';
import { config } from 'dotenv';
//import { OpenAIClient } from 'openai'; // Use a relevant OpenAI client library
//import { Together } from 'together'; // Use a relevant Together client library

config(); // Load environment variables from .env file

// Mock for Ollama
const ollama = {
  chat: (params: { model: string; messages: Array<{ role: string; content: string }> }) => {
    return { message: { content: `Response from model ${params.model}` } }; // Mock response
  },
};

// Enum for Providers
enum Provider {
  LOCAL = 'local',
  OPENAI = 'OpenAI',
  TOGETHER = 'together',
}

// Enum for Models
enum Model {
  FALCON = 'falcon:40b-instruct-q5_1',
  GEMMA = 'gemma:7b-instruct-q6_K',
  LLAMA2 = 'llama2:70b-chat-q6_K',
  MISTRAL = 'mistral:7b-instruct-v0.2-q6_K',
  MIXTRAL = 'mixtral:8x7b-instruct-v0.1-q6_K',
  QWEN = 'qwen:72b-chat-v1.5-q6_K',
  GPT35 = 'gpt-3.5-turbo',
  GPT4 = 'gpt-4',
}

export class Integration {
    provider: string;
    model: string;
    clientOpenAI: string;
    clientTogether: string;
    endpoints: string[];
    callts: string;
  
    constructor(
      provider: string,
      model: string,
      clientOpenAI: string,
      clientTogether: string,
      endpoints: string[],
      callts: string
    ) {
      this.provider = provider;
      this.model = model;
      this.clientOpenAI = clientOpenAI;
      this.clientTogether = clientTogether;
      this.endpoints = endpoints;
      this.callts = callts;
    }
  
    static jsonSchemaExtra = {
      examples: [
        {
          provider: 'openai',
          model: 'gpt-3',
          clientOpenAI: 'some_client_openai',
          clientTogether: 'some_client_together',
          endpoints: ['endpoint1', 'endpoint2'],
          callts: 'timestamp_here',
        },
      ],
    };
  }
