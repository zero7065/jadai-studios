'use client';

import React, { useState } from 'react';
import GlassCard from '../ui/GlassCard';
import EdgeGlow from '../ui/EdgeGlow';
import LikeButton from '../ui/LikeButton';
import RotatableCard3D from '../ui/RotatableCard3D';
import type { BookOfLiesEpisode } from '../../lib/data/book-of-lies';
import { BookOpen, Maximize2, Clock, Heart, RotateCw, Sparkles, Compass } from 'lucide-react';
import { StudioAudio } from '../../lib/watermark';

export interface BookOfLiesCardProps {
  episode: BookOfLiesEpisode;
  position?: 'center' | 'left' | 'right' | 'hidden';
  onRead: (episode: BookOfLiesEpisode) => void;
  onClick?: () => void;
  totalEpisodes?: number;
}

// Geometric vector diagram generator for each Sin/Parable
function SinPhilosophicalDiagram({ sin }: { sin: string }) {
  const lower = sin.toLowerCase();

  if (lower === 'pride') {
    // Ascending fractal pyramids / spire
    return (
      <svg viewBox="0 0 100 100" className="w-24 h-24 stroke-[#C9A84C] fill-none opacity-85">
        <polygon points="50,10 90,85 10,85" strokeWidth="1.5" strokeDasharray="3 2" />
        <polygon points="50,28 78,80 22,80" strokeWidth="1.2" />
        <polygon points="50,45 68,75 32,75" strokeWidth="1.5" />
        <circle cx="50" cy="10" r="3" fill="#e8c96a" />
        <line x1="50" y1="10" x2="50" y2="85" strokeWidth="1" strokeOpacity="0.5" />
      </svg>
    );
  }

  if (lower === 'envy') {
    // Interlocking dual mirror spheres
    return (
      <svg viewBox="0 0 100 100" className="w-24 h-24 stroke-[#27ae60] fill-none opacity-85">
        <circle cx="40" cy="50" r="28" strokeWidth="1.5" />
        <circle cx="60" cy="50" r="28" strokeWidth="1.5" strokeDasharray="4 2" />
        <path d="M 50,28 A 28 28 0 0 1 50,72 A 28 28 0 0 1 50,28" stroke="#e8c96a" strokeWidth="1.5" />
        <circle cx="40" cy="50" r="2" fill="#27ae60" />
        <circle cx="60" cy="50" r="2" fill="#e8c96a" />
      </svg>
    );
  }

  if (lower === 'wrath') {
    // Radiating kinetic blade triangle
    return (
      <svg viewBox="0 0 100 100" className="w-24 h-24 stroke-[#C0392B] fill-none opacity-85">
        <polygon points="50,8 92,88 8,88" strokeWidth="1.5" />
        <polygon points="50,92 8,12 92,12" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="50" cy="50" r="16" stroke="#e8c96a" strokeWidth="1.5" />
        <line x1="50" y1="20" x2="50" y2="80" strokeWidth="1.5" />
        <line x1="20" y1="50" x2="80" y2="50" strokeWidth="1.5" />
      </svg>
    );
  }

  if (lower === 'sloth') {
    // Dissolving horizontal balance vectors
    return (
      <svg viewBox="0 0 100 100" className="w-24 h-24 stroke-[#2980b9] fill-none opacity-85">
        <ellipse cx="50" cy="50" rx="38" ry="14" strokeWidth="1.5" />
        <ellipse cx="50" cy="50" rx="26" ry="8" strokeWidth="1.2" strokeDasharray="3 2" />
        <line x1="12" y1="50" x2="88" y2="50" strokeWidth="1.5" stroke="#e8c96a" />
        <circle cx="50" cy="50" r="3" fill="#38bdf8" />
      </svg>
    );
  }

  if (lower === 'greed') {
    // Golden ratio spiral vortex
    return (
      <svg viewBox="0 0 100 100" className="w-24 h-24 stroke-[#C9A84C] fill-none opacity-85">
        <circle cx="50" cy="50" r="38" strokeWidth="1" strokeDasharray="2 3" />
        <polygon points="50,15 85,50 50,85 15,50" strokeWidth="1.5" />
        <polygon points="50,28 72,50 50,72 28,50" strokeWidth="1.2" />
        <circle cx="50" cy="50" r="6" fill="#e8c96a" />
      </svg>
    );
  }

  // Default: Lemniscate / Metatron cube ring
  return (
    <svg viewBox="0 0 100 100" className="w-24 h-24 stroke-[#e8c96a] fill-none opacity-85">
      <circle cx="50" cy="50" r="32" strokeWidth="1.5" />
      <polygon points="50,18 78,66 22,66" strokeWidth="1.2" />
      <polygon points="50,82 22,34 78,34" strokeWidth="1.2" />
      <circle cx="50" cy="50" r="4" fill="#C9A84C" />
    </svg>
  );
}

export const BookOfLiesCard: React.FC<BookOfLiesCardProps> = ({
  episode,
  position = 'center',
  onRead,
  onClick,
  totalEpisodes = 7,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!episode) return null;

  const isCenter = position === 'center';

  const positionStyles = {
    center: 'z-30 scale-100 rotate-y-0 opacity-100 shadow-[0_25px_60px_rgba(192,57,43,0.35)] border-[#C9A84C]',
    left: 'z-10 scale-90 -translate-x-12 sm:-translate-x-24 rotate-y-[25deg] blur-[3px] opacity-60 origin-right cursor-pointer border-[rgba(201,168,76,0.2)]',
    right: 'z-10 scale-90 translate-x-12 sm:translate-x-24 -rotate-y-[25deg] blur-[3px] opacity-60 origin-left cursor-pointer border-[rgba(201,168,76,0.2)]',
    hidden: 'hidden',
  };

  const actBadgeStyles = {
    1: 'border-[#C9A84C] text-[#C9A84C] bg-[rgba(201,168,76,0.1)]',
    2: 'border-[#C0392B] text-[#C0392B] bg-[rgba(192,57,43,0.12)]',
    3: 'border-[#e8c96a] text-[#e8c96a] bg-[rgba(232,201,106,0.15)]',
  };

  const actNumber = episode.act || 1;
  const epNumber = episode.episode_number ?? 1;
  const readTime = `${Math.max(3, Math.ceil(episode.full_text?.length / 500) || 4)} min read`;

  // Sin theological lessons & architectural invariant translations
  const philosophicalTranslations: Record<string, { invariant: string; lesson: string }> = {
    Pride: {
      invariant: 'The Grounded Invariant',
      lesson: 'Ambition uncoupled from physical limits cracks the foundation. Software must honor its cold constraints.',
    },
    Envy: {
      invariant: 'The Studio Equilibrium',
      lesson: 'Imitating another architect’s facade ensures you build their unexamined debts. Create from bedrock.',
    },
    Wrath: {
      invariant: 'The Socratic Temper',
      lesson: 'Reactive velocity burns state. True engineering discipline is cold, deliberate, and mathematically measured.',
    },
    Sloth: {
      invariant: 'The Clean Code Doctrine',
      lesson: 'Lazy placeholders in turn zero are debts you pass to your future self. Confront all edge cases immediately.',
    },
    Greed: {
      invariant: 'The Fiduciary Foundation',
      lesson: 'Extracting short-term margin by shipping brittle scaffolding is an ethical failure. Build the floor.',
    },
    Gluttony: {
      invariant: 'The Lightweight Mandate',
      lesson: 'Heavy external bloat suffocates the edge. The user in Jos on 3G deserves sub-second perfection.',
    },
    Lust: {
      invariant: 'The Depth Principle',
      lesson: 'Superficial aesthetic sparkle without architectural integrity is vanity. True beauty is durable truth.',
    },
  };

  const translation = philosophicalTranslations[episode.sin_category] || {
    invariant: 'The Durable Invariant',
    lesson: 'Software that vanishes when the signal cuts is merely a lease on another server. Build for disconnect.',
  };

  return (
    <div
      onClick={!isCenter && onClick ? onClick : undefined}
      style={{
        transformStyle: 'preserve-3d',
        transition: 'all 500ms cubic-bezier(0.25, 1, 0.5, 1)',
      }}
      className={`w-full max-w-md select-none transition-all duration-500 ${positionStyles[position]}`}
    >
      <EdgeGlow
        intensity={isCenter ? 'intense' : 'subtle'}
        color="crimson"
        borderRadius={28}
        pulse={isCenter}
        className="w-full"
      >
        <RotatableCard3D
          flipLabel="Philosophical Invariant"
          isFlippedControlled={isCenter ? isFlipped : false}
          onFlipToggle={(f) => setIsFlipped(f)}
          front={
            <div className="p-7 relative overflow-hidden flex flex-col justify-between h-[510px] rounded-3xl border border-[rgba(201,168,76,0.35)] shadow-2xl bg-[#0a0908] w-full text-left">
              {/* Warm crimson-to-void ambient overlay + Cover Artwork Texture */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20 bg-cover bg-center transition-all duration-700"
                style={{
                  backgroundImage: episode.cover_image_url
                    ? `url(${episode.cover_image_url})`
                    : `url(https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80)`,
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none opacity-90"
                style={{
                  background: isCenter
                    ? 'linear-gradient(180deg, rgba(192,57,43,0.55) 0%, rgba(5,4,4,0.92) 65%, #050404 100%)'
                    : 'linear-gradient(180deg, rgba(192,57,43,0.3) 0%, #050404 100%)',
                }}
              />

              {/* Top Floating Control Bar */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono tracking-widest text-[#e8c96a] uppercase px-2.5 py-0.5 rounded-full bg-black/60 border border-[rgba(201,168,76,0.3)]">
                    EPISODE #{String(epNumber).padStart(3, '0')}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border uppercase tracking-widest ${
                      actBadgeStyles[actNumber] || actBadgeStyles[1]
                    }`}
                  >
                    ACT {actNumber === 1 ? 'I' : actNumber === 2 ? 'II' : 'III'}
                  </span>
                </div>

                {isCenter && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRead(episode);
                    }}
                    className="px-3 py-1 rounded-full bg-black/70 hover:bg-[#C0392B] backdrop-blur-md border border-[rgba(201,168,76,0.4)] text-[#f5f3f0] text-[10px] font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Maximize2 className="w-3 h-3 text-[#C9A84C]" />
                    <span>Expand</span>
                  </button>
                )}
              </div>

              {/* Center Visual Area + Sacred Geometry Diagram */}
              <div className="relative z-10 my-auto text-left space-y-3">
                <div className="flex items-center justify-between">
                  <div className="inline-block px-2.5 py-0.5 rounded-md border border-[rgba(192,57,43,0.4)] bg-[rgba(192,57,43,0.2)] text-[#f5f3f0] text-[10px] font-mono uppercase tracking-wider">
                    {episode.sin_category || 'Sin'}
                  </div>

                  {/* Sacred Geometry Diagram Preview */}
                  <div className="p-1 rounded-xl bg-black/40 border border-[rgba(201,168,76,0.2)]">
                    <SinPhilosophicalDiagram sin={episode.sin_category} />
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#f5f3f0] tracking-wide leading-tight drop-shadow-md">
                    {episode.title}
                  </h3>
                </div>

                <p className="text-xs font-mono text-[#e8c96a] italic">
                  "{episode.tagline}"
                </p>

                <p className="text-xs text-[#c4c0bb] line-clamp-2 leading-relaxed border-l-2 border-[#C9A84C] pl-3 font-serif">
                  {episode.teaser}
                </p>
              </div>

              {/* Bottom details: episode #, read time, heart count */}
              <div className="relative z-10 pt-4 border-t border-[rgba(201,168,76,0.2)] flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs font-mono text-[#8a6e2a]">
                  <span className="text-[#e8c96a] font-bold">#{epNumber}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#C9A84C]" />
                    {readTime}
                  </span>
                  <span>·</span>
                  <LikeButton
                    targetType="book_of_lies"
                    targetId={episode.id}
                    initialLikes={episode.likes_count || 14}
                    size="sm"
                    showCount={true}
                  />
                </div>

                {isCenter ? (
                  <button
                    onClick={() => onRead(episode)}
                    className="px-4 py-1.5 rounded-full bg-[#C9A84C] text-[#050404] font-mono text-xs font-bold tracking-wider hover:bg-[#e8c96a] transition-all flex items-center gap-1.5 cursor-pointer shadow-md uppercase"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read Full</span>
                  </button>
                ) : (
                  <span className="text-[11px] font-mono text-[#8a6e2a]">
                    Center →
                  </span>
                )}
              </div>
            </div>
          }
          back={
            <div className="space-y-4 text-xs font-mono text-[#c4c0bb] h-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-[rgba(201,168,76,0.2)] pb-2.5">
                  <Compass className="w-4 h-4 text-[#C9A84C]" />
                  <span className="font-display font-bold text-sm text-[#f5f3f0]">
                    {translation.invariant}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.2)] space-y-2">
                  <span className="text-[10px] uppercase text-[#8a6e2a] block tracking-wider">
                    Philosophical System Translation:
                  </span>
                  <p className="text-xs font-serif italic text-[#e8c96a] leading-relaxed">
                    "{translation.lesson}"
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-[rgba(192,57,43,0.12)] border border-[#C0392B]/30 space-y-1">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-[#e8c96a] block">
                    ✦ Imprinting Mirror:
                  </span>
                  <p className="text-[11px] font-serif text-[#c4c0bb] italic">
                    Where in your present building journey are you constructing this exact same lie?
                  </p>
                </div>

                <p className="text-xs font-serif leading-relaxed text-[#c4c0bb]">
                  {episode.full_text?.slice(0, 180)}...
                </p>
              </div>

              <div className="pt-3 border-t border-[rgba(201,168,76,0.15)] flex items-center justify-between">
                <span className="text-[10px] text-[#8a6e2a]">Nightly 9:47 PM Canon</span>
                <button
                  type="button"
                  onClick={() => onRead(episode)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#C9A84C] text-[#050404] font-bold text-xs hover:bg-[#e8c96a] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Open Manuscript</span>
                </button>
              </div>
            </div>
          }
        />
      </EdgeGlow>
    </div>
  );
};

export default BookOfLiesCard;
