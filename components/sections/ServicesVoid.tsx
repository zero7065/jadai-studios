'use client';

import React, { useState, useEffect, useRef } from 'react';
import GlassCard from '../ui/GlassCard';
import EdgeGlow from '../ui/EdgeGlow';
import { StudioAudio } from '../../lib/watermark';
import { getCustomization } from '../../lib/data/customization';
import {
  Layers,
  Cpu,
  Globe,
  ArrowRight,
  Compass,
  Building,
  Sparkles,
  Users,
} from 'lucide-react';

type AudienceTab = 'Founders' | 'Businesses' | 'Creators' | 'Builders';

interface PillarData {
  id: 'build' | 'voice' | 'frame';
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  deliverables: string[];
  cta: string;
  zDepth: number; // -100px / 0 / +100px
}

const PILLARS: PillarData[] = [
  {
    id: 'build',
    title: 'BUILD',
    subtitle: 'Full-Stack Architecture',
    tagline: 'Multi-Tenant Relational Data & Edge Resilience',
    description:
      'We architect production data layers designed to endure heavy traffic without degradation. Robust relational databases, leak-proof access control, and high-throughput server-side pipelines.',
    deliverables: [
      'Comprehensive 20+ table relational PostgreSQL schema',
      'Row-Level Security (RLS) with zero data leaks',
      'High-throughput connection pooling & edge caching',
      'Instant deployment & local backups',
    ],
    cta: 'Commission Build Protocol',
    zDepth: -100,
  },
  {
    id: 'voice',
    title: 'VOICE',
    subtitle: 'Adaptive Intelligence',
    tagline: 'PRIME Cognitive Engine & Living Intelligence',
    description:
      'We engineer intelligent systems with real failover redundancy (Groq primary, Gemini fallback). User memory persistence, adaptive interaction modes, and custom brand narratives.',
    deliverables: [
      'Multi-tier AI failover pipeline with zero downtime',
      'Persistent memory architecture across sessions',
      'Custom tone adaptation based on user growth',
      'Structured document & diagnostic analysis',
    ],
    cta: 'Activate Voice Protocol',
    zDepth: 100,
  },
  {
    id: 'frame',
    title: 'FRAME',
    subtitle: 'Resilient Systems & PWA',
    tagline: 'Offline-First Applications for Fluctuating Networks',
    description:
      'Built for environments where power and networks are unpredictable. Offline-first progressive web apps with instant local storage, fast touch responses, and zero blank screens.',
    deliverables: [
      'PWA manifest & service worker with explicit cache invalidation',
      'Local-first data mutations with background sync queues',
      'Instant sub-second load times with zero blank screens',
      'Dual-currency Paystack checkout integrations',
    ],
    cta: 'Construct Frame Protocol',
    zDepth: 0,
  },
];

const AUDIENCE_TABS: { id: AudienceTab; label: string; icon: React.ElementType; focus: 'build' | 'voice' | 'frame' }[] = [
  { id: 'Founders', label: 'Founders', icon: Compass, focus: 'voice' },
  { id: 'Businesses', label: 'Businesses', icon: Building, focus: 'build' },
  { id: 'Creators', label: 'Creators', icon: Sparkles, focus: 'frame' },
  { id: 'Builders', label: 'Builders', icon: Users, focus: 'build' },
];

export const ServicesVoid: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AudienceTab>('Founders');
  const [activePillar, setActivePillar] = useState<'build' | 'voice' | 'frame'>('voice');
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const customization = getCustomization();

  // Cursor Parallax: panels shift 8px per 100px of cursor movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) / 100;
      const deltaY = (e.clientY - centerY) / 100;
      setMouseOffset({ x: deltaX * 8, y: deltaY * 8 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleTabChange = (tabId: AudienceTab, focus: 'build' | 'voice' | 'frame') => {
    setActiveTab(tabId);
    setActivePillar(focus);
    StudioAudio.playClick();
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#050404] text-[#f5f3f0] px-4 sm:px-8 py-10 select-none"
      style={{ perspective: '1200px' }}
    >
      {/* 4K Atmospheric Background Image with Slow Breathing Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-12 filter brightness-65 contrast-125 animate-atmosphere"
          style={{ backgroundImage: `url(${customization.servicesBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050404] via-[#050404]/85 to-[#050404]" />
      </div>

      {/* 12 Gold Particles Drifting Slowly (capped for scroll performance) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-40" style={{ contain: 'layout style paint' }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#C9A84C]"
            style={{
              width: `${(i % 3) + 1}px`,
              height: `${(i % 3) + 1}px`,
              left: `${(i * 13.7) % 100}%`,
              top: `${(i * 19.3) % 100}%`,
              opacity: (i % 7 + 3) / 10,
              boxShadow: '0 0 8px rgba(201,168,76,0.6)',
              animation: `particleFloat ${6 + (i % 8)}s ease-in-out infinite alternate`,
              animationDelay: `${(i % 10) * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Central Metatron ring — CSS-only, opacity-only decoration */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 flex items-center justify-center opacity-20"
        style={{ contain: 'layout style paint' }}
      >
        <div
          className="rounded-full border border-dashed border-[rgba(201,168,76,0.4)]"
          style={{
            width: 560,
            height: 560,
            animation: 'metatronSpin 90s linear infinite',
          }}
        />
        <div
          className="absolute rounded-full border border-[rgba(201,168,76,0.25)]"
          style={{
            width: 380,
            height: 380,
            animation: 'metatronSpin 90s linear infinite reverse',
          }}
        />
      </div>

      {/* Vertical Rotated Text on LEFT Edge: "BUILD" */}
      <div className="hidden lg:flex fixed left-6 top-1/2 -translate-y-1/2 z-20 flex-col items-center gap-6 pointer-events-none">
        <div className="p-2.5 rounded-full bg-[#0a0908]/90 border border-[rgba(201,168,76,0.3)] shadow-2xl backdrop-blur-md">
          <Layers className="w-4 h-4 text-[#C9A84C]" />
        </div>
        <span
          className="font-display font-bold text-2xl tracking-[0.5em] text-[#C9A84C]/60"
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
          }}
        >
          BUILD
        </span>
      </div>

      {/* Vertical Rotated Text on RIGHT Edge: "DIFFERENT" */}
      <div className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-20 flex-col items-center gap-6 pointer-events-none">
        <div className="p-2.5 rounded-full bg-[#0a0908]/90 border border-[rgba(201,168,76,0.3)] shadow-2xl backdrop-blur-md">
          <Cpu className="w-4 h-4 text-[#e8c96a]" />
        </div>
        <span
          className="font-display font-bold text-2xl tracking-[0.5em] text-[#C9A84C]/60"
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
          }}
        >
          DIFFERENT
        </span>
      </div>

      {/* Top Header Tagline */}
      <div className="relative z-20 max-w-7xl mx-auto w-full flex flex-col items-center text-center space-y-2 pt-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-[#C9A84C]">
          Engineering Void
        </span>
        <h2 className="text-3xl sm:text-5xl font-display font-bold tracking-[0.08em] text-[#f5f3f0] uppercase">
          Technology Foundations For What Lasts
        </h2>
        <p className="text-xs font-mono text-[#8a6e2a] max-w-md">
          Three interconnected pillars engineered with real failovers, local storage, and zero fluff.
        </p>
      </div>

      {/* Central 3D Floating Glass Panels at Z depths -100px / 0 / +100px */}
      <div className="relative z-20 max-w-6xl mx-auto w-full my-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {PILLARS.map((pillar) => {
            const isFocused = activePillar === pillar.id;

            return (
              <div
                key={pillar.id}
                onClick={() => {
                  setActivePillar(pillar.id);
                  StudioAudio.playClick();
                }}
                className="relative group cursor-pointer"
                style={{
                  transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, ${pillar.zDepth}px)`,
                  transition: 'transform 0.15s ease-out',
                }}
              >
                {/* Radial Gold Glow Behind Each Panel */}
                <div
                  className={`absolute -inset-4 rounded-3xl pointer-events-none blur-2xl transition-opacity duration-500 ${
                    isFocused ? 'opacity-80' : 'opacity-25 group-hover:opacity-50'
                  }`}
                  style={{
                    background:
                      'radial-gradient(circle at center, rgba(201,168,76,0.3) 0%, rgba(192,57,43,0.1) 50%, transparent 80%)',
                  }}
                />

                <EdgeGlow
                  intensity={isFocused ? 'intense' : 'subtle'}
                  color="gold"
                  borderRadius={20}
                  className="w-full h-full block"
                >
                  <div
                    className={`relative rounded-[20px] p-6 sm:p-7 border backdrop-blur-xl transition-all duration-300 flex flex-col justify-between min-h-[460px] shadow-[0_20px_60px_rgba(0,0,0,0.9)] w-full ${
                      isFocused
                        ? 'bg-[#0a0908] border-[#C9A84C]'
                        : 'bg-[#050404]/85 border-[rgba(201,168,76,0.25)] hover:border-[rgba(201,168,76,0.5)]'
                    }`}
                  >
                    {/* Header */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9A84C]">
                          Pillar 0{pillar.id === 'build' ? '1' : pillar.id === 'voice' ? '2' : '3'}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${
                            isFocused
                              ? 'bg-[rgba(201,168,76,0.2)] border-[#C9A84C] text-[#e8c96a]'
                              : 'border-[rgba(201,168,76,0.2)] text-[#8a6e2a]'
                          }`}
                        >
                          Z: {pillar.zDepth > 0 ? `+${pillar.zDepth}px` : `${pillar.zDepth}px`}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-2xl font-display font-bold text-[#f5f3f0] tracking-wide">
                          {pillar.title}
                        </h3>
                        <p className="text-xs font-mono text-[#8a6e2a] mt-0.5">
                          {pillar.subtitle}
                        </p>
                      </div>

                      <p className="text-xs font-serif text-[#c4c0bb] leading-relaxed pt-1">
                        {pillar.description}
                      </p>
                    </div>

                    {/* Deliverables Checklist */}
                    <div className="py-4 space-y-2 border-t border-b border-[rgba(201,168,76,0.15)] my-4">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a] block">
                        Core Foundation
                      </span>
                      <ul className="space-y-1.5">
                        {pillar.deliverables.map((item, i) => (
                          <li key={i} className="text-[11px] font-mono text-[#c4c0bb] flex items-start gap-2">
                            <span className="text-[#C9A84C] shrink-0 mt-0.5">✦</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/contact?pillar=${pillar.id}`;
                        }}
                        className="w-full py-2.5 px-4 rounded-lg bg-[#0a0908] hover:bg-[#C9A84C] text-[#f5f3f0] hover:text-[#050404] font-mono text-xs font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border border-[rgba(201,168,76,0.3)] shadow-md"
                      >
                        <span>{pillar.cta}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </EdgeGlow>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Audience Tab Row: Founders · Businesses · Creators · Builders */}
      <div className="relative z-20 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[rgba(201,168,76,0.15)]">
        <div className="flex items-center gap-2 bg-[#0a0908]/90 border border-[rgba(201,168,76,0.3)] p-1 rounded-full shadow-lg backdrop-blur-md">
          {AUDIENCE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id, tab.focus)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#C9A84C] text-[#050404] font-bold shadow-[0_0_12px_rgba(201,168,76,0.4)]'
                    : 'text-[#c4c0bb] hover:text-[#f5f3f0] hover:bg-[rgba(201,168,76,0.08)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-xs font-mono text-[#8a6e2a]">
          <span>Perspective: 1200px · Z-Shift: 8px/100px</span>
        </div>
      </div>

      <style>{`
        @keyframes metatronSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ServicesVoid;
