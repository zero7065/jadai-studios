import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { ALL_CANONICAL_EPISODES, BookOfLiesEpisode } from '../../lib/data/book-of-lies';
import { StudioAudio } from '../../lib/watermark';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  ArrowRight,
  Volume2,
  VolumeX,
  Maximize2,
  X,
  Clock,
  Share2,
  Bookmark,
  Compass,
} from 'lucide-react';

const SIN_THEMES: Record<string, { bg: string; text: string; glow: string; border: string; accent: string; artGradient: string; glyph: string }> = {
  Pride: {
    bg: 'bg-[#ffd700]/10',
    text: 'text-[#ffd700]',
    glow: 'rgba(255, 215, 0, 0.35)',
    border: 'border-[#ffd700]/40',
    accent: '#ffd700',
    artGradient: 'from-[#ffd700]/25 via-[#231a08] to-[#0a0805]',
    glyph: '👑',
  },
  Greed: {
    bg: 'bg-[#50c878]/10',
    text: 'text-[#50c878]',
    glow: 'rgba(80, 200, 120, 0.35)',
    border: 'border-[#50c878]/40',
    accent: '#50c878',
    artGradient: 'from-[#50c878]/25 via-[#0c2314] to-[#050b07]',
    glyph: '⚖️',
  },
  Lust: {
    bg: 'bg-[#ff69b4]/10',
    text: 'text-[#ff69b4]',
    glow: 'rgba(255, 105, 180, 0.35)',
    border: 'border-[#ff69b4]/40',
    accent: '#ff69b4',
    artGradient: 'from-[#ff69b4]/25 via-[#230919] to-[#0b040a]',
    glyph: '🪞',
  },
  Envy: {
    bg: 'bg-[#2ecc71]/10',
    text: 'text-[#2ecc71]',
    glow: 'rgba(46, 204, 113, 0.35)',
    border: 'border-[#2ecc71]/40',
    accent: '#2ecc71',
    artGradient: 'from-[#2ecc71]/25 via-[#0b2112] to-[#050a06]',
    glyph: '👁️',
  },
  Gluttony: {
    bg: 'bg-[#e67e22]/10',
    text: 'text-[#e67e22]',
    glow: 'rgba(230, 126, 34, 0.35)',
    border: 'border-[#e67e22]/40',
    accent: '#e67e22',
    artGradient: 'from-[#e67e22]/25 via-[#241306] to-[#0a0603]',
    glyph: '🍷',
  },
  Wrath: {
    bg: 'bg-[#e74c3c]/10',
    text: 'text-[#e74c3c]',
    glow: 'rgba(231, 76, 60, 0.35)',
    border: 'border-[#e74c3c]/40',
    accent: '#e74c3c',
    artGradient: 'from-[#e74c3c]/25 via-[#260a08] to-[#0b0303]',
    glyph: '⚡',
  },
  Sloth: {
    bg: 'bg-[#9b59b6]/10',
    text: 'text-[#9b59b6]',
    glow: 'rgba(155, 89, 182, 0.35)',
    border: 'border-[#9b59b6]/40',
    accent: '#9b59b6',
    artGradient: 'from-[#9b59b6]/25 via-[#190b24] to-[#07030b]',
    glyph: '⏳',
  },
  Discernment: {
    bg: 'bg-[#d4af37]/10',
    text: 'text-[#d4af37]',
    glow: 'rgba(212, 175, 55, 0.35)',
    border: 'border-[#d4af37]/40',
    accent: '#d4af37',
    artGradient: 'from-[#d4af37]/25 via-[#1f190b] to-[#090704]',
    glyph: '✨',
  },
};

interface BookOfLiesSliderProps {
  onSelectEpisode?: (ep: BookOfLiesEpisode) => void;
}

export default function BookOfLiesSlider({ onSelectEpisode }: BookOfLiesSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(1);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [selectedSinFilter, setSelectedSinFilter] = useState<string>('All');
  const [quickReaderOpen, setQuickReaderOpen] = useState(false);
  const [savedLies, setSavedLies] = useState<string[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Filter items from canonical ALL_CANONICAL_EPISODES (70 chronicles)
  const filteredItems = useMemo(() => {
    if (selectedSinFilter === 'All') return ALL_CANONICAL_EPISODES;
    return ALL_CANONICAL_EPISODES.filter((item) => item.sin_category === selectedSinFilter);
  }, [selectedSinFilter]);

  // Safe index bounds
  const currentLie: BookOfLiesEpisode = filteredItems[currentIndex] || ALL_CANONICAL_EPISODES[0];
  const sinCategory = currentLie?.sin_category || 'Discernment';
  const sinTheme = SIN_THEMES[sinCategory] || SIN_THEMES.Discernment;

  // Autoplay timer
  useEffect(() => {
    if (!isAutoplay) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
    }, 7500);
    return () => clearInterval(interval);
  }, [isAutoplay, filteredItems.length]);

  const handleNext = () => {
    if (audioEnabled) StudioAudio.playHover();
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const handlePrev = () => {
    if (audioEnabled) StudioAudio.playHover();
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  const toggleBookmark = (id: string) => {
    if (audioEnabled) StudioAudio.playClick();
    setSavedLies((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredItems.length]);

  const sins = ['All', 'Pride', 'Greed', 'Lust', 'Envy', 'Gluttony', 'Wrath', 'Sloth', 'Discernment'];

  // Smooth 3D Cube Transition Variants with Spring Physics
  const cubeVariants: Variants = {
    enter: (dir: number) => ({
      rotateY: dir > 0 ? 55 : -55,
      opacity: 0,
      scale: 0.9,
      x: dir > 0 ? 100 : -100,
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        duration: 0.65,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: (dir: number) => ({
      rotateY: dir > 0 ? -55 : 55,
      opacity: 0,
      scale: 0.9,
      x: dir > 0 ? -100 : 100,
      transition: {
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  return (
    <div className="relative w-full overflow-hidden py-6 select-none">
      {/* Dynamic Ambient Background Glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000 opacity-20"
        style={{
          background: `radial-gradient(circle 600px at 50% 50%, ${sinTheme.glow}, transparent 70%)`
        }}
      />

      <div className="w-full relative z-10">
        {/* Sin Filter Segment Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-6 no-scrollbar scroll-smooth">
          {sins.map((sin) => {
            const isSelected = selectedSinFilter === sin;
            return (
              <button
                key={sin}
                onClick={() => {
                  if (audioEnabled) StudioAudio.playClick();
                  setSelectedSinFilter(sin);
                  setCurrentIndex(0);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-[#d4af37] text-black font-semibold shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-105'
                    : 'bg-[#12100d]/80 text-[#8a857e] hover:text-[#f4efe6] hover:bg-[#1a1714] border border-[#2a241e]/60'
                }`}
              >
                {sin === 'All' ? 'ALL 70 CHRONICLES' : `SIN: ${sin.toUpperCase()}`}
              </button>
            );
          })}
        </div>

        {/* 3D CUBE CAROUSEL PERSPECTIVE VIEWPORT WITH ART & SLEEK PREVIEW */}
        <div
          className="relative w-full"
          style={{ perspective: '1500px' }}
          onMouseEnter={() => setIsAutoplay(false)}
          onMouseLeave={() => setIsAutoplay(true)}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentLie.id}
              custom={direction}
              variants={cubeVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="relative min-h-[480px] md:min-h-[520px] rounded-3xl bg-gradient-to-br from-[#12100d] via-[#0d0c0a] to-[#070605] border border-[rgba(201,168,76,0.3)] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl grid grid-cols-1 lg:grid-cols-12"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Left 4 Cols: Grimoire Artistic Visual Display */}
              <div className={`lg:col-span-4 relative bg-gradient-to-br ${sinTheme.artGradient} p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[rgba(201,168,76,0.2)] overflow-hidden`}>
                {/* Background Metatron Watermark */}
                <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
                  <div className="w-56 h-56 rounded-full border border-white border-dashed animate-[spin_80s_linear_infinite]" />
                </div>

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl filter drop-shadow-md">{sinTheme.glyph}</span>
                    <span className="font-mono text-xs tracking-widest text-[#d4af37] font-bold">
                      CODEX #{currentLie.episode_number < 10 ? `0${currentLie.episode_number}` : currentLie.episode_number}
                    </span>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-medium border ${sinTheme.bg} ${sinTheme.text} ${sinTheme.border}`}>
                    {currentLie.sin_category.toUpperCase()}
                  </span>
                </div>

                {/* Center Relic Seal */}
                <div className="relative z-10 my-6 text-center py-4">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-black/50 border border-[rgba(201,168,76,0.3)] flex items-center justify-center text-[#d4af37] shadow-xl">
                    <BookOpen className="w-9 h-9" />
                  </div>
                  <p className="text-[10px] font-mono text-[#C9A84C] tracking-widest uppercase mt-3">
                    ACT {currentLie.act} • SOVEREIGN CANON
                  </p>
                </div>

                <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-[#8a857e]">
                  <span>432Hz HARMONIC</span>
                  <span>UNTOUCHED SCRIPT</span>
                </div>
              </div>

              {/* Right 8 Cols: Parable Text & Actions */}
              <div className="lg:col-span-8 p-6 sm:p-10 flex flex-col justify-between relative">
                {/* Grimoire Watermark Number */}
                <div className="absolute right-6 bottom-4 md:right-10 md:bottom-6 opacity-5 pointer-events-none select-none text-[100px] md:text-[160px] font-serif text-[#d4af37]">
                  {currentLie.episode_number < 10 ? `0${currentLie.episode_number}` : currentLie.episode_number}
                </div>

                {/* Header Row */}
                <div className="relative z-10 flex items-center justify-between gap-4 pb-4 border-b border-[#24201a]">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#a8a49e]">
                    <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
                    <span>CANONICAL CODEX TRANSMISSION</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleBookmark(currentLie.id)}
                      className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5 cursor-pointer ${
                        savedLies.includes(currentLie.id)
                          ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]'
                          : 'bg-[#181512] border-[#2c2620] text-[#a8a29e] hover:text-[#d4af37]'
                      }`}
                      title="Bookmark chronicle"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(
                            `"${currentLie.tagline}" — The Book of Lies: ${currentLie.title} | Jadai Studios`
                          );
                          if (audioEnabled) StudioAudio.playClick();
                        }
                      }}
                      className="p-2 rounded-xl bg-[#181512] border border-[#2c2620] text-[#a8a29e] hover:text-[#d4af37] hover:border-[#d4af37]/40 transition-all text-xs cursor-pointer"
                      title="Copy quote link"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setQuickReaderOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-[#181512] border border-[#2c2620] text-[#a8a29e] hover:text-[#d4af37] hover:border-[#d4af37]/40 transition-all text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">QUICK READER</span>
                    </button>
                  </div>
                </div>

                {/* Central Dramatic Body */}
                <div className="relative z-10 my-6 max-w-2xl">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal text-[#f4efe6] tracking-tight leading-tight mb-3">
                    {currentLie.title}
                  </h3>

                  {/* Luminous Pullquote */}
                  <blockquote className="relative my-4 pl-4 border-l-2 border-[#d4af37]/70 italic font-serif text-lg sm:text-xl text-[#e8e2d5] leading-relaxed">
                    &ldquo;{currentLie.tagline}&rdquo;
                  </blockquote>

                  <p className="text-sm sm:text-base font-sans text-[#a8a29e] line-clamp-3 leading-relaxed">
                    {currentLie.teaser}
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-[#24201a]">
                  <div className="flex items-center gap-3 text-xs font-mono text-[#8a857e]">
                    <span>RECORD {currentIndex + 1} OF {filteredItems.length}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/50" />
                    <span>JADAI SOVEREIGN ARCHIVE</span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <a
                      href={`/book-of-lies/${currentLie.slug}`}
                      onClick={(e) => {
                        if (onSelectEpisode) {
                          e.preventDefault();
                          onSelectEpisode(currentLie);
                        }
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#d4af37] text-black font-serif font-medium text-xs tracking-wider flex items-center justify-center gap-2 hover:bg-[#e6c250] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all cursor-pointer"
                    >
                      <span>READ FULL CHRONICLE</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls Dock */}
          <div className="mt-5 flex items-center justify-between">
            {/* Timeline Progress Indicators */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-[65%] py-2 no-scrollbar">
              {filteredItems.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (audioEnabled) StudioAudio.playClick();
                    setDirection(idx > currentIndex ? 1 : -1);
                    setCurrentIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentIndex
                      ? 'w-8 bg-[#d4af37]'
                      : 'w-2 bg-[#2a241e] hover:bg-[#4a4035]'
                  }`}
                  aria-label={`Jump to chronicle ${idx + 1}`}
                />
              ))}
            </div>

            {/* Previous / Next Arrow Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-3 rounded-2xl bg-[#14120e] border border-[#2a241e] text-[#d4af37] hover:bg-[#d4af37] hover:text-black hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
                aria-label="Previous chronicle"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="p-3 rounded-2xl bg-[#14120e] border border-[#2a241e] text-[#d4af37] hover:bg-[#d4af37] hover:text-black hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
                aria-label="Next chronicle"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Reader Modal Overlay */}
      <AnimatePresence>
        {quickReaderOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-[#12100d] border border-[#d4af37]/40 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => setQuickReaderOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-[#1c1813] text-[#a8a29e] hover:text-[#d4af37] hover:bg-[#26211a] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 font-mono text-xs text-[#d4af37] mb-2">
                <BookOpen className="w-4 h-4" />
                <span>EXPANDED CODEX READER</span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${sinTheme.bg} ${sinTheme.text} ${sinTheme.border}`}>
                  {currentLie.sin_category}
                </span>
                <span className="text-xs font-mono text-[#736c64]">
                  ACT {currentLie.act}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif text-[#f4efe6] mb-4">
                {currentLie.title}
              </h3>

              <blockquote className="my-4 pl-4 border-l-2 border-[#d4af37] italic font-serif text-lg text-[#e8e2d5]">
                &ldquo;{currentLie.tagline}&rdquo;
              </blockquote>

              <div className="space-y-4 text-sm sm:text-base font-sans text-[#cfc8bc] leading-relaxed mt-6 whitespace-pre-line">
                <p>{currentLie.full_text || currentLie.teaser}</p>
                <p className="text-xs text-[#8a857e] italic pt-4 border-t border-[#24201a]">
                  Recorded in the Vault archives of Jadai Studios. This scripture is intended for contemplation rather than doctrine.
                </p>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => setQuickReaderOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1c1813] text-xs font-mono text-[#a8a29e] hover:text-[#f4efe6] cursor-pointer"
                >
                  Close
                </button>
                <a
                  href={`/book-of-lies/${currentLie.slug}`}
                  onClick={(e) => {
                    if (onSelectEpisode) {
                      e.preventDefault();
                      onSelectEpisode(currentLie);
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-[#d4af37] text-black text-xs font-serif font-medium hover:bg-[#e6c250] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Open Dedicated Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
