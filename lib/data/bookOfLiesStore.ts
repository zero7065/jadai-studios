// Server-side Book of Lies custom-episode store — fs-backed, server-only.
// Holds reader-authored parables + admin-created episodes so they survive
// cache clears and reach every device. localStorage stays as the client's
// offline mirror (hydrated from GET /api/book-of-lies/episodes).
// DO NOT import from client components.

import fs from 'fs';
import path from 'path';
import { withStoreLock } from '../utils/storeLock';
import type { BookOfLiesEpisode } from './book-of-lies-anthology';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'book-of-lies-custom.json');

export const MAX_CUSTOM_EPISODES = 200;
const MAX_TITLE = 200;
const MAX_TAGLINE = 300;
const MAX_TEASER = 500;
const MAX_FULL_TEXT = 100_000;

interface CustomEpisodeStore {
  episodes: BookOfLiesEpisode[];
  updatedAt: string;
}

function ensureStore(): CustomEpisodeStore {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(
      STORE_FILE,
      JSON.stringify({ episodes: [], updatedAt: new Date().toISOString() }, null, 2)
    );
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
    return {
      episodes: Array.isArray(parsed.episodes) ? parsed.episodes : [],
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
    };
  } catch {
    return { episodes: [], updatedAt: '' };
  }
}

function persist(store: CustomEpisodeStore): void {
  const tmp = `${STORE_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2));
  fs.renameSync(tmp, STORE_FILE);
}

/** Shape-checks one custom episode. Returns a trimmed copy, or null when invalid. */
export function sanitizeEpisode(raw: unknown): BookOfLiesEpisode | null {
  if (!raw || typeof raw !== 'object') return null;
  const e = raw as Record<string, unknown>;
  if (typeof e.id !== 'string' || !e.id || e.id.length > 64) return null;
  if (typeof e.slug !== 'string' || !e.slug || e.slug.length > 200) return null;
  if (typeof e.title !== 'string' || !e.title.trim() || e.title.length > MAX_TITLE) return null;
  if (typeof e.full_text !== 'string' || !e.full_text.trim() || e.full_text.length > MAX_FULL_TEXT) {
    return null;
  }
  const episode: BookOfLiesEpisode = {
    id: e.id,
    slug: e.slug,
    episode_number:
      typeof e.episode_number === 'number' && Number.isFinite(e.episode_number)
        ? Math.floor(e.episode_number)
        : 0,
    title: e.title.trim(),
    tagline: typeof e.tagline === 'string' ? e.tagline.slice(0, MAX_TAGLINE) : '',
    act: e.act === 2 ? 2 : e.act === 3 ? 3 : 1,
    sin_category: (typeof e.sin_category === 'string' && e.sin_category
      ? e.sin_category
      : 'Discernment') as BookOfLiesEpisode['sin_category'],
    teaser: typeof e.teaser === 'string' ? e.teaser.slice(0, MAX_TEASER) : '',
    full_text: e.full_text,
    published: e.published !== false,
    publish_at: typeof e.publish_at === 'string' ? e.publish_at : new Date().toISOString(),
    views_count: typeof e.views_count === 'number' && Number.isFinite(e.views_count) ? e.views_count : 0,
    likes_count: typeof e.likes_count === 'number' && Number.isFinite(e.likes_count) ? e.likes_count : 0,
    scheduled_for: typeof e.scheduled_for === 'string' ? e.scheduled_for.slice(0, 80) : 'Anytime',
  };
  if (typeof e.cover_image_url === 'string') {
    episode.cover_image_url = e.cover_image_url.slice(0, 500);
  }
  return episode;
}

/** Reads the full custom-episode list (public — canon extension). */
export function getCustomEpisodes(): BookOfLiesEpisode[] {
  return ensureStore().episodes;
}

/** Replaces the whole list (admin create/edit/delete). Invalid entries dropped. */
export async function saveCustomEpisodes(raw: unknown[]): Promise<BookOfLiesEpisode[]> {
  const episodes = raw
    .map(sanitizeEpisode)
    .filter((e): e is BookOfLiesEpisode => e !== null)
    .slice(0, MAX_CUSTOM_EPISODES);
  await withStoreLock('book-of-lies', () => {
    persist({ episodes, updatedAt: new Date().toISOString() });
  });
  return episodes;
}

export type AppendResult =
  | { status: 'added'; episodes: BookOfLiesEpisode[] }
  | { status: 'duplicate'; episodes: BookOfLiesEpisode[] }
  | { status: 'full'; episodes: BookOfLiesEpisode[] }
  | { status: 'invalid' };

/** Appends one reader-authored parable (public author flow). Idempotent by id/slug. */
export async function appendCustomEpisode(raw: unknown): Promise<AppendResult> {
  const episode = sanitizeEpisode(raw);
  if (!episode) return { status: 'invalid' };
  return withStoreLock('book-of-lies', () => {
    const s = ensureStore();
    if (s.episodes.some((e) => e.id === episode.id || e.slug === episode.slug)) {
      return { status: 'duplicate' as const, episodes: s.episodes };
    }
    if (s.episodes.length >= MAX_CUSTOM_EPISODES) {
      return { status: 'full' as const, episodes: s.episodes };
    }
    s.episodes.unshift(episode);
    s.updatedAt = new Date().toISOString();
    persist(s);
    return { status: 'added' as const, episodes: s.episodes };
  });
}
