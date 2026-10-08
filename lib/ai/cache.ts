import crypto from 'crypto';
import { supabaseAdmin } from '../supabase/admin';
import { logger } from '../utils/logger';

interface CacheEntry {
  response: string;
  provider: string;
  createdAt: number;
  ttlMs: number;
}

// In-memory cache for ultra-fast local hits
const memoryCache = new Map<string, CacheEntry>();

export function generateCacheKey(prompt: string, systemPrompt?: string): string {
  const payload = `${prompt.trim()}::${(systemPrompt || '').trim()}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Retrieves a response from the cache unless bypassed.
 */
export async function getCachedAiResponse(
  key: string,
  bypassCache: boolean = false
): Promise<{ text: string; provider: string } | null> {
  if (bypassCache) {
    return null;
  }

  // 1. Check in-memory cache
  const memoryHit = memoryCache.get(key);
  if (memoryHit) {
    if (Date.now() - memoryHit.createdAt < memoryHit.ttlMs) {
      return { text: memoryHit.response, provider: `cache:memory(${memoryHit.provider})` };
    }
    memoryCache.delete(key);
  }

  // 2. Check Supabase module_usage cache
  try {
    const { data, error } = await supabaseAdmin
      .from('module_usage')
      .select('output, ai_provider, created_at')
      .contains('input', { cacheKey: key })
      .eq('success', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data && data.output?.text) {
      const entryAge = Date.now() - new Date(data.created_at).getTime();
      const maxAgeMs = 24 * 60 * 60 * 1000; // 24 hours max
      if (entryAge < maxAgeMs) {
        // Hydrate memory cache
        memoryCache.set(key, {
          response: data.output.text,
          provider: data.ai_provider || 'cached',
          createdAt: Date.now(),
          ttlMs: 60 * 60 * 1000,
        });
        return { text: data.output.text, provider: `cache:db(${data.ai_provider})` };
      }
    }
  } catch (err) {
    logger.warn('Cache DB lookup skipped due to transient connection');
  }

  return null;
}

/**
 * Saves a generated response to cache.
 */
export function setCachedAiResponse(
  key: string,
  response: string,
  provider: string,
  isAdmin: boolean = false
): void {
  const ttlMs = isAdmin ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
  memoryCache.set(key, {
    response,
    provider,
    createdAt: Date.now(),
    ttlMs,
  });
}

/**
 * Invalidation trigger: cleared when admin settings change or on demand.
 */
export function invalidateAiCache(): void {
  memoryCache.clear();
  logger.info('AI Response Cache invalidated');
}
