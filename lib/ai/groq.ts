import { logger } from '../utils/logger';
import { isRealGroqKey } from '../config/envTrust';

export interface GroqGenerationOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
}

// Groq retires models without notice (llama-3.3-70b-versatile returned 404 on
// 2026-10-09). Keep an ordered candidate list: strongest first, fast fallbacks after.
// gpt-oss models are reasoning models — they burn completion tokens on chain-of-thought,
// so they get a higher default max_tokens and an empty-content retry on the next candidate.
export const GROQ_MODEL_CANDIDATES = [
  'openai/gpt-oss-120b',
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-20b',
  'allam-2-7b',
] as const;

export const GROQ_PRIMARY_MODEL = GROQ_MODEL_CANDIDATES[0];

export function isGroqConfigured(customKey?: string): boolean {
  return isRealGroqKey(customKey || process.env.GROQ_API_KEY);
}

async function attemptGroq(
  model: string,
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
  options: GroqGenerationOptions
): Promise<{ text: string; tokensUsed: number }> {
  // Reasoning models need headroom for internal thinking before the visible answer.
  const reasoningModel = model.includes('gpt-oss');
  const maxTokens = options.maxTokens ?? (reasoningModel ? 6144 : 4096);

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    const err: any = new Error(`Groq failure (${model}): HTTP ${response.status} - ${errorBody}`);
    err.httpStatus = response.status;
    err.modelNotFound = response.status === 404 || errorBody.includes('model_not_found');
    throw err;
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  const tokensUsed = data.usage?.total_tokens || 0;

  // Reasoning models can exhaust max_tokens mid-thought and return empty content.
  if (!text.trim()) {
    const err: any = new Error(`Groq returned empty content for ${model}`);
    err.emptyContent = true;
    err.modelNotFound = true; // treat as "try next candidate"
    throw err;
  }

  return { text, tokensUsed };
}

export async function callGroq(
  prompt: string,
  options: GroqGenerationOptions = {}
): Promise<{ text: string; tokensUsed: number; durationMs: number }> {
  const startTime = Date.now();
  const apiKey = options.apiKey || process.env.GROQ_API_KEY;

  if (!isRealGroqKey(apiKey)) {
    throw new Error('Groq API Key not configured');
  }

  const messages: Array<{ role: string; content: string }> = [];
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  let lastError: any = null;

  for (const model of GROQ_MODEL_CANDIDATES) {
    try {
      const result = await attemptGroq(model, apiKey as string, messages, options);
      const durationMs = Date.now() - startTime;
      if (lastError) {
        logger.warn('Groq recovered on fallback model', { model, previous: lastError.message });
      }
      return { text: result.text, tokensUsed: result.tokensUsed, durationMs };
    } catch (err: any) {
      lastError = err;
      // Auth errors (401/403) are key problems — no point trying other models.
      if (err.httpStatus === 401 || err.httpStatus === 403) break;
      logger.warn(`Groq candidate failed, trying next`, { model, error: err.message });
    }
  }

  throw lastError || new Error('Groq: all model candidates failed');
}

/**
 * Streams a Groq chat completion token-by-token.
 * Calls `onToken` for each content delta; resolves with the full assembled text.
 * Uses non-reasoning models first so tokens appear immediately (reasoning models
 * burn 10-60s on chain-of-thought before emitting visible content — bad UX for chat).
 */
export async function streamGroq(
  prompt: string,
  options: GroqGenerationOptions & {
    onToken: (delta: string) => void;
    signal?: AbortSignal;
  }
): Promise<{ text: string; model: string }> {
  const apiKey = options.apiKey || process.env.GROQ_API_KEY;
  if (!isRealGroqKey(apiKey)) {
    throw new Error('Groq API Key not configured');
  }

  const messages: Array<{ role: string; content: string }> = [];
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  // Streaming order: non-reasoning first (instant tokens), reasoning as last resort.
  const streamCandidates = [
    'qwen/qwen3.8-27b',
    'allam-2-7b',
    'openai/gpt-oss-20b',
    'openai/gpt-oss-120b',
  ];

  let lastError: any = null;

  for (const model of streamCandidates) {
    const reasoningModel = model.includes('gpt-oss');
    const maxTokens = options.maxTokens ?? (reasoningModel ? 4096 : 2048);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: maxTokens,
          stream: true,
        }),
        signal: options.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        const err: any = new Error(`Groq stream failure (${model}): HTTP ${response.status} - ${errorBody}`);
        err.httpStatus = response.status;
        throw err;
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Groq stream: no response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      // SSE lines look like: data: {...}\n\n  or  data: [DONE]\n\n
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === '[DONE]') continue;
          try {
            const json = JSON.parse(payload);
            const choice = json.choices?.[0];
            // Reasoning models (gpt-oss) emit chain-of-thought in reasoning_content
            // before the visible answer lands in content — skip CoT, stream content only.
            const delta = choice?.delta?.content || '';
            if (delta) {
              fullText += delta;
              options.onToken(delta);
            }
          } catch {
            // Partial JSON across chunk boundaries — skip until next complete line.
          }
        }
      }

      if (!fullText.trim()) {
        const err: any = new Error(`Groq stream returned empty content for ${model}`);
        err.emptyContent = true;
        throw err;
      }

      return { text: fullText, model };
    } catch (err: any) {
      if (err.name === 'AbortError') throw err; // caller cancelled — don't fall through
      lastError = err;
      if (err.httpStatus === 401 || err.httpStatus === 403) break;
      logger.warn(`Groq stream candidate failed, trying next`, { model, error: err.message });
    }
  }

  throw lastError || new Error('Groq stream: all model candidates failed');
}
