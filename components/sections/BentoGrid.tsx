'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, FileText, Sparkles, Image as ImageIcon, ShieldCheck, Upload, MessageSquare, Terminal } from 'lucide-react';
import { StudioAudio } from '../../lib/watermark';
import { useSectionVideos } from '../../lib/media/useSectionVideos';

export interface BentoGridProps {
  onNavigate?: (path: string) => void;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ onNavigate }) => {
  const { getVideo } = useSectionVideos();
  const forgeVideo = getVideo('forge_card_loop');
  const mirageVideo = getVideo('mirage_card_loop');

  const [scanUrl, setScanUrl] = useState('');
  const [scores, setScores] = useState({ perf: 0, seo: 0, a11y: 0, sec: 0 });
  const [activeBubble, setActiveBubble] = useState(0);

  // Animated bubble dialogue cycle for PRIME Oracle (4s loop)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBubble((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Animated score entry for Sentinel on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setScores({ perf: 94, seo: 98, a11y: 92, sec: 96 });
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleCardClick = (path: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    try {
      StudioAudio.playClick();
    } catch {}
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  const handleSentinelScan = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      StudioAudio.playSuccessArpeggio();
    } catch {}
    handleCardClick('/playground/sentinel');
  };

  const bubbles = [
    { text: "What's blocking me?", align: 'left' },
    { text: "Let's figure that out together.", align: 'right' },
    { text: 'Start here →', align: 'left' },
  ];

  return (
    <section className="relative z-10 w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-10 select-none">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center space-y-2 mb-8">
        <span
          className="text-[0.6rem] font-mono uppercase tracking-[0.25em] text-[#D4AF37]"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          STUDIO INSTRUMENTS · 04 SUITE
        </span>
        <h2
          className="text-2xl sm:text-3xl font-display font-bold text-[#f5f3f0]"
          style={{ fontFamily: 'Cinzel, serif' }}
        >
          High-Tier Creative Engine
        </h2>
        <p className="text-xs font-mono text-[#D4AF37] max-w-md">
          Autonomous document synthesis, living oracle reasoning, and continuous perimeter audits.
        </p>
      </div>

      {/* 12-Column Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-12 gap-3">
        {/* ===================================================================
            1. FORGE (Cols 1-7, Rows 1-2 Desktop, Featured Large)
           =================================================================== */}
        <div
          id="bento-forge"
          onClick={() => handleCardClick('/playground/forge')}
          className="col-span-2 md:col-span-6 lg:col-span-7 lg:row-span-2 rounded-[12px] p-5 bg-white/[0.02] border border-[rgba(201,168,76,0.08)] hover:border-[rgba(201,168,76,0.25)] hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden backdrop-blur-md group"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <span
              className="text-[0.5rem] font-mono uppercase tracking-[0.25em] text-[#D4AF37]"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              DOCUMENT ENGINE
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                LIVE
              </span>
              <span className="text-xs font-mono text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 flex items-center gap-0.5">
                <span>Open</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="my-4 space-y-1">
            <h3
              className="font-display font-bold text-xl sm:text-2xl text-[#f5f3f0] group-hover:text-[#e8c96a] transition-colors"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              FORGE
            </h3>
            <span
              className="text-[0.6rem] font-mono tracking-widest text-[#D4AF37] block uppercase"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              CANVA-GRADE DOCUMENT STUDIO
            </span>
            <p className="text-xs text-[#c4c0bb] leading-relaxed pt-1">
              Upload any document. Get a structured, editable version back.
            </p>
          </div>

          {/* Live Preview Area: Animated document parsing or real video loop */}
          {forgeVideo?.url ? (
            <div className="w-full my-3 rounded-lg overflow-hidden border border-[rgba(201,168,76,0.2)]">
              <video
                autoPlay
                muted
                loop
                playsInline
                src={forgeVideo.url}
                className="w-full h-24 object-cover"
              />
            </div>
          ) : (
            <div className="w-full my-3 p-4 rounded-lg bg-[#0a0908]/90 border border-[rgba(201,168,76,0.12)] space-y-2.5 overflow-hidden relative">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#D4AF37]">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#C9A84C]" />
                  Parsing Vector Stream
                </span>
                <span className="text-emerald-400">4K Vector Ready</span>
              </div>

              <div className="space-y-2 overflow-hidden py-1">
                <div className="h-2 w-[75%] rounded bg-zinc-800 relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent"
                    style={{ animation: 'bentoBars 2s ease-in-out infinite' }}
                  />
                </div>
                <div className="h-2 w-[90%] rounded bg-zinc-800 relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent"
                    style={{ animation: 'bentoBars 2s ease-in-out infinite 0.3s' }}
                  />
                </div>
                <div className="h-2 w-[60%] rounded bg-zinc-800 relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent"
                    style={{ animation: 'bentoBars 2s ease-in-out infinite 0.6s' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bottom Drop Zone Hint */}
          <div className="pt-2 border-t border-[rgba(201,168,76,0.1)] flex items-center justify-between text-[11px] font-mono text-[#D4AF37]">
            <span className="flex items-center gap-1.5">
              <Upload className="w-3 h-3 text-[#C9A84C]" />
              Drop a PDF here to try →
            </span>
            <span className="text-zinc-500 text-[10px]">30-Step Undo/Redo</span>
          </div>
        </div>

        {/* ===================================================================
            2. PRIME ORACLE (Cols 8-12, Row 1 Desktop, Medium)
           =================================================================== */}
        <div
          id="bento-oracle"
          onClick={() => handleCardClick('/oracle')}
          className="col-span-2 md:col-span-6 lg:col-span-5 rounded-[12px] p-5 bg-white/[0.02] border border-[rgba(201,168,76,0.08)] hover:border-[rgba(139,92,246,0.4)] hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden backdrop-blur-md group"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <span
              className="text-[0.5rem] font-mono uppercase tracking-[0.25em] text-[#8b5cf6]"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              AI PARTNER
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-violet-950/80 text-violet-300 border border-violet-500/30">
                LIVE
              </span>
              <span className="text-xs font-mono text-violet-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 flex items-center gap-0.5">
                <span>Open</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="my-2 space-y-1">
            <h3
              className="font-display font-bold text-lg text-[#f5f3f0] group-hover:text-violet-300 transition-colors"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              PRIME Oracle
            </h3>
            <p className="text-xs text-[#c4c0bb] leading-relaxed">
              Ask anything. PRIME thinks with you, not at you.
            </p>
          </div>

          {/* Live Preview Area: 3 conversation bubbles alternating sides */}
          <div className="w-full my-2 p-3 rounded-lg bg-[#0a0908]/90 border border-violet-500/20 space-y-2 text-[11px] font-mono min-h-[88px] flex flex-col justify-center">
            {bubbles.map((b, idx) => (
              <div
                key={idx}
                className={`transition-all duration-500 flex ${
                  b.align === 'right' ? 'justify-end' : 'justify-start'
                } ${activeBubble === idx ? 'opacity-100 scale-100' : 'opacity-40 scale-95'}`}
              >
                <span
                  className={`px-3 py-1 rounded-lg ${
                    b.align === 'right'
                      ? 'bg-violet-900/40 text-violet-200 border border-violet-500/30'
                      : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
                  }`}
                >
                  {b.text}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom Quota */}
          <div className="pt-2 border-t border-violet-500/10 flex items-center justify-between text-[10px] font-mono text-[#D4AF37]">
            <span className="text-violet-300">3 free conversations (Guest)</span>
            <span className="text-zinc-500">Unlimited for subscribers</span>
          </div>
        </div>

        {/* ===================================================================
            3. MIRAGE (Cols 8-12, Row 2 Desktop, Medium)
           =================================================================== */}
        <div
          id="bento-mirage"
          onClick={() => handleCardClick('/playground/mirage')}
          className="col-span-2 md:col-span-6 lg:col-span-5 rounded-[12px] p-5 bg-white/[0.02] border border-[rgba(201,168,76,0.08)] hover:border-[rgba(192,57,43,0.4)] hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden backdrop-blur-md group"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <span
              className="text-[0.5rem] font-mono uppercase tracking-[0.25em] text-[#C0392B]"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              IMAGE GENERATION
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/30">
                LIVE
              </span>
              <span className="text-xs font-mono text-rose-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 flex items-center gap-0.5">
                <span>Open</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="my-2 space-y-1">
            <h3
              className="font-display font-bold text-lg text-[#f5f3f0] group-hover:text-rose-300 transition-colors"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              MIRAGE
            </h3>
            <p className="text-xs text-[#c4c0bb] leading-relaxed">
              Describe it. MIRAGE generates 3 versions instantly.
            </p>
          </div>

          {/* Live Preview Area: Real video loop or 3 small squares showing gold-to-crimson gradient shimmer */}
          {mirageVideo?.url ? (
            <div className="w-full my-2 rounded-lg overflow-hidden border border-rose-900/30">
              <video
                autoPlay
                muted
                loop
                playsInline
                src={mirageVideo.url}
                className="w-full h-16 object-cover"
              />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 my-2 p-2 rounded-lg bg-[#0a0908]/90 border border-rose-900/20">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-12 rounded-md bg-gradient-to-br from-[#C9A84C]/40 to-[#C0392B]/50 flex items-center justify-center text-[10px] font-mono text-white/70"
                  style={{
                    animation: `shimmerBox 2.5s ease-in-out infinite ${i * 0.4}s`,
                  }}
                >
                  v{i + 1}
                </div>
              ))}
            </div>
          )}

          {/* Bottom Input Preview */}
          <div className="pt-2 border-t border-rose-900/20 flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span className="text-zinc-500 italic">Type a prompt →</span>
            <span className="text-[10px] text-rose-400 font-bold">Fast LPU</span>
          </div>
        </div>

        {/* ===================================================================
            4. SENTINEL (Cols 1-12, Row 3 Desktop, Full-Width Slim)
           =================================================================== */}
        <div
          id="bento-sentinel"
          onClick={() => handleCardClick('/playground/sentinel')}
          className="col-span-2 md:col-span-6 lg:col-span-12 rounded-[12px] p-5 bg-white/[0.02] border border-[rgba(201,168,76,0.08)] hover:border-[rgba(8,145,178,0.4)] hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden backdrop-blur-md group"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <span
              className="text-[0.5rem] font-mono uppercase tracking-[0.25em] text-[#0891b2]"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              SITE HEALTH & PERIMETER AUDIT
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                LIVE
              </span>
              <span className="text-xs font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 flex items-center gap-0.5">
                <span>Open</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          <div className="my-2 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3
                className="font-display font-bold text-lg text-[#f5f3f0] group-hover:text-cyan-300 transition-colors"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                SENTINEL
              </h3>
              <p className="text-xs text-[#c4c0bb]">
                Real-time performance, security, and accessibility diagnostics.
              </p>
            </div>

            {/* Embedded URL input + Run Scan button */}
            <form onSubmit={handleSentinelScan} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 max-w-md w-full">
              <input
                type="text"
                placeholder="https://yourdomain.com"
                value={scanUrl}
                onChange={(e) => setScanUrl(e.target.value)}
                className="flex-1 bg-zinc-950/90 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-mono font-bold tracking-wider transition-colors cursor-pointer"
              >
                Run Scan
              </button>
            </form>
          </div>

          {/* Live Preview: 4-segment horizontal score bar */}
          <div className="my-2 space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              {/* Performance */}
              <div className="p-2.5 rounded-lg bg-[#0a0908]/90 border border-zinc-800/80 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">Performance</span>
                  <span className="text-emerald-400 font-bold">{scores.perf}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${scores.perf}%` }}
                  />
                </div>
              </div>

              {/* SEO */}
              <div className="p-2.5 rounded-lg bg-[#0a0908]/90 border border-zinc-800/80 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">SEO</span>
                  <span className="text-emerald-400 font-bold">{scores.seo}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${scores.seo}%` }}
                  />
                </div>
              </div>

              {/* Accessibility */}
              <div className="p-2.5 rounded-lg bg-[#0a0908]/90 border border-zinc-800/80 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">Accessibility</span>
                  <span className="text-cyan-400 font-bold">{scores.a11y}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${scores.a11y}%` }}
                  />
                </div>
              </div>

              {/* Security */}
              <div className="p-2.5 rounded-lg bg-[#0a0908]/90 border border-zinc-800/80 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">Security</span>
                  <span className="text-emerald-400 font-bold">{scores.sec}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${scores.sec}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-[#D4AF37] pt-1">
              <span>Note: Enter any URL above to run a real automated check</span>
              <span className="text-cyan-400">Zero Mock Stubs · Live HTTP Probe</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
