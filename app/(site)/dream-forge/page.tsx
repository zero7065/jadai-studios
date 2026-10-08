import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import EdgeGlow from '@/components/ui/EdgeGlow';
import YinYangLoader from '@/components/ui/YinYangLoader';
import { useToast } from '@/components/providers/ToastProvider';
import { StudioAudio } from '@/lib/watermark';
import {
  Flame,
  Layers,
  Shield,
  CreditCard,
  Cpu,
  ArrowRight,
  ArrowLeft,
  Copy,
  CheckCircle,
  Terminal,
  RefreshCw,
  Sparkles,
  Volume2,
} from 'lucide-react';

interface DreamForgeIntake {
  appName: string;
  problemStatement: string;
  targetAudience: string;
  offlineFirst: boolean;
  databasePreference: 'supabase' | 'postgresql' | 'sqlite' | 'firebase';
  aiRequirement: 'core' | 'hybrid' | 'none';
  monetizationModel: 'subscription' | 'pay_per_use' | 'one_time' | 'freemium';
  primaryCurrency: 'NGN' | 'USD';
  complianceNeeds: string;
}

import DefensiveFallback from '@/components/ui/DefensiveFallback';

export default function DreamForgePage() {
  const [hasError, setHasError] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [intake, setIntake] = useState<DreamForgeIntake>({
    appName: '',
    problemStatement: '',
    targetAudience: '',
    offlineFirst: true,
    databasePreference: 'supabase',
    aiRequirement: 'hybrid',
    monetizationModel: 'subscription',
    primaryCurrency: 'NGN',
    complianceNeeds: 'Standard GDPR / NDPR compliant data storage with RLS',
  });

  const [synthesizing, setSynthesizing] = useState(false);
  const [blueprintResult, setBlueprintResult] = useState<string | null>(null);
  const [shatterActive, setShatterActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'architecture' | 'schema' | 'security' | 'milestones'>('architecture');
  const { showToast } = useToast();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mouseParallax, setMouseParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) / 60;
      const y = (e.clientY - window.innerHeight / 2) / 60;
      setMouseParallax({ x, y });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const handleNext = () => {
    if (step === 1 && (!intake.appName.trim() || !intake.problemStatement.trim())) {
      showToast('Please specify the system name and problem statement', 'error');
      return;
    }
    if (soundEnabled) StudioAudio.playClick();
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSynthesize = async () => {
    setSynthesizing(true);
    setStep(4);
    if (soundEnabled) StudioAudio.playChime();

    const prompt = `Synthesize a rigorous production software architecture blueprint for this product vision:
Name: ${intake.appName}
Problem Statement: ${intake.problemStatement}
Target Audience: ${intake.targetAudience}
Offline-First Requirement: ${intake.offlineFirst ? 'Critical (PWA + Service Worker + Local Storage / IndexedDB)' : 'Standard cloud-connected'}
Database Engine: ${intake.databasePreference}
AI Integration: ${intake.aiRequirement}
Monetization & Billing: ${intake.monetizationModel} in ${intake.primaryCurrency} via Paystack
Compliance & Data Governance: ${intake.complianceNeeds}

Follow the Jadai Studios architectural standard: BUILD DIFFERENT. Build the floor.
Format the output with these distinct sections:
### 1. Architectural Floor & Topology
High-level architectural pattern, client-server boundary, state management, caching TTL strategy.

### 2. Relational PostgreSQL / Database Schema
Exact tables, primary keys (UUID), foreign keys, and indexes required for the MVP.

### 3. Row-Level Security (RLS) & Access Rules
Concrete access control rules ensuring zero unauthorized tenant cross-contamination.

### 4. Sprint Zero Execution Floor
The exact 5-milestone checklist required to bring this from abstract dream to live operational code.`;

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemPrompt:
            'You are PRIME, the Chief Architect of Jadai Studios in Jos, Nigeria. You produce uncompromising, complete, battle-tested software blueprints. Write concise, precise technical architecture.',
          moduleSlug: 'dream-forge',
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.text) {
        setBlueprintResult(data.data.text);
        setShatterActive(true);
        setTimeout(() => setShatterActive(false), 2500);
        showToast('System architecture synthesized successfully', 'success', 'Forge Active');
      } else {
        throw new Error(data.error || 'AI generation failed');
      }
    } catch {
      // Deterministic fallback blueprint
      const fallbackBlueprint = `### 1. Architectural Floor & Topology
• **Core Framework:** Next.js 14 App Router + React 19 + TypeScript
• **Client-Server Boundary:** Server Actions for authenticated mutations; Edge API routes for streaming AI
• **Offline Architecture Floor:** Service Worker cache (v1) with IndexedDB store for draft records
• **Billing Integration:** Paystack dual-currency checkout (${intake.primaryCurrency}) with HMAC-SHA512 webhook verification
• **AI Fallback Chain:** Groq (Llama-3.3-70B) -> Gemini (3.8-Flash) -> SHA256 In-Memory Cache -> Graceful Fallback

### 2. Relational PostgreSQL / Database Schema
\`\`\`sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'foundation', 'voice', 'prime')),
  country TEXT DEFAULT 'NG',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.ventures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  spec_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ventures_owner ON public.ventures(owner_id);
\`\`\`

### 3. Row-Level Security (RLS) & Access Rules
\`\`\`sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can access own ventures" ON public.ventures
  FOR ALL USING (auth.uid() = owner_id);
\`\`\`

### 4. Sprint Zero Execution Floor
1. Scaffold Next.js App Router repository with Tailwind void-and-gold design tokens
2. Apply PostgreSQL 20-table schema to Supabase with idempotent SQL migration
3. Wire Paystack ${intake.primaryCurrency} subscription webhook listener
4. Deploy PWA Service Worker manifest with safe CACHE_VERSION invalidation
5. Launch closed alpha to 25 verified early architects`;

      setBlueprintResult(fallbackBlueprint);
      showToast('Architectural blueprint generated.', 'success', 'Floor Established');
    } finally {
      setSynthesizing(false);
    }
  };

  const copyBlueprint = () => {
    if (!blueprintResult) return;
    navigator.clipboard.writeText(blueprintResult);
    showToast('Complete blueprint copied to clipboard.', 'success');
  };

  return (
    <div className="relative min-h-[92vh] py-12 px-4 max-w-5xl mx-auto space-y-10 bg-forge-atmos select-none overflow-hidden">
      {/* Floating Islands & Crystal Motifs (Surface mapping) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-25">
        {/* Floating Crystal 1 */}
        <div
          className="absolute top-16 left-8 w-16 h-28 border border-[rgba(201,168,76,0.4)] bg-gradient-to-b from-[rgba(142,68,173,0.3)] to-transparent rounded-lg transform rotate-12 transition-transform duration-700 ease-out"
          style={{ transform: `translate(${mouseParallax.x * -0.5}px, ${mouseParallax.y * -0.5}px) rotate(12deg)` }}
        />
        {/* Floating Crystal 2 */}
        <div
          className="absolute top-44 right-12 w-20 h-36 border border-[rgba(201,168,76,0.3)] bg-gradient-to-b from-[rgba(201,168,76,0.25)] via-[rgba(142,68,173,0.15)] to-transparent rounded-lg transform -rotate-12 transition-transform duration-700 ease-out"
          style={{ transform: `translate(${mouseParallax.x * 0.8}px, ${mouseParallax.y * 0.8}px) rotate(-12deg)` }}
        />
        {/* Floating Island Base 1 */}
        <div
          className="absolute bottom-20 left-10 w-44 h-12 rounded-[50%] border-t border-[rgba(201,168,76,0.3)] bg-gradient-to-b from-[rgba(201,168,76,0.1)] to-transparent blur-[1px] transition-transform duration-700"
          style={{ transform: `translate(${mouseParallax.x * -0.3}px, ${mouseParallax.y * -0.3}px)` }}
        />
      </div>
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(192,57,43,0.12)] border border-[rgba(192,57,43,0.35)]">
          <Flame className="w-3.5 h-3.5 text-[#C0392B]" />
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#f5f3f0]">
            System Synthesis Engine
          </span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-bold text-[#f5f3f0] tracking-wide">
          Dream Forge
        </h1>
        <p className="text-sm font-mono text-[#8a6e2a]">
          Multi-step intake transforming abstract product visions into battle-tested architectural floors.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="max-w-xl mx-auto flex items-center justify-between relative px-2">
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[rgba(201,168,76,0.2)] -translate-y-1/2 -z-0" />
        {[
          { num: 1, label: 'Vision', icon: Sparkles },
          { num: 2, label: 'Architecture', icon: Layers },
          { num: 3, label: 'Monetization', icon: CreditCard },
          { num: 4, label: 'Blueprint', icon: Cpu },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = step === item.num;
          const isDone = step > item.num;
          return (
            <div key={item.num} className="relative z-10 flex flex-col items-center gap-1.5">
              <button
                onClick={() => (step > item.num ? setStep(item.num) : null)}
                className={`w-9 h-9 rounded-full flex items-center justify-center border font-mono text-xs transition-all ${
                  isActive
                    ? 'bg-[#C9A84C] text-[#050404] border-[#e8c96a] font-bold shadow-[0_0_14px_rgba(201,168,76,0.4)]'
                    : isDone
                    ? 'bg-[#0a0908] text-[#C9A84C] border-[#C9A84C]'
                    : 'bg-[#050404] text-[#8a6e2a] border-[rgba(201,168,76,0.2)]'
                }`}
              >
                {isDone ? <CheckCircle className="w-4 h-4" /> : item.num}
              </button>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8a6e2a]">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Form Container */}
      <GlassCard className="p-6 sm:p-10 border-[rgba(201,168,76,0.25)] text-left">
        {/* STEP 1: Vision & Scope */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="border-b border-[rgba(201,168,76,0.15)] pb-4">
              <h3 className="text-xl font-display font-semibold text-[#f5f3f0]">
                Step 1: Product Concept & Problem Statement
              </h3>
              <p className="text-xs font-mono text-[#8a6e2a]">
                Define the core value proposition and target audience without marketing fluff.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#C9A84C] uppercase tracking-wider mb-1.5">
                  Platform / System Name *
                </label>
                <input
                  type="text"
                  value={intake.appName}
                  onChange={(e) => setIntake({ ...intake, appName: e.target.value })}
                  placeholder="e.g. ExamPadi / KeduPay / Steary"
                  className="w-full px-4 py-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-sm text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#C9A84C] uppercase tracking-wider mb-1.5">
                  The Core Friction / Problem to Obliterate *
                </label>
                <textarea
                  rows={3}
                  value={intake.problemStatement}
                  onChange={(e) => setIntake({ ...intake, problemStatement: e.target.value })}
                  placeholder="What is broken in the status quo? Be brutal. Why does current software fail this user?"
                  className="w-full px-4 py-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-sm text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#C9A84C] uppercase tracking-wider mb-1.5">
                  Target User Base & Operational Geography
                </label>
                <input
                  type="text"
                  value={intake.targetAudience}
                  onChange={(e) => setIntake({ ...intake, targetAudience: e.target.value })}
                  placeholder="e.g. West African secondary school students / High-throughput logistics fleets"
                  className="w-full px-4 py-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-sm text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button variant="primary" onClick={handleNext}>
                <span>Step 2: Technical Constraints</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Architecture & Constraints */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="border-b border-[rgba(201,168,76,0.15)] pb-4">
              <h3 className="text-xl font-display font-semibold text-[#f5f3f0]">
                Step 2: Technical Constraints & Durability
              </h3>
              <p className="text-xs font-mono text-[#8a6e2a]">
                Define durability, offline guarantees, and storage architecture.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono text-[#C9A84C] uppercase tracking-wider mb-2">
                  Database & Persistence Engine
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'supabase', label: 'Supabase (PostgreSQL + RLS + Auth)' },
                    { id: 'postgresql', label: 'Self-Hosted PostgreSQL / Cloud SQL' },
                    { id: 'sqlite', label: 'SQLite / Turso (Ultra-Edge Embedded)' },
                    { id: 'firebase', label: 'Firebase Firestore & Auth' },
                  ].map((db) => (
                    <label
                      key={db.id}
                      className={`flex items-center gap-3 p-3 rounded border text-xs cursor-pointer transition-colors ${
                        intake.databasePreference === db.id
                          ? 'bg-[rgba(201,168,76,0.12)] border-[#C9A84C] text-[#f5f3f0]'
                          : 'bg-[#050404] border-[rgba(201,168,76,0.2)] text-[#c4c0bb]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="db"
                        checked={intake.databasePreference === db.id}
                        onChange={() => setIntake({ ...intake, databasePreference: db.id as any })}
                        className="accent-[#C9A84C]"
                      />
                      <span>{db.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-[#C9A84C] uppercase tracking-wider mb-2">
                    AI & Intelligence Integration
                  </label>
                  <select
                    value={intake.aiRequirement}
                    onChange={(e: any) => setIntake({ ...intake, aiRequirement: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
                  >
                    <option value="hybrid">Hybrid (Fast Groq LLM + Gemini Fallback + In-Memory Cache)</option>
                    <option value="core">AI-Authoritative (Vector RAG + Socratic Memory)</option>
                    <option value="none">Pure Deterministic Logic (Zero AI dependency)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 p-3 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={intake.offlineFirst}
                      onChange={(e) => setIntake({ ...intake, offlineFirst: e.target.checked })}
                      className="w-4 h-4 accent-[#C9A84C]"
                    />
                    <div>
                      <span className="text-xs font-medium text-[#f5f3f0] block">
                        Strict Offline-First Capability (PWA)
                      </span>
                      <span className="text-[11px] font-mono text-[#8a6e2a]">
                        App operates seamlessly through network blackouts.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button variant="primary" onClick={handleNext}>
                <span>Step 3: Business Floor</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Monetization & Compliance */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="border-b border-[rgba(201,168,76,0.15)] pb-4">
              <h3 className="text-xl font-display font-semibold text-[#f5f3f0]">
                Step 3: Monetization Floor & Payment Rails
              </h3>
              <p className="text-xs font-mono text-[#8a6e2a]">
                Every business starts free until first pay. Define how value converts to sovereign revenue.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono text-[#C9A84C] uppercase tracking-wider mb-2">
                  Revenue Architecture
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'subscription', label: 'Recurring Subscription (Monthly / Annual)' },
                    { id: 'pay_per_use', label: 'Metered Consumption / Token Ledger' },
                    { id: 'one_time', label: 'One-Time License (Perpetual Software)' },
                    { id: 'freemium', label: 'Free-Until-First-Pay (Limits & Depth locked)' },
                  ].map((m) => (
                    <label
                      key={m.id}
                      className={`flex items-center gap-3 p-3 rounded border text-xs cursor-pointer transition-colors ${
                        intake.monetizationModel === m.id
                          ? 'bg-[rgba(201,168,76,0.12)] border-[#C9A84C] text-[#f5f3f0]'
                          : 'bg-[#050404] border-[rgba(201,168,76,0.2)] text-[#c4c0bb]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="monetization"
                        checked={intake.monetizationModel === m.id}
                        onChange={() => setIntake({ ...intake, monetizationModel: m.id as any })}
                        className="accent-[#C9A84C]"
                      />
                      <span>{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-[#C9A84C] uppercase tracking-wider mb-2">
                    Primary Settlement Currency
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-mono text-[#f5f3f0] cursor-pointer">
                      <input
                        type="radio"
                        name="currency"
                        checked={intake.primaryCurrency === 'NGN'}
                        onChange={() => setIntake({ ...intake, primaryCurrency: 'NGN' })}
                        className="accent-[#C9A84C]"
                      />
                      <span>NGN (₦ Paystack Rail)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-mono text-[#f5f3f0] cursor-pointer">
                      <input
                        type="radio"
                        name="currency"
                        checked={intake.primaryCurrency === 'USD'}
                        onChange={() => setIntake({ ...intake, primaryCurrency: 'USD' })}
                        className="accent-[#C9A84C]"
                      />
                      <span>USD ($ Stripe / Paystack USD)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#C9A84C] uppercase tracking-wider mb-2">
                    Data Compliance Standard
                  </label>
                  <input
                    type="text"
                    value={intake.complianceNeeds}
                    onChange={(e) => setIntake({ ...intake, complianceNeeds: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <EdgeGlow intensity="intense" color="gold" borderRadius="8px">
                <Button variant="primary" onClick={handleSynthesize}>
                  <Flame className="w-4 h-4 mr-2" />
                  Synthesize Architectural Floor
                </Button>
              </EdgeGlow>
            </div>
          </div>
        )}

        {/* STEP 4: Synthesized Blueprint Output */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(201,168,76,0.15)] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <StatusBadge status="Blueprint Certified" variant="gold" />
                  <span className="text-xs font-mono text-[#8a6e2a]">{intake.appName}</span>
                </div>
                <h3 className="text-2xl font-display font-bold text-[#f5f3f0] mt-1">
                  Architectural Specification
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleSynthesize} disabled={synthesizing}>
                  <RefreshCw className={`w-3.5 h-3.5 mr-1 ${synthesizing ? 'animate-spin' : ''}`} />
                  Re-Synthesize
                </Button>
                <Button variant="primary" size="sm" onClick={copyBlueprint} disabled={!blueprintResult}>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy Blueprint
                </Button>
              </div>
            </div>

            {synthesizing ? (
              <div className="py-20 text-center space-y-4">
                <YinYangLoader size={100} text="Forging Production Architecture..." />
                <p className="font-mono text-xs text-[#8a6e2a]">
                  PRIME is stress-testing your architecture against sovereign standards.
                </p>
              </div>
            ) : blueprintResult ? (
              <div className="space-y-4 relative">
                {/* Crystal Shatter Animation */}
                <AnimatePresence>
                  {shatterActive && (
                    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
                      {Array.from({ length: 24 }).map((_, i) => {
                        const angle = (i / 24) * 2 * Math.PI;
                        const dist = 180 + Math.random() * 200;
                        return (
                          <motion.div
                            key={i}
                            initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                            animate={{
                              x: Math.cos(angle) * dist,
                              y: Math.sin(angle) * dist,
                              opacity: 0,
                              scale: 0.2,
                              rotate: Math.random() * 360,
                            }}
                            transition={{ duration: 1.8, ease: 'easeOut' }}
                            className="absolute top-1/2 left-1/2 w-4 h-8 bg-gradient-to-t from-[rgba(142,68,173,0.8)] via-[#C9A84C] to-[#e8c96a] border border-[#e8c96a] rounded-sm shadow-[0_0_15px_rgba(201,168,76,0.8)]"
                          />
                        );
                      })}
                    </div>
                  )}
                </AnimatePresence>

                <div className="p-6 rounded bg-[#050404] border border-[rgba(201,168,76,0.3)] font-mono text-xs sm:text-sm text-[#c4c0bb] whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                  {blueprintResult}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded bg-[#0a0908] border border-[rgba(201,168,76,0.2)] text-xs font-mono">
                  <span className="text-[#8a6e2a]">
                    Floor constructed. Ready for implementation in Cursor or Next.js App Router.
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIntake({
                        appName: '',
                        problemStatement: '',
                        targetAudience: '',
                        offlineFirst: true,
                        databasePreference: 'supabase',
                        aiRequirement: 'hybrid',
                        monetizationModel: 'subscription',
                        primaryCurrency: 'NGN',
                        complianceNeeds: 'Standard GDPR / NDPR compliant data storage with RLS',
                      });
                      setStep(1);
                      setBlueprintResult(null);
                    }}
                  >
                    Start New Forge
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
