import { logger } from '../utils/logger';

export interface GroqGenerationOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
}

export function isGroqConfigured(customKey?: string): boolean {
  const apiKey = customKey || process.env.GROQ_API_KEY;
  return Boolean(apiKey && !apiKey.startsWith('[SET_IN_') && apiKey.trim() !== '');
}

export async function callGroq(
  prompt: string,
  options: GroqGenerationOptions = {}
): Promise<{ text: string; tokensUsed: number; durationMs: number }> {
  const startTime = Date.now();
  const apiKey = options.apiKey || process.env.GROQ_API_KEY;

  if (!apiKey || apiKey.startsWith('[SET_IN_') || apiKey.trim() === '') {
    throw new Error('Groq API Key not configured');
  }

  const messages: Array<{ role: string; content: string }> = [];
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    logger.warn(`Groq API returned HTTP ${response.status}`, { errorBody });
    throw new Error(`Groq API failure: HTTP ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  const tokensUsed = data.usage?.total_tokens || 0;
  const durationMs = Date.now() - startTime;

  return { text, tokensUsed, durationMs };
}
