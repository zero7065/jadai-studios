import React from 'react';
import GlassCard from '../../components/ui/GlassCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { BOOK_EPISODES } from './data';

export default function BookOfLiesPage() {
  return (
    <div className="py-12 px-4 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#C0392B]">Philosophical Canon</span>
          <h1 className="text-3xl font-display text-[#f5f3f0] mt-1">The Book of Lies</h1>
        </div>
        <StatusBadge status="Live" variant="crimson" />
      </div>

      <GlassCard className="p-6 space-y-3" glowColor="crimson">
        <p className="text-sm text-[#c4c0bb] leading-relaxed">
          Philosophical fiction, daily wisdom transmissions, and moral puzzles delivered nightly at 9:47 PM.
        </p>
        <p className="text-xs font-mono text-[#8a857e]">
          Canon table of contents below — entries marked scheduled publish through the 21:47 transmission cadence.
        </p>
      </GlassCard>

      <div className="space-y-3">
        {BOOK_EPISODES.map((episode) => (
          <GlassCard key={episode.id} className="p-5" glowColor="crimson">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-mono text-[#C0392B] border border-[rgba(192,57,43,0.4)] px-1.5 py-0.5">
                    NO. {String(episode.number).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a857e]">
                    {episode.theme}
                  </span>
                </div>
                <h2 className="font-display font-bold text-[#f5f3f0]">{episode.title}</h2>
                <p className="text-sm text-[#c4c0bb] leading-relaxed">{episode.summary}</p>
                <p className="text-[11px] font-mono text-[#8a6e2a]">
                  Transmission {episode.transmission} · {episode.readingMinutes} min read
                </p>
              </div>
              <StatusBadge
                status={episode.status === 'scheduled' ? 'Scheduled' : 'In Draft'}
                variant={episode.status === 'scheduled' ? 'crimson' : 'dim'}
              />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
