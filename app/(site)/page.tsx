'use client';

import React, { useState, useEffect } from 'react';
import Hero from '@/components/sections/Hero';
import CascadingCategorizedDisplay from '@/components/sections/CascadingCategorizedDisplay';
import ServicesVoid from '@/components/sections/ServicesVoid';
import BookOfLiesSlider from '@/components/content/BookOfLiesSlider';
import CommunityFeed from '@/components/sections/CommunityFeed';
import HumanGlassmorphicChat from '@/components/ai/HumanGlassmorphicChat';
import RatingFeedbackModal from '@/components/feedback/RatingFeedbackModal';
import SubscribeModal from '@/components/layout/SubscribeModal';
import WarmCompanionGist from '@/components/ui/WarmCompanionGist';
import GlassCard from '@/components/ui/GlassCard';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import SacredGeometry from '@/components/ui/SacredGeometry';
import NewsletterForm from '@/components/forms/NewsletterForm';
import DefensiveFallback from '@/components/ui/DefensiveFallback';
import { getAllBookOfLies } from '@/lib/data/book-of-lies';
import { StudioAudio } from '@/lib/watermark';
import { BookOpen, Terminal, Sparkles, ArrowRight, Flame, MessageSquare, Star } from 'lucide-react';

export interface HomePageProps {
  onNavigate?: (path: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps = {}) {
  let latestEpisode: any;
  try {
    latestEpisode = getAllBookOfLies()[0];
  } catch {
    latestEpisode = null;
  }
  const [easterEggActive, setEasterEggActive] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [renderError, setRenderError] = useState(false);

  // Check interaction count for Rating modal trigger after 12+ interactions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const interactions = parseInt(localStorage.getItem('jadai-interaction-count') || '0', 10);
      const ratingShown = localStorage.getItem('jadai-rating-modal-shown');
      if (interactions >= 12 && !ratingShown) {
        setTimeout(() => {
          setRatingOpen(true);
          localStorage.setItem('jadai-rating-modal-shown', 'true');
        }, 5000);
      }
    }
  }, []);

  const trackInteraction = () => {
    if (typeof window !== 'undefined') {
      const current = parseInt(localStorage.getItem('jadai-interaction-count') || '0', 10);
      localStorage.setItem('jadai-interaction-count', String(current + 1));
    }
  };

  // Konami Code: Up, Up, Down, Down, Left, Right, Left, Right, b, a
  useEffect(() => {
    const konamiSequence = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ];
    let keyIndex = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === konamiSequence[keyIndex].toLowerCase()) {
        keyIndex++;
        if (keyIndex === konamiSequence.length) {
          keyIndex = 0;
          StudioAudio.playSuccessArpeggio();
          setEasterEggActive(true);
        }
      } else {
        keyIndex = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (path: string) => {
    trackInteraction();
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  if (renderError) {
    return <DefensiveFallback onNavigate={handleNavigate} />;
  }

  return (
    <div className="space-y-20 sm:space-y-28 pb-32 relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full overflow-hidden">
      {/* 1. Hero Section */}
      <Hero
        onSeeWork={() => handleNavigate('/work')}
        onMeetPrime={() => setChatOpen(true)}
        onOpenAuth={() => {
          window.dispatchEvent(new CustomEvent('jadai_open_auth'));
        }}
        onExploreGuest={() => {
          const el = document.getElementById('studio-tools-section') || document.getElementById('playground-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onNavigate={handleNavigate}
      />

      {/* Subtle animated gold gradient line as a section separator between Hero and Playground */}
      <div className="w-full px-6 max-w-7xl mx-auto -my-4 relative">
        <div className="gold-separator-line">
          <div className="gold-separator-glow" />
        </div>
      </div>

      {/* 2. CATEGORIZED CASCADING DISPLAY (Playground Section) */}
      <section id="studio-tools-section" className="relative w-full pt-4">
        <CascadingCategorizedDisplay onNavigate={handleNavigate} />
      </section>

      {/* 3. The Three Pillars in the Void */}
      <section id="work-section" className="relative w-full">
        <ServicesVoid />
      </section>

      {/* 4. The Book of Lies & Quotes Sliding Showcase */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[rgba(201,168,76,0.2)] pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C0392B] flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              Nightly Reflections • 9:47 PM WAT
            </span>
            <h2 className="text-3xl font-display font-bold text-[#f5f3f0]">
              The Book of Lies & Quotes
            </h2>
          </div>
          <a
            href="/book-of-lies"
            onClick={(e) => {
              e.preventDefault();
              handleNavigate('/book-of-lies');
            }}
            className="text-xs font-mono text-[#8a6e2a] hover:text-[#C9A84C] transition-colors flex items-center gap-1"
          >
            <span>Explore All 8 Themes — 7 Sins & Discernment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Animated Carousel Slider */}
        <BookOfLiesSlider onSelectEpisode={(ep) => handleNavigate(`/book-of-lies/${ep.slug}`)} />

        {/* PRIME Companion Callout */}
        <GlassCard className="p-8 border-[rgba(201,168,76,0.3)] hover:border-[#C9A84C] transition-all space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9A84C] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Adaptive Intelligence
                </span>
                <StatusBadge status="Autonomous" variant="gold" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#f5f3f0]">
                Meet PRIME — The Resident Architect
              </h3>
              <p className="text-xs sm:text-sm text-[#c4c0bb] max-w-2xl leading-relaxed">
                Trained on high-availability architecture, failure modes, and first-principles discipline. Chats directly, provides concrete answers, and streams at 25ms cadence.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  StudioAudio.playClick();
                  setChatOpen(true);
                }}
              >
                <Terminal className="w-4 h-4 mr-2" />
                <span>Open PRIME Chat</span>
              </Button>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* 5. COMMUNITY FEED SECTION (Section 10) */}
      <section className="relative w-full">
        <CommunityFeed onNavigate={handleNavigate} />
      </section>

      {/* 6. Newsletter Signup Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <GlassCard className="p-8 text-center space-y-4 border-[rgba(201,168,76,0.25)]">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9A84C] block">
            Autonomous Dispatch
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#f5f3f0]">
            Receive First Signals
          </h2>
          <p className="text-xs text-[#c4c0bb] max-w-md mx-auto leading-relaxed">
            Zero marketing spam. Only architectural breakdowns, Book of Lies transmissions, and released software kernels.
          </p>

          <div className="pt-2 max-w-md mx-auto">
            <NewsletterForm source="home_footer_card" />
          </div>
        </GlassCard>
      </section>

      {/* Floating Glassmorphic AI Chat Trigger (Floating Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-[85]">
        <button
          onClick={() => {
            StudioAudio.playClick();
            setChatOpen(true);
            trackInteraction();
          }}
          className="relative px-4 py-3 rounded-full bg-[#0a0908]/90 border border-[#C9A84C] shadow-[0_0_25px_rgba(201,168,76,0.4)] text-[#e8c96a] font-mono text-xs font-bold flex items-center gap-2 hover:scale-105 transition-all cursor-pointer backdrop-blur-xl group"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Chat with PRIME</span>
          <Sparkles className="w-3.5 h-3.5 text-[#C9A84C] group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* Glassmorphic AI Chat Panel (Expandable to Full-Screen) */}
      <HumanGlassmorphicChat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* 5-Star Jiggle Rating Modal (Section 11) */}
      <RatingFeedbackModal
        isOpen={ratingOpen}
        onClose={() => setRatingOpen(false)}
        onSubscribePrompt={() => {
          setRatingOpen(false);
          setSubscribeOpen(true);
        }}
      />

      {/* Artistic 30-Second Character Reveal Subscribe Modal (Section 12) */}
      <SubscribeModal
        isOpen={subscribeOpen}
        onClose={() => setSubscribeOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Easter Egg Modal */}
      {easterEggActive && (
        <Modal
          isOpen={easterEggActive}
          onClose={() => setEasterEggActive(false)}
          title="⬡ SACRED GEOMETRY BURST UNLOCKED"
          maxWidth="max-w-lg"
        >
          <div className="text-center space-y-5 py-4 font-mono text-xs">
            <div className="flex justify-center animate-spin" style={{ animationDuration: '20s' }}>
              <SacredGeometry size={120} className="text-[#C9A84C]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-display font-bold text-[#f5f3f0]">
                Konami Sequence Recognized
              </h3>
              <p className="text-[#e8c96a]">
                "The floor is established. The geometry is true."
              </p>
            </div>
            <p className="text-[11px] text-[#c4c0bb]">
              You have uncovered the studio's hidden mathematical invariant. All 13 circles of Metatron resonate with the 12 positions of the Vault Dial.
            </p>
            <Button variant="primary" size="sm" onClick={() => setEasterEggActive(false)}>
              Re-engage Public View
            </Button>
          </div>
        </Modal>
      )}

      {/* Warm Reflective Companion & Inside Gists */}
      <WarmCompanionGist onExplore={() => handleNavigate('/services')} />
    </div>
  );
}
