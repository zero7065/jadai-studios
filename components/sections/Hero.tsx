'use client';

import React from 'react';
import Interactive3DSigilHero from '../home/Interactive3DSigilHero';
import { StudioAudio } from '../../lib/watermark';

export interface HeroProps {
  onSeeWork?: () => void;
  onMeetPrime?: () => void;
  onOpenAuth?: () => void;
  onExploreGuest?: () => void;
  onNavigate?: (path: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onSeeWork,
  onMeetPrime,
  onOpenAuth,
  onExploreGuest,
  onNavigate,
}) => {
  const scrollToTarget = (targetId: string, fallbackPath: string) => {
    try {
      StudioAudio.playClick();
    } catch {}
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (onNavigate) {
      onNavigate(fallbackPath);
    } else {
      window.location.href = fallbackPath;
    }
  };

  return (
    <section className="hero relative w-full flex flex-col items-center justify-center pt-2 sm:pt-6 pb-16 overflow-hidden select-none">
      {/* 1. EXPANDED 3D INTERACTIVE SIGIL, LOGO & 12D FUTURISTIC HERO */}
      <Interactive3DSigilHero
        onNavigate={onNavigate}
        onEnter={() => {
          if (onOpenAuth) {
            onOpenAuth();
          } else {
            window.dispatchEvent(new CustomEvent('jadai_open_auth_modal'));
          }
        }}
      />

      {/* 2. SOCIAL PROOF / STATS STRIP (4 Glass Cards with Hover Glow) */}
      <div id="social-proof-strip" className="relative z-10 w-full max-w-[1100px] px-4 sm:px-6 mt-8 sm:mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 overflow-x-auto pb-2">
          {/* Card 1: 70 Parables */}
          <div
            onClick={() => scrollToTarget('work-section', '/book-of-lies')}
            className="p-4 rounded-2xl bg-[rgba(15,14,12,0.7)] border border-[rgba(201,168,76,0.25)] hover:border-[#C9A84C] opacity-80 hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-xl flex flex-col justify-between text-left group shadow-lg"
          >
            <span
              className="text-xl sm:text-2xl font-display font-bold text-[#C9A84C] group-hover:text-[#e8c96a] transition-colors"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              70 Parables
            </span>
            <p className="text-xs font-mono text-[#c4c0bb] mt-1 leading-snug">
              Book of Lies uncut reflections
            </p>
          </div>

          {/* Card 2: $0 / ₦0 */}
          <div
            onClick={() => scrollToTarget('pricing-section', '/upgrade')}
            className="p-4 rounded-2xl bg-[rgba(15,14,12,0.7)] border border-[rgba(201,168,76,0.25)] hover:border-[#C9A84C] opacity-80 hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-xl flex flex-col justify-between text-left group shadow-lg"
          >
            <span
              className="text-xl sm:text-2xl font-display font-bold text-[#C9A84C] group-hover:text-[#e8c96a] transition-colors"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              $0 / ₦0
            </span>
            <p className="text-xs font-mono text-[#c4c0bb] mt-1 leading-snug">
              Free floor to start your journey
            </p>
          </div>

          {/* Card 3: 5 Suites */}
          <div
            onClick={() => scrollToTarget('studio-tools-section', '/services')}
            className="p-4 rounded-2xl bg-[rgba(15,14,12,0.7)] border border-[rgba(201,168,76,0.25)] hover:border-[#C9A84C] opacity-80 hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-xl flex flex-col justify-between text-left group shadow-lg"
          >
            <span
              className="text-xl sm:text-2xl font-display font-bold text-[#C9A84C] group-hover:text-[#e8c96a] transition-colors"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              5 Suites
            </span>
            <p className="text-xs font-mono text-[#c4c0bb] mt-1 leading-snug">
              Story, Codex, Forge, Radar & Systems
            </p>
          </div>

          {/* Card 4: Global Craft */}
          <div
            onClick={() => scrollToTarget('origins-section', '/about')}
            className="p-4 rounded-2xl bg-[rgba(15,14,12,0.7)] border border-[rgba(201,168,76,0.25)] hover:border-[#C9A84C] opacity-80 hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-xl flex flex-col justify-between text-left group shadow-lg"
          >
            <span
              className="text-xl sm:text-2xl font-display font-bold text-[#C9A84C] group-hover:text-[#e8c96a] transition-colors"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              Jos → World
            </span>
            <p className="text-xs font-mono text-[#c4c0bb] mt-1 leading-snug">
              Highland craft, global clients
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
