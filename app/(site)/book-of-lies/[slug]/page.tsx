import React, { useEffect, useState } from 'react';
import EpisodeReader from '@/components/content/EpisodeReader';
import { getBookOfLiesBySlug, getAllBookOfLies, hydrateCustomEpisodes, BookOfLiesEpisode } from '@/lib/data/book-of-lies';

import BrandedErrorFallback from '@/components/ui/BrandedErrorFallback';

function lookupEpisode(slug: string): BookOfLiesEpisode | undefined {
  try {
    return slug ? getBookOfLiesBySlug(slug) : undefined;
  } catch {
    return undefined;
  }
}

export default function BookOfLiesEpisodePage({ params }: { params?: { slug?: string } }) {
  const slug = params?.slug || '';
  const [episode, setEpisode] = useState<BookOfLiesEpisode | undefined>(() => lookupEpisode(slug));
  const [hydrated, setHydrated] = useState(false);

  // Cold deep-links to custom episodes: pull the server list into the local
  // mirror, then re-lookup so the chapter resolves instead of 404-ing.
  useEffect(() => {
    hydrateCustomEpisodes().finally(() => {
      setEpisode(lookupEpisode(slug));
      setHydrated(true);
    });
  }, [slug]);

  if (!episode) {
    if (!hydrated) return null;
    return <BrandedErrorFallback message="This episode could not be found." />;
  }

  const all = getAllBookOfLies();
  const nextIdx = all.length > 0
    ? (all.findIndex((e: BookOfLiesEpisode) => e.id === episode.id) + 1) % all.length
    : 0;
  const nextEp = all[nextIdx];

  return (
    <EpisodeReader
      episode={episode}
      onBack={() => (window.location.href = '/book-of-lies')}
      onNextEpisode={nextEp ? () => (window.location.href = `/book-of-lies/${nextEp.slug}`) : undefined}
    />
  );
}
