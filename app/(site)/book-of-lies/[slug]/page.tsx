import React from 'react';
import EpisodeReader from '@/components/content/EpisodeReader';
import { getBookOfLiesBySlug, getAllBookOfLies, BookOfLiesEpisode } from '@/lib/data/book-of-lies';

import BrandedErrorFallback from '@/components/ui/BrandedErrorFallback';

export default function BookOfLiesEpisodePage({ params }: { params?: { slug?: string } }) {
  const slug = params?.slug || '';
  let episode;
  try {
    episode = slug ? getBookOfLiesBySlug(slug) : undefined;
  } catch {
    return <BrandedErrorFallback message="This chapter could not load." />;
  }

  if (!episode) {
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
