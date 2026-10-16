import {
  MASTER_40_EPISODES,
  BookOfLiesEpisode,
  getBookOfLiesBySlug as getBaseEpisodeBySlug,
  getAllBookOfLies as getBaseAllEpisodes,
} from './book-of-lies-anthology';
import { ADDITIONAL_30_EPISODES } from './book-of-lies-30-tales';

export type { BookOfLiesEpisode };

/**
 * 70 COMPREHENSIVE CANONICAL EPISODES
 * Combining the Master 40 with the 30 new relatable and mirrorable parables
 */
export const ALL_CANONICAL_EPISODES: BookOfLiesEpisode[] = [
  ...MASTER_40_EPISODES,
  ...ADDITIONAL_30_EPISODES,
];

export const MASTER_EPISODES = ALL_CANONICAL_EPISODES;
export const SEED_BOOK_OF_LIES = ALL_CANONICAL_EPISODES;
export const BOOK_OF_LIES = ALL_CANONICAL_EPISODES;

export function getBookOfLiesBySlug(slug: string): BookOfLiesEpisode | undefined {
  if (!slug) return undefined;
  if (typeof window !== 'undefined') {
    try {
      const customStr = localStorage.getItem('jadai_custom_episodes');
      if (customStr) {
        const customList: BookOfLiesEpisode[] = JSON.parse(customStr);
        const match = customList.find(
          (e) => e && (e.slug === slug || String(e.episode_number) === slug || e.id === slug)
        );
        if (match) return match;
      }
    } catch {}
  }
  return ALL_CANONICAL_EPISODES.find(
    (e) => e && (e.slug === slug || String(e.episode_number) === slug || e.id === slug)
  );
}

/**
 * Pulls the server's shared custom-episode list into the localStorage mirror
 * that the sync readers above consult. Call once on mount from the Book pages.
 * Server wins when non-empty; an empty server list keeps device-local
 * (possibly unsynced) episodes instead of wiping them.
 */
export async function hydrateCustomEpisodes(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const res = await fetch('/api/book-of-lies/episodes');
    if (!res.ok) return false;
    const data = await res.json();
    if (!data?.success || !Array.isArray(data.episodes)) return false;
    if (data.episodes.length > 0) {
      localStorage.setItem('jadai_custom_episodes', JSON.stringify(data.episodes));
    }
    return true;
  } catch {
    return false;
  }
}

export function getAllBookOfLies(filters?: { sin?: string; act?: number }): BookOfLiesEpisode[] {
  let list = [...ALL_CANONICAL_EPISODES.filter(Boolean)];
  if (typeof window !== 'undefined') {
    try {
      const customStr = localStorage.getItem('jadai_custom_episodes');
      if (customStr) {
        const customList: BookOfLiesEpisode[] = JSON.parse(customStr);
        list = [...customList, ...list];
      }
    } catch {}
  }
  if (filters?.sin && filters.sin !== 'All') {
    list = list.filter((e) => e.sin_category && e.sin_category.toLowerCase() === filters.sin?.toLowerCase());
  }
  if (filters?.act) {
    list = list.filter((e) => e.act === filters.act);
  }
  return list;
}

export { MASTER_40_EPISODES };

export interface PersonalBookSynthesis {
  title: string;
  authorName: string;
  generatedAt: string;
  prologue: string;
  reflectionsCount: number;
  featuredThemes: string[];
  chapters: Array<{
    episodeTitle: string;
    episodeNumber: number;
    sinCategory: string;
    userReflection: string;
    epilogueQuote: string;
  }>;
}

export function synthesizePersonalBook(
  userName: string,
  userReflections: Record<string, string>
): PersonalBookSynthesis {
  const reflectedEpisodes = Object.entries(userReflections)
    .filter(([_, reflection]) => reflection && reflection.trim().length > 0)
    .map(([slug, reflection]) => {
      const ep = getBookOfLiesBySlug(slug);
      return {
        episodeTitle: ep?.title || 'Meditations in the Quarry',
        episodeNumber: ep?.episode_number || 1,
        sinCategory: ep?.sin_category || 'Discernment',
        userReflection: reflection,
        epilogueQuote: ep?.tagline || 'Build the floor first.',
      };
    });

  const categories = Array.from(new Set(reflectedEpisodes.map((e) => e.sinCategory)));

  return {
    title: `The Book of Lies: Personal Testament of ${userName}`,
    authorName: userName,
    generatedAt: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    prologue: `To read is to inspect another man's blueprints. To reflect is to quarry your own stone. This personal codex records the confrontation between vanity and foundation, synthesized under the seal of Jadai Studios.`,
    reflectionsCount: reflectedEpisodes.length,
    featuredThemes: categories.length > 0 ? categories : ['Discernment', 'Foundation'],
    chapters: reflectedEpisodes,
  };
}
