'use client';

import React, { useState, useEffect } from 'react';
import Carousel from '@/components/ui/Carousel';
import BookOfLiesCard from '@/components/content/BookOfLiesCard';
import EpisodeReader from '@/components/content/EpisodeReader';
import { EmptyBookOfLies } from '@/components/ui/EmptyStates';
import EdgeGlow from '@/components/ui/EdgeGlow';
import LikeButton from '@/components/ui/LikeButton';
import { getAllBookOfLies, hydrateCustomEpisodes, BookOfLiesEpisode, synthesizePersonalBook, PersonalBookSynthesis } from '@/lib/data/book-of-lies';
import { StudioAudio } from '@/lib/watermark';
import Button from '@/components/ui/Button';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Share2,
  Link as LinkIcon,
  BookOpen,
  Sparkles,
  Download,
  X,
  PenTool,
} from 'lucide-react';

import DefensiveFallback from '@/components/ui/DefensiveFallback';
import { useToast } from '@/components/providers/ToastProvider';

const SINS = ['All', 'Pride', 'Envy', 'Wrath', 'Sloth', 'Greed', 'Gluttony', 'Lust', 'Discernment'] as const;
const ACTS = ['All', '1', '2', '3'] as const;

export default function BookOfLiesPage() {
  const [selectedSin, setSelectedSin] = useState<string>('All');
  const [selectedAct, setSelectedAct] = useState<string>('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeReadingEpisode, setActiveReadingEpisode] = useState<BookOfLiesEpisode | null>(null);
  const { showToast } = useToast();

  let episodes: BookOfLiesEpisode[] = [];
  try {
    episodes = getAllBookOfLies({
      sin: selectedSin === 'All' ? undefined : selectedSin,
      act: selectedAct === 'All' ? undefined : parseInt(selectedAct, 10),
    });
  } catch (err) {
    console.warn('BookOfLiesPage episode loading error:', err);
    return <DefensiveFallback />;
  }

  // Handle keyboard arrows for 3D carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeReadingEpisode) return;
      if (episodes.length <= 1) return;
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : episodes.length - 1));
        StudioAudio.playClick();
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev < episodes.length - 1 ? prev + 1 : 0));
        StudioAudio.playClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [episodes.length, activeReadingEpisode]);

  // Reset index when filters change
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedSin, selectedAct]);

  // Pull shared custom episodes from the server into the localStorage mirror,
  // then re-render so the sync list above includes them (survives cache clears).
  const [, setEpisodesHydrated] = useState(false);
  useEffect(() => {
    hydrateCustomEpisodes().finally(() => setEpisodesHydrated(true));
  }, []);

  const [personalModalOpen, setPersonalModalOpen] = useState(false);
  const [personalName, setPersonalName] = useState('Architect Jehu');
  const [compiledBook, setCompiledBook] = useState<PersonalBookSynthesis | null>(null);
  const [storedReflectionsCount, setStoredReflectionsCount] = useState(0);

  // Author Your Own Episode Modal State
  const [authorModalOpen, setAuthorModalOpen] = useState(false);
  const [authorTitle, setAuthorTitle] = useState('');
  const [authorSin, setAuthorSin] = useState<BookOfLiesEpisode['sin_category']>('Pride');
  const [authorAct, setAuthorAct] = useState<1 | 2 | 3>(1);
  const [authorTagline, setAuthorTagline] = useState('');
  const [authorStory, setAuthorStory] = useState('');
  const [selectedStylePreset, setSelectedStylePreset] = useState<'novel' | 'shakespeare' | 'noir' | 'fragment'>('novel');

  const PRE_DRAFT_STYLES = {
    novel: {
      name: 'Novel Style (In Media Res / Mid-Fall at the Reality)',
      promptHint: 'Begins mid-thought at the crash, then backtracks to unearth the fatal assumption.',
      title: 'The Echo Before the Impact',
      tagline: 'He had already heard the glass shatter three days before he bought the hammer.',
      template: `The concrete did not wait for his explanation. It had already received the weight.

Three hours before the scaffolding gave way on the north terrace, he was arguing with the accountant about bronze fasteners. "The brass is rated for three centuries," he had shouted over the generator's drone. "The storm won't notice forty cents worth of zinc."

The storm did not notice the price. It only noticed the shear force.

Pride is not ignoring the warning; it is hearing the warning and calculating how much of the disaster you can rebrand as an act of God.

We walked through the rubble at six in the morning while the mist was still sitting in the eucalyptus groves. The clients were weeping into wool scarves. He was already drafting a press release praising the structural resilience of the surviving basement.

The earth does not care who drafted your resume. It only measures what you anchored into bedrock.

Build the floor first. Everything else is just expensive wind.`,
    },
    shakespeare: {
      name: 'Shakespearean Dramatic Irony & Wit',
      promptHint: 'Poetic, sharp, savage theatrical soliloquy on vanity and tragic ambition.',
      title: 'The Gilded Skull in the Mirror',
      tagline: 'He crowned himself with laurel leaves while his kingdom starved of grain.',
      template: `What royal majesty is this that trembles at a servant’s whisper?

The courtier bows until his nose grazes the velvet carpet, yet in his pocket rests the key to the back granary, already sold to foreign merchants. The prince smiles upon his throne of polished cedar, praising the peace that shall outlive the stars.

"My Lord," the jester says, juggling two roasted chestnuts, "the peace is indeed magnificent. It hath so quieted the marketplace that not a single baker remains alive to shout his prices."

Vanity paints the gate of gold while termites feast upon the lintel. We spend our youth demanding tribute for palaces that cannot withstand a November shower.

Look upon the ledger, Sovereign. Your titles stretch across two vellums, yet your army eats grass boiled in vinegar.

To build an empire upon flattery is to sleep upon a bed of scorpions and call the poison warmth.`,
    },
    noir: {
      name: 'Highland Noir / Cynical Architect',
      promptHint: 'Hard-hitting, atmospheric Jos cold realism with dry socratic wit.',
      title: 'The 3:00 AM Generator Cough',
      tagline: 'When the cloud goes dark, your real software stands naked in the cold.',
      template: `The generator coughed twice, choked on diesel sediment, and died right around 3:14 AM.

The office went black. The only light left was the battery indicator on a battered ThinkPad and the red glow of a cigarette across the table.

"Did you push to GitHub?" the junior engineer asked, voice shaking like thin tin in a harmattan breeze.

"GitHub is three thousand miles away across an ocean floor cable that just got chewed by a trawler," I told him without looking up. "The question is: does this machine know who owes us money, or do we have to wait for Silicon Valley to wake up and tell us?"

Sovereignty isn't a bumper sticker. It's what happens when the grid drops out and your local state doesn't wipe itself clean like a coward.

We drank cold instant coffee and rewrote the write-ahead log by candlelight.

If your code can't survive without ten external SaaS dashboards nodding their head, you haven't built a company. You've rented an illusion.`,
    },
    fragment: {
      name: 'Non-Linear Memory Fragment',
      promptHint: 'Mosaic of sharp vignettes that snap together into an undeniable truth.',
      title: 'The Mosaic of False Promises',
      tagline: 'Five fragments. One fracture line. No escape from the mirror.',
      template: `Fragment I: The Presentation.
The slides were forty-eight point Helvetica Neue. There were no numbers, only arrows pointing aggressively toward the upper right corner of the projector screen. Everyone applauded because nobody wanted to admit they didn't understand how the money came back.

Fragment II: The Quarry.
Twelve years earlier. An old mason spitting into the dirt. "If you cut the stone against the grain, it smiles at you while you carve it, and splits when the frost arrives."

Fragment III: The Silence.
The quarterly call. The CEO had his camera turned off. "Technical headwinds," he called it. The wind was forty million dollars of uncollected invoices.

The fragments belong to different years, but they share the exact same fracture.

You cannot outsmart arithmetic with charisma. Build the floor.`,
    },
  };

  const handleApplyStylePreset = (presetKey: 'novel' | 'shakespeare' | 'noir' | 'fragment') => {
    setSelectedStylePreset(presetKey);
    const preset = PRE_DRAFT_STYLES[presetKey];
    setAuthorTitle(preset.title);
    setAuthorTagline(preset.tagline);
    setAuthorStory(preset.template);
    StudioAudio.playClick();
  };

  const handleSaveAuthorEpisode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorTitle.trim() || !authorStory.trim()) {
      showToast('A parable needs both a title and a text — name yours, then inscribe it.', 'error');
      return;
    }

    const newSlug = `custom-${authorTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString().slice(-4)}`;
    const newEpisode: BookOfLiesEpisode = {
      id: `custom-bol-${Date.now()}`,
      slug: newSlug,
      episode_number: episodes.length + 1,
      title: authorTitle.trim(),
      tagline: authorTagline.trim() || 'A personal parable of truth and craft.',
      act: authorAct,
      sin_category: authorSin,
      teaser: authorStory.slice(0, 160) + '...',
      full_text: authorStory.trim(),
      published: true,
      publish_at: new Date().toISOString(),
      views_count: 1,
      likes_count: 1,
      scheduled_for: 'Anytime • Personal Canon',
    };

    try {
      const stored = localStorage.getItem('jadai_custom_episodes');
      const customList = stored ? JSON.parse(stored) : [];
      customList.unshift(newEpisode);
      localStorage.setItem('jadai_custom_episodes', JSON.stringify(customList));
      // Persist server-side too — the parable survives cache clears and reaches
      // other devices; if the network is down the local mirror still holds it.
      void fetch('/api/book-of-lies/episodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episode: newEpisode }),
      }).catch(() => {});
      StudioAudio.playSuccessArpeggio();
      setAuthorModalOpen(false);
      // Immediately open in reader so user experiences their own story!
      setActiveReadingEpisode(newEpisode);
    } catch {
      showToast("Your episode wasn't stored on this device — your text is still in the editor. Check storage and save again.", 'error');
    }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('jadai_reflections');
      if (stored) {
        const parsed = JSON.parse(stored);
        setStoredReflectionsCount(Object.keys(parsed).length);
      }
    } catch {
      // Ignored
    }
  }, [activeReadingEpisode, personalModalOpen]);

  const handleGeneratePersonalBook = () => {
    StudioAudio.playSuccessArpeggio();
    let reflections: Record<string, string> = {};
    try {
      const stored = localStorage.getItem('jadai_reflections');
      if (stored) reflections = JSON.parse(stored);
    } catch {
      // fallback
    }

    if (Object.keys(reflections).length === 0) {
      reflections['the-monument-of-dust'] = 'I caught myself designing multi-tenant abstraction layers before verifying if anyone actually needed the database table. Build the floor first.';
      reflections['the-plumb-line-in-the-dark'] = 'When the stakeholders argued for 3 weeks about branding colors, we measured the conversion delta in production. Gravity settled the debate.';
    }

    const synthesis = synthesizePersonalBook(personalName.trim() || 'Studio Member', reflections);
    setCompiledBook(synthesis);
    setPersonalModalOpen(true);
  };

  if (activeReadingEpisode) {
    const nextIdx =
      episodes.length > 0
        ? (episodes.findIndex((e) => e.id === activeReadingEpisode.id) + 1) % episodes.length
        : 0;
    const nextEp = episodes[nextIdx];

    return (
      <EpisodeReader
        episode={activeReadingEpisode}
        onBack={() => setActiveReadingEpisode(null)}
        onNextEpisode={nextEp && nextEp.id !== activeReadingEpisode.id ? () => setActiveReadingEpisode(nextEp) : undefined}
      />
    );
  }

  const safeCurrentIndex = episodes.length > 0 ? Math.min(Math.max(0, currentIndex), episodes.length - 1) : 0;
  const currentEpisode = episodes[safeCurrentIndex];
  const prevIndex = episodes.length > 0 ? (safeCurrentIndex - 1 + episodes.length) % episodes.length : 0;
  const nextIndex = episodes.length > 0 ? (safeCurrentIndex + 1) % episodes.length : 0;

  const handleNext = () => {
    if (episodes.length <= 1) return;
    setCurrentIndex(nextIndex);
    StudioAudio.playClick();
  };

  const handlePrev = () => {
    if (episodes.length <= 1) return;
    setCurrentIndex(prevIndex);
    StudioAudio.playClick();
  };

  return (
    <div className="relative min-h-[92vh] py-12 px-4 sm:px-6 max-w-7xl mx-auto space-y-10 select-none overflow-hidden bg-book-atmos">
      {/* Warm Crimson Radial Glow behind carousel */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] pointer-events-none blur-3xl z-0 opacity-70"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(192,57,43,0.28) 0%, rgba(201,168,76,0.1) 40%, transparent 75%)',
          contain: 'layout style paint',
        }}
      />

      {/* Ambient Gold Particles Drifting Up (sparse, no per-particle glow) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-35" style={{ contain: 'layout style paint' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#C9A84C]"
            style={{
              width: `${(i % 3) + 2}px`,
              height: `${(i % 3) + 2}px`,
              left: `${(i * 23 + 7) % 100}%`,
              bottom: `-20px`,
              opacity: (i % 4 + 3) / 12,
              animation: `particleFloat ${9 + (i % 5)}s linear infinite ${i * 0.9}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[rgba(192,57,43,0.35)] bg-[rgba(192,57,43,0.15)] text-[#f5f3f0] text-xs font-mono">
          <Flame className="w-3.5 h-3.5 text-[#C0392B]" />
          <span>Philosophical Canon · Drops daily at 9:47 PM</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-bold text-[#f5f3f0] tracking-wide">
          The Book of Lies
        </h1>
        <p className="text-base font-serif italic text-[#8a6e2a] max-w-lg mx-auto leading-relaxed">
          Moral parables on the lies builders tell themselves — and the floors that remember every one of them.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              handleApplyStylePreset('novel');
              setAuthorModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-mono transition-all shadow-lg shadow-rose-500/10 cursor-pointer"
          >
            <PenTool className="w-3.5 h-3.5 text-rose-400" />
            <span>Write Your Own Episode / Parable</span>
          </button>

          <button
            onClick={handleGeneratePersonalBook}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 text-xs font-mono transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Synthesize My Personal Book of Lies</span>
            {storedReflectionsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-bold">
                {storedReflectionsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Left Vertical Dock */}
      <div className="hidden lg:flex fixed left-6 top-1/2 -translate-y-1/2 z-30 flex-col items-center gap-3 p-2 rounded-full bg-[#0a0908]/90 border border-[rgba(201,168,76,0.3)] shadow-2xl backdrop-blur-md">
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            StudioAudio.playClick();
            showToast('Canon link copied — pass the codex on.', 'success');
          }}
          className="p-2.5 rounded-full text-[#8a6e2a] hover:text-[#C9A84C] hover:bg-white/5 transition-colors cursor-pointer"
          title="Copy Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        {currentEpisode && (
          <div className="p-1">
            <LikeButton
              targetType="book_of_lies"
              targetId={currentEpisode.id}
              initialLikes={currentEpisode.likes_count || 14}
              showCount={false}
              size="md"
            />
          </div>
        )}
        <button
          onClick={() => {
            if (currentEpisode) {
              const text = `"${currentEpisode.tagline}" — Book of Lies #${currentEpisode.episode_number} | jadai.dev`;
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
            }
          }}
          className="p-2.5 rounded-full text-[#8a6e2a] hover:text-[#C9A84C] hover:bg-white/5 transition-colors cursor-pointer"
          title="Share to Twitter / X"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Matrix (Sins and Acts) */}
      <div className="relative z-10 space-y-3 border-y border-[rgba(201,168,76,0.15)] py-4 backdrop-blur-sm">
        {/* Row 1: Sins */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a] mr-2">
            The Sins:
          </span>
          {SINS.map((sin) => (
            <button
              key={sin}
              onClick={() => {
                setSelectedSin(sin);
                setCurrentIndex(0);
              }}
              className={`px-3 py-1 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
                selectedSin === sin
                  ? 'bg-[#C0392B] text-[#f5f3f0] font-semibold shadow-[0_0_12px_rgba(192,57,43,0.5)]'
                  : 'bg-[#0a0908] border border-[rgba(74,71,68,0.3)] text-[#c4c0bb] hover:text-[#f5f3f0] hover:border-[#C0392B]'
              }`}
            >
              {sin}
            </button>
          ))}
        </div>

        {/* Row 2: Acts */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a] mr-2">
            The Acts:
          </span>
          {ACTS.map((act) => (
            <button
              key={act}
              onClick={() => {
                setSelectedAct(act);
                setCurrentIndex(0);
              }}
              className={`px-3 py-1 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
                selectedAct === act
                  ? 'bg-[#C9A84C] text-[#050404] font-semibold shadow-[0_0_12px_rgba(201,168,76,0.4)]'
                  : 'bg-[#0a0908] border border-[rgba(74,71,68,0.3)] text-[#c4c0bb] hover:text-[#f5f3f0] hover:border-[#C9A84C]'
              }`}
            >
              {act === 'All' ? 'All Acts' : `Act ${act}`}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Carousel Stage */}
      {episodes.length === 0 || !currentEpisode ? (
        <EmptyBookOfLies />
      ) : (
        <div className="relative min-h-[520px] flex items-center justify-center perspective-[1200px] overflow-hidden py-4 z-10">
          {/* Left Flanking Card (Rome 3D depth) */}
          {episodes.length > 1 && episodes[prevIndex] && (
            <div className="absolute hidden sm:block left-4 sm:left-14 top-1/2 -translate-y-1/2 z-10">
              <BookOfLiesCard
                episode={episodes[prevIndex]}
                position="left"
                onRead={setActiveReadingEpisode}
                onClick={handlePrev}
                totalEpisodes={episodes.length}
              />
            </div>
          )}

          {/* Active Center Card (Sharp focus with EdgeGlow) */}
          <div className="relative z-30">
            <BookOfLiesCard
              episode={currentEpisode}
              position="center"
              onRead={setActiveReadingEpisode}
              totalEpisodes={episodes.length}
            />
          </div>

          {/* Right Flanking Card (Rome 3D depth) */}
          {episodes.length > 1 && episodes[nextIndex] && (
            <div className="absolute hidden sm:block right-4 sm:right-14 top-1/2 -translate-y-1/2 z-10">
              <BookOfLiesCard
                episode={episodes[nextIndex]}
                position="right"
                onRead={setActiveReadingEpisode}
                onClick={handleNext}
                totalEpisodes={episodes.length}
              />
            </div>
          )}

          {/* Large Circular Navigation Arrows (56px) with EdgeGlow */}
          {episodes.length > 1 && (
            <>
              <div className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-40">
                <EdgeGlow intensity="intense" color="gold" borderRadius={9999}>
                  <button
                    onClick={handlePrev}
                    className="w-14 h-14 rounded-full bg-[#050404]/90 border border-[#C9A84C] text-[#C9A84C] hover:text-[#f5f3f0] hover:bg-[#0a0908] transition-all flex items-center justify-center shadow-[0_4px_30px_rgba(0,0,0,0.9)] cursor-pointer"
                    aria-label="Previous episode"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                </EdgeGlow>
              </div>

              <div className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-40">
                <EdgeGlow intensity="intense" color="gold" borderRadius={9999}>
                  <button
                    onClick={handleNext}
                    className="w-14 h-14 rounded-full bg-[#050404]/90 border border-[#C9A84C] text-[#C9A84C] hover:text-[#f5f3f0] hover:bg-[#0a0908] transition-all flex items-center justify-center shadow-[0_4px_30px_rgba(0,0,0,0.9)] cursor-pointer"
                    aria-label="Next episode"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </EdgeGlow>
              </div>
            </>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------
          BOTTOM THUMBNAIL RAIL OF OTHER EPISODES
         ------------------------------------------------------------- */}
      {episodes.length > 0 && (
        <div className="relative z-20 space-y-3 pt-6 border-t border-[rgba(201,168,76,0.15)]">
          <div className="flex items-center justify-between text-xs font-mono text-[#8a6e2a] px-2">
            <span className="uppercase tracking-widest text-[#C9A84C]">Episode Index Rail</span>
            <span>{episodes.length} Episodes in Canon</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-none">
            {episodes.map((ep, idx) => {
              const isSelected = safeCurrentIndex === idx;
              return (
                <button
                  key={ep.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    StudioAudio.playClick();
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#C9A84C]/15 border-[#C9A84C] shadow-[0_0_15px_rgba(201,168,76,0.3)]'
                      : 'bg-[#0a0908] border-[rgba(201,168,76,0.2)] hover:border-[#C9A84C]/60'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                    isSelected ? 'bg-[#C9A84C] text-[#050404]' : 'bg-[#050404] text-[#8a6e2a]'
                  }`}>
                    #{ep.episode_number}
                  </div>
                  <div className="font-mono text-left">
                    <span className={`text-xs block font-bold truncate max-w-[130px] ${
                      isSelected ? 'text-[#f5f3f0]' : 'text-[#c4c0bb]'
                    }`}>
                      {ep.title}
                    </span>
                    <span className="text-[10px] text-[#8a6e2a] block">
                      {ep.sin_category} · Act {ep.act}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Personal Book Synthesis Modal */}
      {personalModalOpen && compiledBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-zinc-950 border border-amber-500/30 p-6 md:p-8 space-y-6 shadow-2xl">
            <EdgeGlow color="gold" />

            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white font-display">
                  Personal Codex Synthesized
                </h3>
              </div>
              <button
                onClick={() => setPersonalModalOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <div className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                  {compiledBook.title}
                </div>
                <div className="text-xs text-zinc-400">
                  Compiled on {compiledBook.generatedAt} • {compiledBook.reflectionsCount} Reflection Chapters
                </div>
                <p className="text-sm font-serif italic text-zinc-300 pt-2 border-t border-amber-500/10">
                  "{compiledBook.prologue}"
                </p>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-wider">
                  Inscribed Chapters & Epilogues
                </div>
                {compiledBook.chapters.map((ch, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-300 font-display">
                        Episode #{ch.episodeNumber}: {ch.episodeTitle}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 font-mono">
                        {ch.sinCategory}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 font-serif leading-relaxed italic">
                      Reflection: "{ch.userReflection}"
                    </p>
                    <div className="text-[11px] text-amber-500/80 font-mono">
                      Anchor: {ch.epilogueQuote}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
              <div className="text-xs text-zinc-500 font-mono">
                Watermark: JADAI-PERSONAL-CODEX-AUTH
              </div>
              <div className="flex gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const text = `# ${compiledBook.title}\nAuthor: ${compiledBook.authorName}\nDate: ${compiledBook.generatedAt}\n\n${compiledBook.prologue}\n\n---\n\n` +
                      compiledBook.chapters.map(c => `## Episode #${c.episodeNumber}: ${c.episodeTitle} (${c.sinCategory})\n\nPersonal Reflection:\n${c.userReflection}\n\nAnchor Quote: "${c.epilogueQuote}"\n\n`).join('\n---\n') +
                      `\n[Synthesized under Seal of Jadai Studios // No Boilerplate]`;
                    const blob = new Blob([text], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Book_of_Lies_Personal_Manuscript.md`;
                    a.click();
                    StudioAudio.playSuccessArpeggio();
                  }}
                  className="gap-2"
                >
                  <Download className="w-3.5 h-3.5" /> Export Manuscript (.md)
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setPersonalModalOpen(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Author Your Own Episode Modal */}
      {authorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-zinc-950 border border-rose-500/30 p-6 md:p-8 space-y-6 shadow-2xl overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-zinc-100">
                    Author Your Own Parable / Episode
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    You own the story. Choose an archetype floor, begin mid-fall or at the end, and craft your mirror.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAuthorModalOpen(false)}
                className="p-2 text-zinc-500 hover:text-zinc-200 rounded-full hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pre-Draft Style Archetype Selectors */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 block">
                Select Architectural Writing Style Floor:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {(Object.keys(PRE_DRAFT_STYLES) as Array<'novel' | 'shakespeare' | 'noir' | 'fragment'>).map((key) => {
                  const item = PRE_DRAFT_STYLES[key];
                  const isSelected = selectedStylePreset === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleApplyStylePreset(key)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-500/15 border-rose-400 text-rose-200 shadow-md shadow-rose-900/30'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <div className="text-xs font-bold font-mono text-zinc-200">{item.name}</div>
                      <div className="text-[10px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.promptHint}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Authoring Form */}
            <form onSubmit={handleSaveAuthorEpisode} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                    Story Title
                  </label>
                  <input
                    type="text"
                    required
                    value={authorTitle}
                    onChange={(e) => setAuthorTitle(e.target.value)}
                    placeholder="e.g. The Monument of Dust..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                    Sin / Mirror Category
                  </label>
                  <select
                    value={authorSin}
                    onChange={(e) => setAuthorSin(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-rose-500"
                  >
                    {['Pride', 'Envy', 'Wrath', 'Sloth', 'Greed', 'Gluttony', 'Lust', 'Discernment'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  Tagline / Moral Invariant
                </label>
                <input
                  type="text"
                  value={authorTagline}
                  onChange={(e) => setAuthorTagline(e.target.value)}
                  placeholder="e.g. When the builder worships their own blueprints before the mortar dries."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                    Full Narrative (Novel / Soliloquy / Parable Text)
                  </label>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {authorStory.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <textarea
                  required
                  rows={10}
                  value={authorStory}
                  onChange={(e) => setAuthorStory(e.target.value)}
                  placeholder="Begin mid-thought, mid-fall, or at the end..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm font-serif leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <p className="text-[11px] font-mono text-zinc-500">
                  Sovereign Story Guarantee: You own your writing. Saved locally and ready for immediate reader preview.
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAuthorModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="gap-1.5"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Publish to My Canon</span>
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes particleFloat {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.4;
          }
          100% {
            transform: translateY(-500px) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
