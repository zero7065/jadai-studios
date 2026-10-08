'use client';

import React, { useState } from 'react';
import StatusBadge from '../ui/StatusBadge';
import EdgeGlow from '../ui/EdgeGlow';
import YinYangLoader from '../ui/YinYangLoader';
import LikeButton from '../ui/LikeButton';
import { getAllProjects } from '../../lib/data/portfolio';
import { StudioAudio } from '../../lib/watermark';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Globe,
  Sparkles,
  Layers,
  Code,
  Share2,
  Info,
  Maximize2,
} from 'lucide-react';

export const WorkCarousel: React.FC = () => {
  const projects = getAllProjects();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'preview' | 'stack' | 'details'>('preview');

  const active = projects[currentIndex];

  const handlePrev = () => {
    setIframeLoaded(false);
    setIframeError(false);
    setCurrentIndex((prev) => (prev === 0 ? projects.length - 1 : prev - 1));
    StudioAudio.playClick();
  };

  const handleNext = () => {
    setIframeLoaded(false);
    setIframeError(false);
    setCurrentIndex((prev) => (prev === projects.length - 1 ? 0 : prev + 1));
    StudioAudio.playClick();
  };

  const isLive = active.status === 'Live' || active.status === 'In Build';
  const liveUrl =
    active.slug === 'exampadi'
      ? 'https://exampadi.jadai.dev'
      : active.live_url || `https://${active.slug}.jadai.dev`;

  return (
    <div className="space-y-12 max-w-6xl mx-auto py-8 px-4 select-none">
      {/* 3D Tilt Stage with Radial Halo behind */}
      <div className="relative group">
        {/* Radial Gold Halo: 400px radius, 80px blur */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] pointer-events-none z-0 opacity-70"
          style={{
            background:
              'radial-gradient(circle, rgba(201,168,76,0.3) 0%, rgba(192,57,43,0.15) 45%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />

        {/* 3D Tilt Wrapper: rotateX(2deg) rotateY(-2deg), perspective 1500px */}
        <div
          className="relative z-10 transition-transform duration-500 ease-out"
          style={{
            transform: 'perspective(1500px) rotateX(2deg) rotateY(-2deg)',
          }}
        >
          {/* Electric edge glow: SVG stroke along 2px perimeter, animated gold → crimson → gold, 3s infinite */}
          <div className="electric-frame rounded-2xl p-[2px] shadow-[0_30px_90px_rgba(0,0,0,0.95)]">
            <div className="rounded-[14px] bg-[#050404] overflow-hidden border border-[rgba(201,168,76,0.4)] flex flex-col">
              {/* Browser Chrome Header with 3 Dots (red/yellow/gold) & Gold URL Bar */}
              <div className="px-4 py-3 bg-[#0a0908] border-b border-[rgba(201,168,76,0.25)] flex items-center justify-between gap-4">
                {/* 3 Window Dots: red / yellow / gold */}
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#C0392B] shadow-[0_0_8px_rgba(192,57,43,0.6)]" />
                  <span className="w-3 h-3 rounded-full bg-[#f39c12] shadow-[0_0_8px_rgba(243,156,18,0.6)]" />
                  <span className="w-3 h-3 rounded-full bg-[#C9A84C] shadow-[0_0_8px_rgba(201,168,76,0.6)]" />

                  <div className="ml-3 hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.25)] text-[10px] font-mono text-[#e8c96a]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
                    <span>Jadai Browser Frame</span>
                  </div>
                </div>

                {/* Gold URL Bar with gold accent */}
                <div className="flex-1 max-w-md mx-auto px-4 py-1.5 rounded-full bg-[#050404] border border-[#C9A84C]/50 flex items-center justify-center gap-2 text-xs font-mono text-[#e8c96a] shadow-[inset_0_1px_4px_rgba(0,0,0,0.8)]">
                  <Globe className="w-3.5 h-3.5 text-[#C9A84C]" />
                  <span className="truncate">{liveUrl}</span>
                </div>

                {/* Counter & Status */}
                <div className="flex items-center gap-3">
                  <StatusBadge status={active.status} variant="gold" />
                  <span className="text-[10px] font-mono text-[#8a6e2a] hidden sm:inline">
                    {currentIndex + 1} / {projects.length}
                  </span>
                </div>
              </div>

              {/* Browser Main Body: Gadtfes-style Left Sidebar + Main Viewport */}
              <div className="flex flex-row relative min-h-[480px]">
                {/* Gadtfes-style Left Sidebar with Rounded Icon Buttons */}
                <aside className="w-14 sm:w-16 bg-[#0a0908]/95 border-r border-[rgba(201,168,76,0.2)] flex flex-col items-center justify-between py-4 shrink-0">
                  <div className="space-y-3 flex flex-col items-center">
                    <button
                      onClick={() => setActiveSidebarTab('preview')}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                        activeSidebarTab === 'preview'
                          ? 'bg-[#C9A84C] text-[#050404] shadow-[0_0_12px_rgba(201,168,76,0.5)]'
                          : 'text-[#8a6e2a] hover:text-[#C9A84C] hover:bg-white/5'
                      }`}
                      title="Live Viewport"
                    >
                      <Layers className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setActiveSidebarTab('stack')}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                        activeSidebarTab === 'stack'
                          ? 'bg-[#C9A84C] text-[#050404] shadow-[0_0_12px_rgba(201,168,76,0.5)]'
                          : 'text-[#8a6e2a] hover:text-[#C9A84C] hover:bg-white/5'
                      }`}
                      title="Architecture Stack"
                    >
                      <Code className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setActiveSidebarTab('details')}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                        activeSidebarTab === 'details'
                          ? 'bg-[#C9A84C] text-[#050404] shadow-[0_0_12px_rgba(201,168,76,0.5)]'
                          : 'text-[#8a6e2a] hover:text-[#C9A84C] hover:bg-white/5'
                      }`}
                      title="System Dossier"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(liveUrl);
                      StudioAudio.playClick();
                      alert('Project URL copied to clipboard');
                    }}
                    className="p-2.5 rounded-xl text-[#8a6e2a] hover:text-[#C9A84C] hover:bg-white/5 transition-colors cursor-pointer"
                    title="Share Link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </aside>

                {/* Viewport Content */}
                <div className="flex-1 relative bg-[#050404] flex flex-col justify-between overflow-hidden">
                  {activeSidebarTab === 'preview' && (
                    <>
                      {isLive && !iframeError ? (
                        <div className="relative w-full h-[480px] bg-[#050404] overflow-hidden">
                          <iframe
                            src={liveUrl}
                            title={active.title}
                            className="w-full h-full border-none bg-black"
                            loading="lazy"
                            onLoad={() => setIframeLoaded(true)}
                            onError={() => setIframeError(true)}
                          />

                          {!iframeLoaded && (
                            <div className="absolute inset-0 bg-[#050404]/90 flex items-center justify-center">
                              <YinYangLoader size={70} text={`Loading ${active.title}...`} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-8 sm:p-12 flex flex-col justify-center items-center text-center space-y-4 my-auto min-h-[480px]">
                          <div className="w-16 h-16 rounded-full bg-[rgba(201,168,76,0.12)] border border-[#C9A84C] flex items-center justify-center text-[#C9A84C]">
                            <Sparkles className="w-8 h-8" />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a]">
                              {active.category}
                            </span>
                            <h3 className="text-3xl font-display font-bold text-[#f5f3f0]">
                              {active.title}
                            </h3>
                            <p className="text-sm font-mono text-[#8a6e2a] max-w-lg mx-auto">
                              {active.tagline}
                            </p>
                          </div>
                          <p className="text-xs font-serif text-[#c4c0bb] max-w-xl mx-auto leading-relaxed">
                            {active.description}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {activeSidebarTab === 'stack' && (
                    <div className="p-8 space-y-6 my-auto max-w-xl mx-auto">
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A84C]">
                          Architectural Invariants
                        </span>
                        <h4 className="text-2xl font-display font-bold text-[#f5f3f0]">
                          {active.title} Core Stack
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                        {active.stack.map((s) => (
                          <div
                            key={s}
                            className="p-3 rounded-xl bg-[#0a0908] border border-[rgba(201,168,76,0.25)] text-[#e8c96a] flex items-center gap-2"
                          >
                            <span className="text-[#C9A84C]">✦</span>
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeSidebarTab === 'details' && (
                    <div className="p-8 space-y-4 my-auto max-w-xl mx-auto font-serif text-sm text-[#c4c0bb] leading-relaxed">
                      <h4 className="text-xl font-display font-bold text-[#f5f3f0]">
                        Dossier: {active.title}
                      </h4>
                      <p>{active.long_description || active.description}</p>
                      <div className="pt-4 border-t border-[rgba(201,168,76,0.15)] font-mono text-xs text-[#8a6e2a]">
                        Engineered under Jadai Studios standard: Build the floor.
                      </div>
                    </div>
                  )}

                  {/* Bottom Overlay Specs Strip */}
                  <div className="bg-gradient-to-t from-black via-black/90 to-transparent p-4 sm:p-5 border-t border-[rgba(201,168,76,0.2)] flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-lg text-[#f5f3f0]">
                          {active.title}
                        </h3>
                        <LikeButton targetType="portfolio" targetId={active.id} initialLikes={0} size="sm" />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {active.stack.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.2)] text-[#e8c96a]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Open Live Pill */}
                    <div className="flex items-center gap-3">
                      <EdgeGlow intensity="intense" color="dual" borderRadius={9999}>
                        <a
                          href={liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2 rounded-full bg-[#C9A84C] text-[#050404] font-mono text-xs font-bold tracking-wider hover:bg-[#e8c96a] transition-all flex items-center gap-1.5 shadow-lg uppercase"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open Live System</span>
                        </a>
                      </EdgeGlow>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reflection Below: scaleY(-1), 60% opacity, gradient fade mask */}
        <div
          aria-hidden="true"
          className="w-full h-24 overflow-hidden pointer-events-none mt-2 filter blur-[1px] hidden sm:block"
          style={{
            transform: 'perspective(1500px) scaleY(-1) rotateX(-2deg)',
            opacity: 0.6,
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 80%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 80%)',
          }}
        >
          <div className="rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.25)] p-4 text-center">
            <h4 className="font-display text-sm font-bold text-[#f5f3f0]">{active.title}</h4>
          </div>
        </div>
      </div>

      {/* Prev / Next Arrows & Dot Indicators */}
      <div className="flex items-center justify-between pt-4 border-t border-[rgba(201,168,76,0.15)]">
        <EdgeGlow intensity="medium" color="gold" borderRadius={9999}>
          <button
            onClick={handlePrev}
            className="p-3 rounded-full bg-[#0a0908] border border-[rgba(201,168,76,0.4)] text-[#C9A84C] hover:text-[#f5f3f0] transition-colors cursor-pointer"
            aria-label="Previous Project"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </EdgeGlow>

        {/* Dot Indicators */}
        <div className="flex items-center gap-2">
          {projects.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentIndex(i);
                StudioAudio.playClick();
              }}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                currentIndex === i
                  ? 'w-6 bg-[#C9A84C] shadow-[0_0_8px_#C9A84C]'
                  : 'w-1.5 bg-[rgba(201,168,76,0.25)] hover:bg-[rgba(201,168,76,0.6)]'
              }`}
              aria-label={`Go to project ${i + 1}`}
            />
          ))}
        </div>

        <EdgeGlow intensity="medium" color="gold" borderRadius={9999}>
          <button
            onClick={handleNext}
            className="p-3 rounded-full bg-[#0a0908] border border-[rgba(201,168,76,0.4)] text-[#C9A84C] hover:text-[#f5f3f0] transition-colors cursor-pointer"
            aria-label="Next Project"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </EdgeGlow>
      </div>
    </div>
  );
};

export default WorkCarousel;
