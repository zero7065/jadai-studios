'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, MessageCircle, ArrowRight, X, Heart, Compass, RefreshCw, Coffee } from 'lucide-react';
import { StudioAudio } from '../../lib/watermark';

export interface WarmCompanionGistProps {
  onExplore?: () => void;
}

interface InsideGist {
  id: string;
  headline: string;
  reflection: string;
  gistNote: string;
  mood: string;
}

const INSIDE_GISTS: InsideGist[] = [
  {
    id: 'gist-1',
    headline: 'Late Night in the Workshop?',
    reflection: 'We know the feeling. Staring at an idea that won’t let you sleep. Most people build for the applause before the first brick is laid. Here, we build the floor first. Take your time. What is well-built cannot be rushed.',
    gistNote: '✦ Inside gist: True craft is what you do when no one is watching your screen.',
    mood: '☕ Late-Night Buddy',
  },
  {
    id: 'gist-2',
    headline: 'The Architecture of Honesty',
    reflection: 'If your software or story needs three paragraphs of jargon to explain what it does, you are hiding behind fancy words. Say it straight. Build it solid. If it works, the world will feel it.',
    gistNote: '✦ Inside gist: Complexity is cheap. Clear simplicity is expensive.',
    mood: '🔥 Real Talk',
  },
  {
    id: 'gist-3',
    headline: 'Start Mid-Thought, End at the Truth',
    reflection: 'Never bore someone with a five-minute prologue. Jump right into the wreckage, show the spark, and let the fragments snap together into a picture. The greatest stories begin where the fire starts.',
    gistNote: '✦ Inside gist: Life doesn’t give you an intro screen; your art shouldn’t either.',
    mood: '🖋 Storyteller’s Pulse',
  },
  {
    id: 'gist-4',
    headline: 'When the Signal Cuts Out',
    reflection: 'Built on the red dirt and rocky hills of Jos, where the power blinks and the internet hesitates. That taught us something vital: build tools that still work when the world goes offline. Never leave your user stranded with a blank white screen.',
    gistNote: '✦ Inside gist: Offline resilience isn’t a feature; it’s mutual respect.',
    mood: '🏔 Mountain Wisdom',
  },
  {
    id: 'gist-5',
    headline: 'Why Write a Story You Don’t Own?',
    reflection: 'Too many platforms want to hold your ideas hostage. We give you a rock-solid floor, ruthless editing tools, and novel-grade rhythm — but the story is yours. You own the copyright, the ink, and the testament.',
    gistNote: '✦ Inside gist: We provide the anvil; you shape the blade.',
    mood: '🛡 Sovereign Ally',
  },
  {
    id: 'gist-6',
    headline: 'The Uncomfortable Mirror',
    reflection: 'The hardest person to fool is the mirror, yet everyone tries. The Book of Lies isn’t judgment — it’s a quiet, funny, savage mirror showing where ambition became vanity. Read an episode, laugh at yourself, and build better tomorrow.',
    gistNote: '✦ Inside gist: The cure for ego is laughing at your own blueprints.',
    mood: '🪞 Reflective Mirror',
  },
];

export const WarmCompanionGist: React.FC<WarmCompanionGistProps> = ({ onExplore }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentGistIndex, setCurrentGistIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Check if dismissed recently
    const dismissedTime = localStorage.getItem('jadai_companion_dismissed');
    const now = Date.now();

    // Show after a gentle 2.5s delay if not dismissed in the last 2 hours
    if (!dismissedTime || now - parseInt(dismissedTime, 10) > 2 * 60 * 60 * 1000) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        // Randomize initial gist
        setCurrentGistIndex(Math.floor(Math.random() * INSIDE_GISTS.length));
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    try {
      StudioAudio.playClick();
    } catch {}
    setIsOpen(false);
    localStorage.setItem('jadai_companion_dismissed', String(Date.now()));
  };

  const handleNextGist = () => {
    try {
      StudioAudio.playClick();
    } catch {}
    setCurrentGistIndex((prev) => (prev + 1) % INSIDE_GISTS.length);
    setHasInteracted(true);
  };

  const currentGist = INSIDE_GISTS[currentGistIndex];

  if (!isOpen) {
    // Subtle small companion trigger in bottom-left corner
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          try {
            StudioAudio.playClick();
          } catch {}
        }}
        className="fixed bottom-6 left-6 z-[90] flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#0a0908]/90 border border-[rgba(201,168,76,0.3)] hover:border-[#C9A84C] text-xs font-mono text-[#e8c96a] shadow-xl backdrop-blur-xl transition-all cursor-pointer hover:scale-105"
        title="Open Reflective Companion & Inside Gists"
      >
        <Coffee className="w-3.5 h-3.5 text-[#C9A84C]" />
        <span>Reflective Buddy ☕</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-4 sm:left-6 z-[95] max-w-sm sm:max-w-md w-[calc(100vw-32px)] text-left animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="relative p-5 sm:p-6 rounded-3xl bg-[#0a0908]/95 border border-[rgba(201,168,76,0.35)] shadow-[0_25px_70px_rgba(0,0,0,0.95)] backdrop-blur-2xl overflow-hidden">
        {/* Warm Ambient Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C9A84C] via-[#e8c96a] to-[#C0392B]" />

        {/* Top Controls */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[rgba(201,168,76,0.15)] border border-[rgba(201,168,76,0.25)] text-[#e8c96a] font-bold">
              {currentGist.mood}
            </span>
            <span className="text-[10px] font-mono text-[#8a6e2a]">
              Inside Gist #{currentGistIndex + 1}/{INSIDE_GISTS.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleNextGist}
              className="p-1 rounded-lg text-[#8a6e2a] hover:text-[#e8c96a] hover:bg-white/5 transition-colors cursor-pointer"
              title="Another Reflective Gist"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Headline */}
        <h3 className="font-display font-bold text-lg text-[#f5f3f0] mb-2 leading-snug">
          {currentGist.headline}
        </h3>

        {/* Reflection Body */}
        <p className="text-xs text-[#c4c0bb] font-serif leading-relaxed mb-3">
          {currentGist.reflection}
        </p>

        {/* Gist Note */}
        <div className="p-2.5 rounded-xl bg-black/60 border border-[rgba(201,168,76,0.15)] mb-4">
          <p className="text-[11px] font-mono text-[#e8c96a] italic">
            {currentGist.gistNote}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-[rgba(201,168,76,0.15)]">
          <button
            onClick={handleNextGist}
            className="text-xs font-mono text-[#8a6e2a] hover:text-[#C9A84C] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Next Gist →</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 rounded-xl text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Quiet for now
            </button>
            <button
              onClick={() => {
                handleDismiss();
                if (onExplore) onExplore();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#C9A84C] text-[#050404] font-mono text-xs font-bold hover:bg-[#e8c96a] transition-all cursor-pointer flex items-center gap-1 shadow-md"
            >
              <span>Explore Workshop</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarmCompanionGist;
