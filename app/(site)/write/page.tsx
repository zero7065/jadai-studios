'use client';

import React, { useState, useEffect, useRef } from 'react';
import { StudioAudio } from '@/lib/watermark';
import { useToast } from '@/components/providers/ToastProvider';
import { useCurrency } from '@/components/providers/CurrencyProvider';
import WritingStudio from '@/components/creative/WritingStudio';
import GhostwritingWorkspace from '@/components/writer/GhostwritingWorkspace';
import {
  Feather,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  Globe,
  Layers,
  Maximize2,
  Minimize2,
  FileText,
  Sliders,
  Compass,
} from 'lucide-react';

export default function DedicatedWritePage() {
  const [workspaceMode, setWorkspaceMode] = useState<'flow' | 'codex'>('flow');
  const [zenMode, setZenMode] = useState(false);
  const { showToast } = useToast();
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
        setIsPwaInstalled(true);
      }
    }
  }, []);

  const handleInstallPwa = () => {
    StudioAudio.playClick();
    showToast(
      'To install Writing Studio as a standalone app: tap your browser menu (⋮ or Share) and select "Add to Home Screen". Your drafts sync offline instantly!',
      'info',
      'Standalone PWA'
    );
  };

  return (
    <div className="min-h-screen bg-[#050404] text-[#c4c0bb] pb-20 relative overflow-hidden selection:bg-[#C9A84C] selection:text-[#050404]">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-[#C9A84C]/5 blur-[120px]" />
        <div className="absolute bottom-1/3 -right-32 w-96 h-96 rounded-full bg-[#C0392B]/5 blur-[140px]" />
      </div>

      <div className={`relative z-10 transition-all duration-300 ${zenMode ? 'max-w-full px-2 sm:px-4 pt-16' : 'max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 space-y-6'}`}>
        {/* Unified Sanctuary Header */}
        {!zenMode && (
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[rgba(201,168,76,0.2)] pb-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.3)] text-[#e8c96a] text-xs font-mono">
                <Feather className="w-3.5 h-3.5 text-[#C9A84C]" />
                <span>JADAI STUDIOS • UNIFIED WRITER'S SANCTUARY</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-display font-black text-[#f5f3f0] tracking-tight">
                We Provide the Floor. <span className="text-[#C9A84C]">You Own the Story.</span>
              </h1>
              <p className="text-sm sm:text-base text-[#a8a49e] font-serif leading-relaxed">
                A seamless, distraction-free writing environment. Switch smoothly between kinetic story flow and full multi-chapter book architecture without losing a single sentence.
              </p>
            </div>

            {/* Quick Actions & Workspace View Toggle */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleInstallPwa}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#e8c96a] transition-all cursor-pointer"
                title="Install workspace as an independent offline PWA"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#C9A84C]" />
                <span>{isPwaInstalled ? 'PWA Ready' : 'Install PWA'}</span>
              </button>

              <button
                onClick={() => {
                  StudioAudio.playClick();
                  setZenMode(!zenMode);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[rgba(201,168,76,0.15)] hover:bg-[rgba(201,168,76,0.25)] border border-[rgba(201,168,76,0.35)] text-xs font-mono text-[#f5f3f0] transition-all cursor-pointer"
                title="Toggle Full Focus Zen Mode"
              >
                <Maximize2 className="w-3.5 h-3.5 text-[#C9A84C]" />
                <span>Focus Zen Mode</span>
              </button>

              {/* Seamless Studio / Codex Switcher */}
              <div className="p-1 rounded-2xl bg-black/80 border border-[rgba(201,168,76,0.35)] flex items-center gap-1 shadow-inner backdrop-blur-md">
                <button
                  onClick={() => {
                    StudioAudio.playClick();
                    setWorkspaceMode('flow');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 select-none ${
                    workspaceMode === 'flow'
                      ? 'bg-[#C9A84C] text-[#050404] shadow-md'
                      : 'text-[#8a6e2a] hover:text-[#e8c96a]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Story Flow</span>
                </button>
                <button
                  onClick={() => {
                    StudioAudio.playClick();
                    setWorkspaceMode('codex');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 select-none ${
                    workspaceMode === 'codex'
                      ? 'bg-[#C9A84C] text-[#050404] shadow-md'
                      : 'text-[#8a6e2a] hover:text-[#e8c96a]'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Chapter Codex</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Exit Button in Zen Mode */}
        {zenMode && (
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(201,168,76,0.2)] mb-4">
            <div className="flex items-center gap-2 text-xs font-mono text-[#C9A84C]">
              <Feather className="w-3.5 h-3.5" />
              <span>ZEN WRITING SANCTUARY • FULL SCREEN</span>
            </div>
            <button
              onClick={() => {
                StudioAudio.playClick();
                setZenMode(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-white flex items-center gap-1.5 cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5 text-[#C9A84C]" />
              <span>Exit Zen Mode</span>
            </button>
          </div>
        )}

        {/* Ownership & Trust Guarantee Ribbon */}
        {!zenMode && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/20 via-zinc-950 to-black border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2.5 text-zinc-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong className="text-white">Author Invariant:</strong> Real-time on-device encryption. Auto-saved locally every 5 seconds. Zero vendor lock-in.
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[#8a6e2a] shrink-0">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>IndexedDB Storage</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant Markdown / Word Export</span>
              </span>
            </div>
          </div>
        )}

        {/* Main Unified Writing Room */}
        <div className="w-full">
          {workspaceMode === 'flow' ? (
            <WritingStudio />
          ) : (
            <GhostwritingWorkspace />
          )}
        </div>
      </div>
    </div>
  );
}
