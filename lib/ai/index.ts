import { callOpenAI, isOpenAIConfigured, isOpenAIQuotaExhausted } from './openai';
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
  openaiKey?: string;
  groqKey?: string;
  geminiKey?: string;
}

export interface GenerateTextResult {
  text: string;
  provider: 'openai' | 'groq' | 'gemini' | 'cache' | 'graceful_fallback';
  cached: boolean;
  fallbackTriggered: boolean;
  durationMs: number;
  tokensUsed: number;
  error?: string;
}

/**
 * 5-Step Resilient AI Fallback Chain:
 * 1. OpenAI (gpt-5-mini → gpt-4o-mini) — PRIMARY provider
 * 2. Groq (openai/gpt-oss-120b → qwen/qwen3.8-27b → …) — first fallback
 * 3. Gemini (gemini-3.1-flash-lite / gemini-3.8-flash) — second fallback
 * 4. Cached response / content_bank
 * 5. Graceful degradation message (labelled, never passed off as model output)
 */
export async function generateText(
  prompt: string,
  options: GenerateTextOptions = {}
): Promise<GenerateTextResult> {
  const startTime = Date.now();
  const cacheKey = generateCacheKey(prompt, options.systemPrompt);

  let fallbackTriggered = false;
  let providerUsed: GenerateTextResult['provider'] = 'openai';
  let resultText = '';
  let tokensUsed = 0;
  let finalError: string | undefined;
  const failureNotes: string[] = [];

  // ---------------------------------------------------------------------------
  // Step 1: OpenAI — PRIMARY (skips itself while cooling down after quota errors)
  // ---------------------------------------------------------------------------
  if (!isOpenAIConfigured(options.openaiKey)) {
    failureNotes.push('OpenAI: key not configured');
  } else if (isOpenAIQuotaExhausted()) {
    failureNotes.push('OpenAI: quota breaker active (escalating backoff — using Groq)');
    fallbackTriggered = true;
  } else {
    try {
      const res = await callOpenAI(prompt, {
        systemPrompt: options.systemPrompt,
        apiKey: options.openaiKey,
        temperature: options.temperature,
      });
      resultText = res.text;
      tokensUsed = res.tokensUsed;
      providerUsed = 'openai';

      setCachedAiResponse(cacheKey, resultText, 'openai', options.isAdmin);
      return {
        text: resultText,
        provider: providerUsed,
        cached: false,
        fallbackTriggered: false,
        durationMs: Date.now() - startTime,
        tokensUsed,
      };
    } catch (openaiErr: any) {
      fallbackTriggered = true;
      failureNotes.push(`OpenAI: ${openaiErr.message}`);
      logger.warn('OpenAI inference error, falling back to Groq', { error: openaiErr.message });
    }
  }

  // ---------------------------------------------------------------------------
  // Step 2: Groq — first fallback
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
        fallbackTriggered,
        durationMs: Date.now() - startTime,
        tokensUsed,
      };
    } catch (groqErr: any) {
      fallbackTriggered = true;
      failureNotes.push(`Groq: ${groqErr.message}`);
      logger.warn('Groq inference error, initiating fallback to Gemini', { error: groqErr.message });
    }
  } else {
    failureNotes.push('Groq: key not configured');
  }

  // ---------------------------------------------------------------------------
  // Step 3: Gemini — second fallback (only attempted when configured)
  // ---------------------------------------------------------------------------
  if (!isGeminiConfigured(options.geminiKey)) {
    failureNotes.push('Gemini: key not configured');
  } else {
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
      logger.warn('Gemini inference error', { error: geminiErr.message });
      failureNotes.push(`Gemini: ${geminiErr.message}`);
    }
  }

  // ---------------------------------------------------------------------------
  // Step 4: Cached response / Supabase content_bank
  // ---------------------------------------------------------------------------
  {
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
          const bankText = item.content || item.title || '';
          if (bankText) {
            // Labelled as archive material — never presented as a live answer.
            resultText = `[OFFLINE ARCHIVE — related reading, not an answer to this prompt]\n\n${bankText}`;
            providerUsed = 'cache';
            fallbackTriggered = true;
          }
        }
      } catch {
        // Non-blocking
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Step 5: Graceful degradation — labelled offline, never fake model output
  // ---------------------------------------------------------------------------
  if (!resultText) {
    finalError = failureNotes.join(' | ') || 'No AI provider available';
    resultText = "PRIME is thinking — you're next in line. Formulate your requirements with precision.";
    providerUsed = 'graceful_fallback';
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
export * from './openai';
export * from './groq';
export * from './gemini';
