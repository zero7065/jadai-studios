'use client';

import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import SacredGeometry from '@/components/ui/SacredGeometry';
import EdgeGlow from '@/components/ui/EdgeGlow';
import DefensiveFallback from '@/components/ui/DefensiveFallback';
import { Compass, CheckCircle, Sparkles, Layers, Cpu, ShieldCheck, ExternalLink, ArrowRight } from 'lucide-react';
import { getCustomization } from '@/lib/data/customization';

const PRINCIPLES = [
  {
    num: '01',
    title: 'No Chunk Code',
    desc: 'Every file produced is complete, runnable, and uncompromising. We reject lazy placeholders, truncated implementations, and half-baked scaffolding. If an architecture requires 400 lines, all 400 lines are built.',
  },
  {
    num: '02',
    title: 'Fallback Everywhere',
    desc: 'Every external dependency has an explicit fallback path. If Groq stumbles, Gemini takes the load. If Gemini is unreachable, deterministic caching triggers. Never a white screen. Never a frozen spinner.',
  },
  {
    num: '03',
    title: 'Build the Floor',
    desc: 'You cannot build high without a floor that never cracks. We obsess over the unglamorous foundations: database schemas, row-level security, offline service workers, and error recovery terminals.',
  },
  {
    num: '04',
    title: 'Offline Durability',
    desc: 'Forged in the Jos highlands where infrastructure fluctuates, our software is engineered for local-first resilience. If connectivity cuts out, client caches maintain state without data loss.',
  },
  {
    num: '05',
    title: 'Depth Over Speed',
    desc: 'Speed without architectural rigor is just technical debt with good marketing. We build software meant to deserve existence in ten years.',
  },
  {
    num: '06',
    title: 'Truth in Systems',
    desc: 'Systems do not lie; people lie about systems. We design software that clarifies reality rather than masking dysfunction with comforting dashboards.',
  },
];

const PROCESS_STEPS = [
  {
    num: '01',
    name: 'First-Principles Audit',
    desc: 'Strip assumptions to raw physical and cryptographic truths. Define structural invariants.',
    icon: Compass,
  },
  {
    num: '02',
    name: 'Bedrock Architecture',
    desc: 'Build the schema, offline caching, and failover pathways before touching user interface.',
    icon: Layers,
  },
  {
    num: '03',
    name: 'High-Dimension Synthesis',
    desc: 'Infuse edge intelligence, luxury visual physics, and sub-50ms deterministic rendering.',
    icon: Cpu,
  },
  {
    num: '04',
    name: 'Resilient Deployment',
    desc: 'Deploy resilient edge containers with automated failover and cryptographic verification.',
    icon: ShieldCheck,
  },
];

const TOOLS_MATRIX = [
  { name: 'TypeScript', category: 'Language' },
  { name: 'React 19 / Vite', category: 'Platform' },
  { name: 'Tailwind CSS', category: 'Styling' },
  { name: 'Motion Physics', category: 'Motion' },
  { name: 'Gemini 3.5 & Flash', category: 'Intelligence' },
  { name: 'Groq LPUs', category: 'Inference' },
  { name: 'Supabase / Cloud SQL', category: 'Bedrock' },
  { name: 'Paystack Dual-Currency', category: 'Commerce' },
];

const PRINCIPLE_LOOP = [
  'Build Different.',
  'Think First.',
  'Ship Real.',
];

export default function AboutPage() {
  const [hasError, setHasError] = useState(false);
  const [customization, setCustomization] = useState(() => {
    try {
      return getCustomization();
    } catch {
      return { founderName: 'Jehu Nanpan' } as any;
    }
  });

  const [activePrincipleIndex, setActivePrincipleIndex] = useState(0);

  useEffect(() => {
    try {
      const handleUpdate = () => setCustomization(getCustomization());
      window.addEventListener('jadai_customization_changed', handleUpdate);

      const loopTimer = setInterval(() => {
        setActivePrincipleIndex((prev) => (prev + 1) % PRINCIPLE_LOOP.length);
      }, 2500);

      return () => {
        window.removeEventListener('jadai_customization_changed', handleUpdate);
        clearInterval(loopTimer);
      };
    } catch (err) {
      console.warn('AboutPage initialization error:', err);
      setHasError(true);
    }
  }, []);

  if (hasError) {
    return <DefensiveFallback />;
  }

  return (
    <div id="origins-section" className="relative min-h-screen w-full flex flex-col space-y-20 text-[#c4c0bb] px-4 sm:px-6 py-12 select-none overflow-hidden max-w-[1100px] mx-auto">
      {/* -------------------------------------------------------------------------
          SECTION 1: ORIGINS & STUDIO DOCTRINE
         ------------------------------------------------------------------------- */}
      <section className="relative z-10 flex flex-col items-center text-center w-full pt-4 space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[rgba(15,14,12,0.8)] border border-[rgba(201,168,76,0.3)] shadow-sm backdrop-blur-md">
          <Compass className="w-3.5 h-3.5 text-[#C9A84C]" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#e8c96a]">
            Origins & Studio Doctrine
          </span>
        </div>

        <div className="space-y-2 max-w-2xl">
          <h1
            className="font-display text-3xl sm:text-4xl text-[#f5f3f0] tracking-tight uppercase"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            Imagining Beyond Reality
          </h1>
          <p
            className="font-body italic text-base text-[#8a6e2a]"
            style={{ fontFamily: 'Crimson Pro, serif' }}
          >
            "Code. Story. Frame. — all in the same week."
          </p>
        </div>

        {/* ---------------------------------------------------------------------
            "WHO BUILT THIS" SECTION (Strictly Text-Only, Zero Photos)
           --------------------------------------------------------------------- */}
        <div className="w-full max-w-2xl mt-4 p-6 sm:p-8 rounded-2xl bg-[rgba(15,14,12,0.7)] border border-[rgba(201,168,76,0.25)] backdrop-blur-xl text-left space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-[rgba(201,168,76,0.2)] pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9A84C] block">
                Who Built This
              </span>
              <h2
                className="font-display text-xl sm:text-2xl font-bold text-[#f5f3f0] mt-0.5"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                Jehu Nanpan
              </h2>
              <p
                className="text-xs font-mono text-[#8a857e]"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                Principal Systems Architect · Jos, Plateau State, Nigeria
              </p>
            </div>

            {/* Principle Cycle Badge */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#8a6e2a]">
                Core Creed
              </span>
              <span
                key={activePrincipleIndex}
                className="text-xs font-mono font-bold text-[#e8c96a] transition-all duration-500 animate-pulse"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                {PRINCIPLE_LOOP[activePrincipleIndex]}
              </span>
            </div>
          </div>

          {/* 3-Sentence Philosophy */}
          <div className="space-y-3 text-sm leading-relaxed text-[#c4c0bb] font-sans">
            <p>
              First-principles software architecture demands complete, runnable, and uncompromising specifications; half-baked scaffolding is technical debt in disguise.
            </p>
            <p>
              Forged in the Jos highlands where infrastructure fluctuates, our platforms are engineered for local-first durability, cryptographic integrity, and extreme network resilience.
            </p>
            <p>
              We do not construct comforting illusions or disposable apps; we engineer tools that clarify reality, preserve craft, and elevate human builders.
            </p>
          </div>

          {/* Animated Text Loop on Mobile */}
          <div className="sm:hidden pt-2 border-t border-[rgba(201,168,76,0.15)] flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#8a6e2a] uppercase">Studio Pulse:</span>
            <span className="text-xs font-mono font-bold text-[#e8c96a]">
              {PRINCIPLE_LOOP[activePrincipleIndex]}
            </span>
          </div>

          {/* Authoritative Direct Coordinates / Links */}
          <div className="pt-4 border-t border-[rgba(201,168,76,0.2)] flex flex-wrap items-center gap-4 text-xs font-mono">
            <a
              href="https://twitter.com/hudsonstylez"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#C9A84C] hover:text-[#e8c96a] transition-colors"
            >
              <span>Twitter // @hudsonstylez</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href="https://jadai.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#C9A84C] hover:text-[#e8c96a] transition-colors"
            >
              <span>jadai.dev</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------
          SECTION 2: PROCESS FLOW
         ------------------------------------------------------------------------- */}
      <section className="relative z-10 w-full space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9A84C]">
            ENGINEERING TIMELINE
          </span>
          <h2
            className="text-xl sm:text-2xl font-display font-bold text-[#f5f3f0]"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            From First Principles To Creation
          </h2>
          <p className="text-xs font-mono text-[#8a857e] max-w-lg mx-auto">
            Disciplined execution modeled after celestial mechanics and software durability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROCESS_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-4 rounded-xl bg-[rgba(15,14,12,0.65)] border border-[rgba(201,168,76,0.2)] hover:border-[#C9A84C] backdrop-blur-xl space-y-2.5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.3)] flex items-center justify-center text-[#e8c96a]">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#C9A84C]">{step.num}</span>
                </div>
                <h3
                  className="font-display font-bold text-sm text-[#f5f3f0]"
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  {step.name}
                </h3>
                <p className="text-xs text-[#c4c0bb] leading-relaxed font-sans">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* -------------------------------------------------------------------------
          SECTION 3: TOOLS MATRIX
         ------------------------------------------------------------------------- */}
      <section className="relative z-10 w-full space-y-5 text-center">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9A84C]">
            TECHNOLOGICAL STACK
          </span>
          <h2
            className="text-lg sm:text-xl font-display font-bold text-[#f5f3f0]"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            Crafted With Deterministic Bedrocks
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
          {TOOLS_MATRIX.map((tool) => (
            <div
              key={tool.name}
              className="px-3 py-1 rounded-full bg-[rgba(15,14,12,0.8)] border border-[rgba(201,168,76,0.25)] text-xs font-mono text-[#c4c0bb] flex items-center gap-2 shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] shadow-[0_0_6px_#C9A84C]" />
              <span className="font-bold text-[#f5f3f0]">{tool.name}</span>
              <span className="text-[10px] text-[#8a857e]">({tool.category})</span>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------------------
          SECTION 4: SIX DOCTRINAL PRINCIPLES
         ------------------------------------------------------------------------- */}
      <section className="relative z-10 w-full space-y-6">
        <div className="border-b border-[rgba(201,168,76,0.2)] pb-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9A84C]">
            THE JADAI CODE
          </span>
          <h2
            className="text-xl sm:text-2xl font-display font-bold text-[#f5f3f0]"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            Six Inviolable Principles
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRINCIPLES.map((p) => (
            <GlassCard key={p.num} className="p-5 space-y-2.5 border-[rgba(201,168,76,0.2)] hover:border-[#C9A84C]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#C9A84C]">{p.num}</span>
                <CheckCircle className="w-4 h-4 text-[#e8c96a]" />
              </div>
              <h3
                className="font-display font-bold text-base text-[#f5f3f0]"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                {p.title}
              </h3>
              <p className="text-xs text-[#c4c0bb] leading-relaxed font-sans">{p.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>
    </div>
  );
}
