'use client';

import React, { useState, useEffect, useRef } from 'react';
import SacredGeometry from '@/components/ui/SacredGeometry';
import EdgeGlow from '@/components/ui/EdgeGlow';
import { StudioAudio } from '@/lib/watermark';
import { useCurrency } from '@/components/providers/CurrencyProvider';
import {
  Layers,
  Cpu,
  Globe,
  ArrowRight,
  Shield,
  Zap,
  Users,
  Building,
  Sparkles,
  Compass,
  PenTool,
  CreditCard,
  CheckCircle,
} from 'lucide-react';

interface PillarData {
  id: 'build' | 'voice' | 'write' | 'frame';
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  deliverables: string[];
  cta: string;
  linkUrl: string;
  priceUsd: number;
  priceNgn: number;
  zDepth: number;
}

const PILLARS: PillarData[] = [
  {
    id: 'write',
    title: 'WRITE',
    subtitle: 'Ghostwriting & Literary Codex',
    tagline: 'Novels, Memoirs, Theatrical Soliloquies & Manifestos',
    description: 'We architect full books and serialized fiction. Novel-style pacing starting mid-fall, Shakespearean dramatic depth, and socratic truth. We provide the structural floor so your voice commands the room.',
    deliverables: [
      'Full manuscript development (25k–80k words) & chapter pacing',
      'Non-linear mosaic narratives starting mid-journey with sharp dialogue',
      'Shakespearean dramatic irony & high-altitude intellectual wit',
      'Direct handoff to interactive studio & PDF/Markdown export',
    ],
    cta: 'Open Ghostwriting Studio',
    linkUrl: '/playground/dream-forge',
    priceUsd: 1400,
    priceNgn: 2100000,
    zDepth: 50,
  },
  {
    id: 'build',
    title: 'BUILD',
    subtitle: 'Full-Stack Architecture',
    tagline: 'Multi-Tenant Relational Data & Edge Resilience',
    description: 'We architect production data layers designed to endure heavy usage without degradation. Resilient relational databases, leak-proof access control, and robust server-side pipelines.',
    deliverables: [
      'Comprehensive 20+ table relational PostgreSQL schema',
      'Row-Level Security (RLS) with zero data leaks',
      'High-throughput connection pooling & edge caching',
      'Instant deployment & sovereign backups',
    ],
    cta: 'Commission Architecture',
    linkUrl: '/contact?pillar=build',
    priceUsd: 1250,
    priceNgn: 1875000,
    zDepth: 20,
  },
  {
    id: 'voice',
    title: 'VOICE',
    subtitle: 'Adaptive Intelligence',
    tagline: 'PRIME Cognitive Engine & Living Intelligence',
    description: 'We engineer sovereign intelligence systems with real failover redundancy (Groq primary, Gemini fallback). User memory persistence, adaptive interaction modes, and custom brand narratives.',
    deliverables: [
      'Multi-tier AI failover pipeline with zero downtime',
      'Persistent memory architecture across sessions',
      'Custom tone adaptation based on user growth',
      'Structured document & diagnostic analysis',
    ],
    cta: 'Commission Intelligence',
    linkUrl: '/contact?pillar=voice',
    priceUsd: 950,
    priceNgn: 1425000,
    zDepth: 80,
  },
  {
    id: 'frame',
    title: 'FRAME',
    subtitle: 'Core Systems & PWA',
    tagline: 'Offline-First Applications for Fluctuating Networks',
    description: 'Built for environments where power and networks are unpredictable. Offline-first progressive web apps with instant local storage, fast touch responses, and zero blank screens.',
    deliverables: [
      'PWA manifest & service worker with explicit cache invalidation',
      'Local-first data mutations with background sync queues',
      'Instant sub-second load times with zero blank screens',
      'Dual-currency Paystack checkout integrations',
    ],
    cta: 'Construct PWA Frame',
    linkUrl: '/contact?pillar=frame',
    priceUsd: 750,
    priceNgn: 1125000,
    zDepth: 40,
  },
];

const AUDIENCE_TABS: {
  id: 'founders' | 'businesses' | 'creators' | 'builders';
  label: string;
  icon: React.ElementType;
  focus: 'build' | 'voice' | 'write' | 'frame';
}[] = [
  { id: 'creators', label: 'Authors & Creators', icon: PenTool, focus: 'write' },
  { id: 'founders', label: 'Founders', icon: Compass, focus: 'voice' },
  { id: 'businesses', label: 'Enterprises', icon: Building, focus: 'build' },
  { id: 'builders', label: 'Engineers', icon: Users, focus: 'frame' },
];

import DefensiveFallback from '@/components/ui/DefensiveFallback';
import FAQSection from '@/components/ui/FAQSection';
import { SERVICES_FAQ } from '@/lib/data/faqs';

export default function ServicesPage() {
  const [hasError, setHasError] = useState(false);
  const [activeTab, setActiveTab] = useState<'founders' | 'businesses' | 'creators' | 'builders'>('creators');
  const [activePillar, setActivePillar] = useState<'build' | 'voice' | 'write' | 'frame'>('write');
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [currentTime, setCurrentTime] = useState('6:41 PM');
  const containerRef = useRef<HTMLDivElement>(null);
  const { formatDual, currency } = useCurrency();

  // Time ticker
  useEffect(() => {
    try {
      const updateTime = () => {
        const now = new Date();
        setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }));
      };
      updateTime();
      const interval = setInterval(updateTime, 30000);
      return () => clearInterval(interval);
    } catch {
      setHasError(true);
    }
  }, []);

  if (hasError) return <DefensiveFallback />;

  // Cursor Parallax: 8px per 100px mouse movement
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

  const handleTabChange = (tabId: typeof activeTab, focus: typeof activePillar) => {
    setActiveTab(tabId);
    setActivePillar(focus);
    StudioAudio.playClick();
  };

  return (
    <>
    <div
      ref={containerRef}
      className="relative min-h-[92vh] w-full flex flex-col justify-between overflow-hidden bg-services-atmos text-[#f5f3f0] px-4 sm:px-8 py-8 select-none"
      style={{ perspective: '1200px' }}
    >
      {/* 200 Gold Particles Slow Drift Field (CSS Canvas) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-40">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#C9A84C] animate-pulse"
            style={{
              width: `${(i % 3) + 1.5}px`,
              height: `${(i % 3) + 1.5}px`,
              left: `${(i * 19) % 100}%`,
              top: `${(i * 29) % 100}%`,
              opacity: (i % 5 + 3) / 10,
              boxShadow: '0 0 6px rgba(201,168,76,0.6)',
              animationDuration: `${3 + (i % 5)}s`,
            }}
          />
        ))}
      </div>

      {/* Central Light Beam & 90s Rotating Metatron's Cube reacting to cursor */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 flex flex-col items-center justify-center opacity-30"
        style={{
          transform: `translate(-50%, -50%) translate(${mouseOffset.x * 0.4}px, ${mouseOffset.y * 0.4}px)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        {/* Vertical Beam */}
        <div className="w-1.5 h-[800px] bg-gradient-to-b from-transparent via-[rgba(201,168,76,0.45)] to-transparent blur-[1px]" />
        <div className="absolute">
          <SacredGeometry size={650} opacity={0.35} interactive={true} />
        </div>
      </div>

      {/* Top Header Tagline */}
      <div className="relative z-20 max-w-7xl mx-auto w-full flex flex-col items-center text-center space-y-2 pt-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-[#8a6e2a]">
          Architecture & Literary Precision
        </span>
        <h1 className="text-2xl sm:text-4xl font-display font-bold tracking-[0.1em] text-[#f5f3f0] uppercase">
          Technology & Writing Solutions
        </h1>
        <p className="text-xs sm:text-sm font-mono text-[#c4c0bb] max-w-2xl">
          Complete production systems, adaptive intelligence, and high-signal books without placeholders.
        </p>
      </div>

      {/* Central 3D Floating Glass Panels (WRITE · BUILD · VOICE · FRAME) */}
      <div className="relative z-20 max-w-7xl mx-auto w-full my-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {PILLARS.map((pillar, idx) => {
            const isFocused = activePillar === pillar.id;
            const dual = formatDual(pillar.priceUsd, pillar.priceNgn);

            return (
              <div
                key={pillar.id}
                onClick={() => {
                  setActivePillar(pillar.id);
                  StudioAudio.playClick();
                }}
                className={`relative rounded-2xl p-5 sm:p-6 border backdrop-blur-xl transition-all duration-500 cursor-pointer flex flex-col justify-between shadow-[0_20px_60px_rgba(0,0,0,0.9)] ${
                  isFocused
                    ? 'bg-[#0a0908]/95 border-[#C9A84C] scale-102 z-30 shadow-[0_0_35px_rgba(201,168,76,0.25)]'
                    : 'bg-[#050404]/75 border-[rgba(201,168,76,0.2)] hover:border-[rgba(201,168,76,0.45)] hover:scale-101 z-10 opacity-90 hover:opacity-100'
                }`}
                style={{
                  transform: `translate3d(${mouseOffset.x * (pillar.zDepth / 50)}px, ${
                    mouseOffset.y * (pillar.zDepth / 50)
                  }px, ${pillar.zDepth}px)`,
                  transition: 'transform 0.15s ease-out, border-color 0.3s ease, box-shadow 0.3s ease',
                }}
              >
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9A84C]">
                      Pillar 0{idx + 1}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${
                      isFocused ? 'bg-[rgba(201,168,76,0.2)] border-[#C9A84C] text-[#e8c96a]' : 'border-[rgba(201,168,76,0.2)] text-[#8a6e2a]'
                    }`}>
                      {pillar.id}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-display font-bold text-[#f5f3f0] tracking-wide">
                      {pillar.title}
                    </h2>
                    <p className="text-xs font-mono text-[#8a6e2a] mt-0.5">
                      {pillar.subtitle}
                    </p>
                  </div>

                  {/* Dual Currency Price Tag */}
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-amber-500/25">
                    <div className="text-sm font-bold font-mono text-amber-300">
                      {dual.main}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500">
                      ≈ {dual.alt}
                    </div>
                  </div>

                  <p className="text-xs font-serif text-[#c4c0bb] leading-relaxed pt-1">
                    {pillar.description}
                  </p>
                </div>

                {/* Deliverables Checklist */}
                <div className="py-3 space-y-2 border-t border-b border-[rgba(201,168,76,0.15)] my-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a] block">
                    Core Specifications
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

                {/* CTA with EdgeGlow */}
                <div className="pt-2">
                  <EdgeGlow
                    intensity={isFocused ? 'intense' : 'subtle'}
                    color="gold"
                    borderRadius="8px"
                    className="w-full"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = pillar.linkUrl;
                      }}
                      className="w-full py-2.5 px-3 rounded-lg bg-[#050404] hover:bg-[#C9A84C] text-[#f5f3f0] hover:text-[#050404] font-mono text-xs font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer border border-[rgba(201,168,76,0.3)]"
                    >
                      <span>{pillar.cta}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </EdgeGlow>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global International Payments Banner */}
        <div className="mt-8 p-4 rounded-2xl bg-zinc-950/70 border border-amber-500/20 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold font-mono text-zinc-200">
                International & Multi-Currency Settlement Rails
              </div>
              <div className="text-[11px] text-zinc-400">
                Supports USD ($) and NGN (₦) via Stripe, Visa, MasterCard, Apple Pay, Verve & direct wires worldwide.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 shrink-0">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Instant Client Handoff</span>
          </div>
        </div>
      </div>

      {/* Bottom Audience Tabs: Founders · Businesses · Creators · Builders */}
      <div className="relative z-20 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[rgba(201,168,76,0.15)]">
        {/* Audience Pill Row */}
        <div className="flex items-center gap-2 bg-[#0a0908]/90 border border-[rgba(201,168,76,0.25)] p-1 rounded-full shadow-lg backdrop-blur-md">
          {AUDIENCE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id, tab.focus)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#C9A84C] text-[#050404] font-bold shadow-[0_0_12px_rgba(201,168,76,0.35)]'
                    : 'text-[#c4c0bb] hover:text-[#f5f3f0] hover:bg-[rgba(201,168,76,0.08)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Real-time Status Telemetry HUD (Bottom-right like IT Empire image) */}
        <div className="flex items-center gap-4 text-xs font-mono text-[#8a6e2a]">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#4a4744] uppercase">Time</span>
            <span className="text-[#f5f3f0]">{currentTime}</span>
          </div>
          <span className="text-[#4a4744]">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#4a4744] uppercase">Temp</span>
            <span className="text-[#f5f3f0]">22°C</span>
          </div>
          <span className="text-[#4a4744]">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#4a4744] uppercase">Status</span>
            <span className="text-[#C9A84C] font-semibold">Operational 100%</span>
          </div>
        </div>
      </div>
    </div>

    {/* How an engagement works — the strategic process, plain and explicit */}
    <section className="relative z-20 max-w-5xl mx-auto w-full px-4 sm:px-8 py-14 space-y-6">
      <div className="border-b border-[rgba(201,168,76,0.2)] pb-4">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A84C]">
          From First Message to Shipped System
        </span>
        <h2 className="text-xl sm:text-2xl font-display font-bold text-[#f5f3f0] mt-1">
          How Engagement Works
        </h2>
        <p className="text-xs font-mono text-[#8a857e] mt-2 max-w-2xl leading-relaxed">
          No discovery-call theater. Four steps, fixed milestones, and you own everything produced.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            step: '01',
            title: 'Transmission',
            body: 'Send the problem — not a brief template. Through /contact or /services you describe what is broken, missing, or imagined. We reply within 24 hours with a scoped, honest read of it.',
          },
          {
            step: '02',
            title: 'Blueprint',
            body: 'You receive a fixed-price proposal: deliverables, milestone schedule, timeline, currency, and an explicit out-of-scope list — so nothing balloons later.',
          },
          {
            step: '03',
            title: 'Architecture',
            body: 'Work happens in visible milestones. Each one ends with a running artifact you can click, read, or deploy — never a status slide.',
          },
          {
            step: '04',
            title: 'Handover',
            body: 'Repos, documentation, schema, and credentials transfer to you. Copyright on creative work signs over at final payment. Support window included.',
          },
        ].map((s) => (
          <div
            key={s.step}
            className="rounded-2xl bg-[#050404]/80 border border-[rgba(201,168,76,0.2)] p-5 space-y-2 hover:border-[rgba(201,168,76,0.5)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(201,168,76,0.1)]"
          >
            <span className="text-[10px] font-mono tracking-[0.3em] text-[#C9A84C]">
              STEP {s.step}
            </span>
            <h3 className="text-sm font-display font-bold text-[#f5f3f0]">{s.title}</h3>
            <p className="text-[11px] text-[#8a857e] leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>

      <FAQSection
        items={SERVICES_FAQ}
        title="Working With Us"
        intro="Timelines, ownership, refunds, and why direct-with-the-architect beats the agency model."
      />
    </section>
    </>
  );
}
