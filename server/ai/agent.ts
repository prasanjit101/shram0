import { Experimental_Agent as Agent, stepCountIs, tool } from 'ai';
import { z } from 'zod';
import { todoTools } from './tools';
import { groq } from '@ai-sdk/groq';
import { todoSystemPrompt } from './prompt';

export const todoAgent = new Agent({
  model: groq('openai/gpt-oss-120b'),
  tools: todoTools,
  stopWhen: stepCountIs(6),
  system: todoSystemPrompt,
    temperature: 0.2,
    maxRetries: 3,
});