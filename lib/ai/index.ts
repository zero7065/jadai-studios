import { callGroq, isGroqConfigured } from './groq';
import { callGemini, isGeminiConfigured } from './gemini';
import { generateCacheKey, getCachedAiResponse, setCachedAiResponse } from './cache';
import { supabaseAdmin } from '../supabase/admin';
import { logger } from '../utils/logger';

export interface GenerateTextOptions {
  systemPrompt?: string;
  moduleSlug?: string;
  userId?: string;
  bypassCache?: boolean;
  isAdmin?: boolean;
  temperature?: number;
  groqKey?: string;
  geminiKey?: string;
}

export interface GenerateTextResult {
  text: string;
  provider: 'groq' | 'gemini' | 'cache' | 'graceful_fallback';
  cached: boolean;
  fallbackTriggered: boolean;
  durationMs: number;
  tokensUsed: number;
  error?: string;
}

/**
 * 4-Step Resilient AI Fallback Chain:
 * 1. Groq (llama-3.3-70b-versatile) — if API key configured
 * 2. Gemini (gemini-3.1-flash-lite / gemini-3.8-flash) — resilient multi-model failover
 * 3. Cached response
 * 4. Graceful degradation message
 */
export async function generateText(
  prompt: string,
  options: GenerateTextOptions = {}
): Promise<GenerateTextResult> {
  const startTime = Date.now();
  const cacheKey = generateCacheKey(prompt, options.systemPrompt);

  let fallbackTriggered = false;
  let providerUsed: GenerateTextResult['provider'] = 'gemini';
  let resultText = '';
  let tokensUsed = 0;
  let finalError: string | undefined;

  // ---------------------------------------------------------------------------
  // Step 1: Try Groq (if configured)
  // ---------------------------------------------------------------------------
  const groqAvailable = isGroqConfigured(options.groqKey);
  if (groqAvailable) {
    try {
      const groqRes = await callGroq(prompt, {
        systemPrompt: options.systemPrompt,
        apiKey: options.groqKey,
        temperature: options.temperature,
      });
      resultText = groqRes.text;
      tokensUsed = groqRes.tokensUsed;
      providerUsed = 'groq';

      setCachedAiResponse(cacheKey, resultText, 'groq', options.isAdmin);
      return {
        text: resultText,
        provider: providerUsed,
        cached: false,
        fallbackTriggered: false,
        durationMs: Date.now() - startTime,
        tokensUsed,
      };
    } catch (groqErr: any) {
      fallbackTriggered = true;
      logger.warn('Groq inference error, initiating fallback to Gemini', { error: groqErr.message });
    }
  }

  // ---------------------------------------------------------------------------
  // Step 2: Try Gemini (with automatic candidate model failover)
  // ---------------------------------------------------------------------------
  try {
    const geminiRes = await callGemini(prompt, {
      systemPrompt: options.systemPrompt,
      apiKey: options.geminiKey,
      temperature: options.temperature,
    });
    resultText = geminiRes.text;
    tokensUsed = geminiRes.tokensUsed;
    providerUsed = 'gemini';

    setCachedAiResponse(cacheKey, resultText, 'gemini', options.isAdmin);
    return {
      text: resultText,
      provider: providerUsed,
      cached: false,
      fallbackTriggered,
      durationMs: Date.now() - startTime,
      tokensUsed,
    };
  } catch (geminiErr: any) {
    logger.warn('Gemini failed, initiating fallback to Cache', { error: geminiErr.message });

    // -------------------------------------------------------------------------
    // Step 3: Fallback to Cached Response or Supabase content_bank
    // -------------------------------------------------------------------------
    const cached = await getCachedAiResponse(cacheKey, options.bypassCache);
    if (cached) {
      resultText = cached.text;
      providerUsed = 'cache';
      tokensUsed = Math.ceil(resultText.length / 4);
    } else {
      try {
        const { data } = await supabaseAdmin
          .from('content_bank')
          .select('content, title')
          .limit(5);

        if (data && data.length > 0) {
          const item = data[Math.floor(Math.random() * data.length)];
          resultText = item.content || item.title || '';
          providerUsed = 'cache';
        }
      } catch {
        // Non-blocking
      }

      if (!resultText) {
        // -----------------------------------------------------------------------
        // Step 4: Graceful Degradation / Queued Message
        // -----------------------------------------------------------------------
        finalError = `Gemini: ${geminiErr?.message || 'Failed'}`;
        resultText = "PRIME is thinking — you're next in line. Formulate your requirements with precision.";
        providerUsed = 'graceful_fallback';
      }
    }
  }

  const durationMs = Date.now() - startTime;

  // Asynchronous audit logging to module_usage
  try {
    await supabaseAdmin.from('module_usage').insert({
      user_id: options.userId || null,
      module_slug: options.moduleSlug || 'ai-core',
      input: {
        prompt: prompt.slice(0, 500),
        cacheKey,
        bypassCache: options.bypassCache,
      },
      output: {
        text: resultText.slice(0, 1000),
      },
      ai_provider: providerUsed,
      tokens_used: tokensUsed,
      duration_ms: durationMs,
      success: providerUsed !== 'graceful_fallback',
      error_message: finalError || null,
    });
  } catch (logErr) {
    // Non-blocking log catch
  }

  return {
    text: resultText,
    provider: providerUsed,
    cached: providerUsed === 'cache',
    fallbackTriggered,
    durationMs,
    tokensUsed,
    error: finalError,
  };
}

export * from './prompts';
export * from './cache';
export * from './groq';
export * from './gemini';
