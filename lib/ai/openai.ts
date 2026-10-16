import { logger } from '../utils/logger';
import { isOpenAIKey } from '../config/envTrust';

export interface OpenAIGenerationOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
}

// Ordered candidates: capable first, cheap-fast second.
// gpt-5* reasoning models use `max_completion_tokens`; older models use `max_tokens`.
export const OPENAI_MODEL_CANDIDATES = ['gpt-5-mini', 'gpt-4o-mini'] as const;
export const OPENAI_PRIMARY_MODEL = OPENAI_MODEL_CANDIDATES[0];

// Circuit breaker: when the org runs out of credits every call would burn a round-trip
// just to receive 429 credit_balance_exhausted. After the first such error, pause
// OpenAI attempts so the chain falls through to Groq instantly.
// Escalating backoff: a genuinely dead key gets probed less and less often
// (10min → 30min → 2h → 6h cap), and ANY successful call resets the breaker
// immediately — add credits and the provider comes back without a restart.
const QUOTA_COOLDOWN_STEPS_MS = [
  10 * 60 * 1000, // 1st failure: 10 min
  30 * 60 * 1000, // 2nd: 30 min
  2 * 60 * 60 * 1000, // 3rd: 2 hours
  6 * 60 * 60 * 1000, // 4th+: 6 hours (cap)
];
let quotaFailureStreak = 0;
let quotaExhaustedUntil = 0;

export function isOpenAIQuotaExhausted(): boolean {
  return Date.now() < quotaExhaustedUntil;
}

function markQuotaExhausted(reason: string): void {
  const step = Math.min(quotaFailureStreak, QUOTA_COOLDOWN_STEPS_MS.length - 1);
  const waitMs = QUOTA_COOLDOWN_STEPS_MS[step];
  quotaFailureStreak += 1;
  quotaExhaustedUntil = Date.now() + waitMs;
  logger.warn(
    `OpenAI quota exhausted (streak ${quotaFailureStreak}) — pausing OpenAI attempts for ${Math.round(waitMs / 60000)} min`,
    { reason }
  );
}

/** Report a quota/credit failure from ANY OpenAI surface (text, images, search). */
export function reportOpenAIQuotaError(reason: string): void {
  markQuotaExhausted(reason);
}

/** Called after any successful OpenAI response — re-arms the provider at once. */
function reportOpenAIRecovered(): void {
  if (quotaFailureStreak > 0) {
    logger.info('OpenAI credits available again — quota breaker reset', {
      previousStreak: quotaFailureStreak,
    });
  }
  quotaFailureStreak = 0;
  quotaExhaustedUntil = 0;
}

/**
 * One-tiny-request credits probe, fired once at server boot. If the key has
 * no credits the breaker parks OpenAI BEFORE the first live user request
 * touches it; if it succeeds the breaker is confirmed clear.
 */
export async function probeOpenAICredits(): Promise<boolean> {
  if (!isOpenAIConfigured()) return false;
  if (isOpenAIQuotaExhausted()) return false;
  try {
    await callOpenAI('Reply with the single word: ok', { maxTokens: 5, temperature: 0 });
    return true;
  } catch {
    // Quota errors already armed the breaker inside callOpenAI; other errors
    // (network, model) are transient and must not park the provider.
    return false;
  }
}

export function isOpenAIConfigured(customKey?: string): boolean {
  const key = customKey || process.env.OPENAI_API_KEY;
  if (!isOpenAIKey(key)) return false;
  // Key present but known-exhausted: still "configured", just temporarily paused.
  return true;
}

async function attemptOpenAI(
  model: string,
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
  options: OpenAIGenerationOptions
): Promise<{ text: string; tokensUsed: number }> {
  const isReasoning = model.startsWith('gpt-5');
  const body: Record<string, any> = {
    model,
    messages,
    temperature: options.temperature ?? 0.7,
  };
  if (isReasoning) {
    body.max_completion_tokens = options.maxTokens ?? 4096;
  } else {
    body.max_tokens = options.maxTokens ?? 4096;
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    let parsed: any = null;
    try {
      parsed = JSON.parse(errorBody);
    } catch {}
    const code = parsed?.error?.code || '';
    const err: any = new Error(
      `OpenAI failure (${model}): HTTP ${response.status} - ${parsed?.error?.message || errorBody}`
    );
    err.httpStatus = response.status;
    err.quotaExhausted =
      code === 'insufficient_quota' ||
      code === 'credit_balance_exhausted' ||
      errorBody.includes('credit_balance_exhausted') ||
      errorBody.includes('insufficient_quota');
    // Model gone (404) or bad request on this candidate → try the next candidate.
    err.tryNextModel = response.status === 404 || response.status === 400;
    throw err;
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  const tokensUsed = data.usage?.total_tokens || 0;

  if (!text.trim()) {
    const err: any = new Error(`OpenAI returned empty content for ${model}`);
    err.tryNextModel = true;
    throw err;
  }

  return { text, tokensUsed };
}

export async function callOpenAI(
  prompt: string,
  options: OpenAIGenerationOptions = {}
): Promise<{ text: string; tokensUsed: number; durationMs: number }> {
  const startTime = Date.now();
  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;

  if (!isOpenAIKey(apiKey)) {
    throw new Error('OpenAI API Key not configured');
  }
  if (isOpenAIQuotaExhausted()) {
    const err: any = new Error('OpenAI quota exhausted (cooling down)');
    err.quotaExhausted = true;
    throw err;
  }

  const messages: Array<{ role: string; content: string }> = [];
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  let lastError: any = null;

  for (const model of OPENAI_MODEL_CANDIDATES) {
    try {
      const result = await attemptOpenAI(model, apiKey as string, messages, options);
      const durationMs = Date.now() - startTime;
      reportOpenAIRecovered();
      if (lastError) {
        logger.warn('OpenAI recovered on fallback model', { model, previous: lastError.message });
      }
      return { text: result.text, tokensUsed: result.tokensUsed, durationMs };
    } catch (err: any) {
      lastError = err;
      if (err.quotaExhausted) {
        markQuotaExhausted(err.message);
        break; // out of credits — no point trying other models
      }
      if (err.httpStatus === 401 || err.httpStatus === 403) break; // bad key
      if (!err.tryNextModel && err.httpStatus !== 429) break; // unknown hard failure
      logger.warn('OpenAI candidate failed, trying next', { model, error: err.message });
    }
  }

  throw lastError || new Error('OpenAI: all model candidates failed');
}
