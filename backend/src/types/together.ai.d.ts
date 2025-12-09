declare module 'together-ai' {
    export default class Together {
      constructor(api_key: string);
      chat: {
        completions: {
          create(params: {
            model: string;
            messages: Array<{ role: string; content: string }>;
            max_tokens?: number | null; // Optional property
            temperature?: number; // Optional property
            top_p?: number; // Optional property
            top_k?: number; // Optional property
            repetition_penalty?: number; // Optional property
            stop?: string[]; // Optional property
            stream?: boolean; // Optional property
          }): Promise<any>;
        };
      };
    }
  }
  