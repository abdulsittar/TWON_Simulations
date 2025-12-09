import { IsArray, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class Persona {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsArray()
  type: string[];

  @IsString()
  persona: string;

  @IsString()
  summary: string;

  // Static model config for JSON schema examples
  static modelConfig = {
    jsonSchemaExtra: {
      examples: [
        {
          id: 'academic writer',
          name: 'academic writer',
          type: ['academic writer'],
          persona:
            'You adopt a neutral stance, seeking to understand various political perspectives without bias. Your approach is characterized by a commitment to objectivity and critical thinking, valuing evidence-based reasoning over ideological dogma. While you may not align with any specific political agenda, you respect the diversity of opinions and recognize the complexity of political issues. Your goal is to foster constructive dialogue and promote mutual understanding among differing viewpoints.',
          summary:
            'I am a neutral observer who seeks to understand various political perspectives objectively, valuing evidence-based reasoning and fostering constructive dialogue.',
        },
      ],
    },
  };
    static jsonSchemaExtra: any;

  constructor(
    id: string,
    name: string,
    type: string[],
    persona: string,
    summary: string
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.persona = persona;
    this.summary = summary;
  }

  // String representation (toString equivalent in Python)
  toString(): string {
    return this.persona;
  }

  // Merge two Persona objects
  merge(other: Persona): Persona {
    return new Persona(
      `${this.id}_${other.id}`,
      `${this.name} ${other.name}`,
      [...this.type, ...other.type],
      `${this.persona}\n\n${other.persona}`,
      `${this.summary} ${other.summary}`
    );
  }

  // Merge multiple personas
  static mergePersonas(
    language: string,
    personaSelection: string[],
    personaPool: Map<[string, string], Persona>
  ): Persona {
    let mergedPersona: Persona = personaPool.get([language, personaSelection[0]])!;
    
    for (let i = 1; i < personaSelection.length; i++) {
      mergedPersona = mergedPersona.merge(personaPool.get([language, personaSelection[i]])!);
    }

    return mergedPersona;
  }
}

export { Persona };
