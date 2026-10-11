import { supabaseAdmin, isSupabaseConfigured } from './supabase/admin';

// Shared short-link core: the Express routes (/api/short/create, /s/:slug,
// /api/short/stats) and the SENTINEL module API handler all operate on the
// same store. Memory-first for zero-latency redirects, Supabase for durability.

export interface ShortLinkRecord {
  slug: string;
  targetUrl: string;
  clicks: number;
  cloaked: boolean;
  pageTitle: string;
  description: string;
  createdAt: string;
}

export const shortLinksDb = new Map<string, ShortLinkRecord>();

function randomSlug(): string {
  const bytes = new Uint8Array(6); // 48 bits of entropy, 12 hex chars
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export type CreateShortLinkResult =
  | { ok: true; record: ShortLinkRecord }
  | { ok: false; status: number; error: string };

export async function createShortLink(params: {
  targetUrl?: unknown;
  customSlug?: unknown;
  cloaked?: unknown;
  pageTitle?: unknown;
  description?: unknown;
}): Promise<CreateShortLinkResult> {
  let parsed: URL;
  try {
    parsed = new URL(String(params.targetUrl));
  } catch {
    return { ok: false, status: 400, error: 'Invalid target URL' };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, status: 400, error: 'Only http(s) target URLs are allowed' };
  }

  let slug: string;
  if (params.customSlug) {
    slug = String(params.customSlug)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 40);
    if (!slug) return { ok: false, status: 400, error: 'Invalid custom slug' };
    if (shortLinksDb.has(slug)) return { ok: false, status: 409, error: 'Slug already in use' };
  } else {
    slug = randomSlug();
  }

  const record: ShortLinkRecord = {
    slug,
    targetUrl: parsed.toString(),
    clicks: 0,
    cloaked: Boolean(params.cloaked),
    pageTitle: String(params.pageTitle || 'Sovereign Cloaked Link // Jadai Sentinel').slice(0, 200),
    description: String(
      params.description || 'Cryptographically cloaked link protected by Jadai Sentinel.'
    ).slice(0, 400),
    createdAt: new Date().toISOString(),
  };

  shortLinksDb.set(slug, record);

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabaseAdmin.from('short_links').insert({
        slug,
        target_url: record.targetUrl,
        cloaked: record.cloaked,
      });
      if (error && error.code === '23505') {
        shortLinksDb.delete(slug);
        return { ok: false, status: 409, error: 'Slug already in use' };
      }
    } catch {
      // Memory record still serves this session; durability degrades gracefully.
    }
  }

  return { ok: true, record };
}
