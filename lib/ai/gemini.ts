import { GoogleGenAI } from '@google/genai';
import { logger } from '../utils/logger';
import { isRealGeminiKey } from '../config/envTrust';

export interface GeminiGenerationOptions {
  systemPrompt?: string;
  temperature?: number;
  apiKey?: string;
  model?: string;
}

export function isGeminiConfigured(customKey?: string): boolean {
  return isRealGeminiKey(customKey || process.env.GEMINI_API_KEY);
}

export async function callGemini(
  prompt: string,
  options: GeminiGenerationOptions = {}
): Promise<{ text: string; tokensUsed: number; durationMs: number; modelUsed: string }> {
  const startTime = Date.now();
  const apiKey = options.apiKey || process.env.GEMINI_API_KEY;

  if (!isRealGeminiKey(apiKey)) {
    throw new Error('Gemini API Key not configured');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Candidate models: start with gemini-3.1-flash-lite (high availability, sub-second responses, distinct token quota)
  const candidateModels = options.model && options.model !== 'gemini-3.8-flash'
    ? [options.model, 'gemini-3.1-flash-lite', 'gemini-flash-latest']
    : ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: options.systemPrompt,
          temperature: options.temperature ?? 0.7,
        },
      });

      const text = response.text || '';
      const durationMs = Date.now() - startTime;
      const tokensUsed = Math.ceil((prompt.length + text.length) / 4);

      return { text, tokensUsed, durationMs, modelUsed: model };
    } catch (err: any) {
      lastError = err;
      const lower = (err?.message || String(err)).toLowerCase();
      // If temporary high demand spike (503), rate limit (429), quota exhausted, or deprecated (404), try next candidate
      if (
        lower.includes('503') ||
        lower.includes('429') ||
        lower.includes('high demand') ||
        lower.includes('unavailable') ||
        lower.includes('resource_exhausted') ||
        lower.includes('quota') ||
        lower.includes('exceeded') ||
        lower.includes('not_found') ||
        lower.includes('404') ||
        lower.includes('rate')
      ) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('All candidate Gemini models temporarily unavailable');
}
