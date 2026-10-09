'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import GlassCard from '@/components/ui/GlassCard';
import FAQSection from '@/components/ui/FAQSection';
import { BILLING_FAQ } from '@/lib/data/faqs';
import Button from '@/components/ui/Button';
import EdgeGlow from '@/components/ui/EdgeGlow';
import { useToast } from '@/components/providers/ToastProvider';
import { useCurrency } from '@/components/providers/CurrencyProvider';
import { StudioAudio } from '@/lib/watermark';
import {
  STARTUP_PAYSTACK_PLANS,
  arePaystackKeysConfigured,
  isAdminEmail,
} from '@/lib/paystack';
import { SEED_TEMPLATES } from '@/lib/data/templates';
import {
  Check,
  Zap,
  Sparkles,
  Shield,
  Layers,
  Crown,
  ShoppingBag,
  ExternalLink,
  Lock,
  ArrowRight,
  CreditCard,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface PricingPageProps {
  onNavigate?: (path: string) => void;
}

export default function PricingPage({ onNavigate }: PricingPageProps) {
  const { showToast } = useToast();
  const { currency, setCurrency } = useCurrency();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [keysConfigured, setKeysConfigured] = useState(true);

  // Check user session
  useEffect(() => {
    try {
      const session = localStorage.getItem('jadai_user_session');
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed.email) setUserEmail(parsed.email);
      }
    } catch {}

    setKeysConfigured(arePaystackKeysConfigured());
  }, []);

  const handleSubscribe = async (planKey: string) => {
    StudioAudio.playClick();
    setLoadingPlan(planKey);

    const email = userEmail || prompt('Please enter your email to proceed to checkout:') || '';
    if (!email || !email.includes('@')) {
      setLoadingPlan(null);
      showToast('Valid email required for license issuance.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planKey,
          email,
          currency,
        }),
      });

      const data = await res.json();
      if (data.success && data.authorization_url) {
        StudioAudio.playSuccessArpeggio();
        if (data.admin_bypass) {
          showToast('Master Admin bypass recognized: VIP All-Access Unlocked!', 'success');
          if (onNavigate) onNavigate('/account/premium');
          else window.location.href = '/account/premium';
          return;
        }

        if (data.simulated) {
          showToast('Sandbox mode: redirecting to license activation...', 'info');
        }
        window.location.href = data.authorization_url;
      } else {
        throw new Error(data.error || 'Initialization failed');
      }
    } catch (err: any) {
      showToast(err.message || 'Payment system unreachable. Please try again.', 'error');
    } finally {
      setLoadingPlan(null);
    }
  };

  const isUsd = currency === 'USD';

  return (
    <div className="min-h-screen bg-[#050404] text-[#c4c0bb] py-12 px-4 sm:px-6 max-w-7xl mx-auto space-y-12 select-none">
      {/* -------------------------------------------------------------------
          TOP HEADER & DUAL CURRENCY TOGGLE
         ------------------------------------------------------------------- */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.3)] text-[#e8c96a] text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
          <span>AFFORDABLE STARTUP PRICING • DIRECT SOVEREIGN VALUE</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-display font-black text-[#f5f3f0] tracking-tight">
          Invest in the Floor. <span className="text-[#C9A84C]">Own the Machine.</span>
        </h1>

        <p className="text-sm sm:text-base text-[#8a857e] leading-relaxed">
          Predictable, transparent subscription tiers engineered for indie founders, authors, and engineering teams.
          Never opaque overages. Zero lock-in.
        </p>

        {/* Dual Currency Switcher with smooth layout animation */}
        <div className="pt-2 flex items-center justify-center gap-3">
          <span className="text-xs font-mono text-[#8a857e]">Select Currency:</span>
          <div className="relative p-1 rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.35)] flex items-center gap-1 shadow-inner backdrop-blur-md">
            <button
              onClick={() => {
                setCurrency('NGN');
                StudioAudio.playClick();
              }}
              className={`relative z-10 px-5 py-2 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer select-none ${
                !isUsd ? 'text-[#050404]' : 'text-[#8a857e] hover:text-[#f5f3f0]'
              }`}
            >
              {!isUsd && (
                <motion.div
                  layoutId="currencyActiveTab"
                  className="absolute inset-0 bg-gradient-to-r from-[#C9A84C] via-[#dfbe5f] to-[#e8c96a] rounded-xl -z-10 shadow-[0_0_15px_rgba(201,168,76,0.45)]"
                  transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.8 }}
                />
              )}
              NGN (₦)
            </button>
            <button
              onClick={() => {
                setCurrency('USD');
                StudioAudio.playClick();
              }}
              className={`relative z-10 px-5 py-2 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer select-none ${
                isUsd ? 'text-[#050404]' : 'text-[#8a857e] hover:text-[#f5f3f0]'
              }`}
            >
              {isUsd && (
                <motion.div
                  layoutId="currencyActiveTab"
                  className="absolute inset-0 bg-gradient-to-r from-[#C9A84C] via-[#dfbe5f] to-[#e8c96a] rounded-xl -z-10 shadow-[0_0_15px_rgba(201,168,76,0.45)]"
                  transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.8 }}
                />
              )}
              USD ($)
            </button>
          </div>
        </div>

        {/* Missing Keys Notice Banner */}
        {!keysConfigured && (
          <div className="p-3.5 rounded-2xl bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.3)] text-xs font-mono text-[#e8c96a] flex items-center justify-center gap-2 max-w-md mx-auto">
            <Clock className="w-4 h-4 text-[#C9A84C] shrink-0" />
            <span>Live Paystack gateway activating soon — simulated sandbox active.</span>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------------
          TIER CARDS GRID
         ------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {/* 1. FREE FLOOR */}
        <GlassCard className="p-6 flex flex-col justify-between border-[rgba(201,168,76,0.2)] hover:border-[rgba(201,168,76,0.4)] transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a857e]">
                Tier 0
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#c4c0bb]">
                Always Active
              </span>
            </div>

            <div>
              <h3 className="text-xl font-display font-bold text-[#f5f3f0]">Free Floor</h3>
              <p className="text-xs text-[#8a857e] mt-1">
                Explore the studio, test tools, and read the public transmissions.
              </p>
            </div>

            <div className="py-2 border-y border-[rgba(201,168,76,0.12)] flex items-baseline gap-1">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`price-free-${currency}`}
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="text-3xl font-mono font-bold text-[#f5f3f0]"
                >
                  {isUsd ? '$0' : '₦0'}
                </motion.span>
              </AnimatePresence>
              <span className="text-xs font-mono text-[#8a857e]"> / month</span>
            </div>

            <ul className="space-y-2 text-xs font-sans text-[#c4c0bb]">
              {STARTUP_PAYSTACK_PLANS.free.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6">
            <motion.button
              key={`btn-free-${currency}`}
              initial={{ scale: 0.97, opacity: 0.85 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 350, damping: 24 }}
              onClick={() => onNavigate ? onNavigate('/playground') : (window.location.href = '/playground')}
              className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-mono text-[#f5f3f0] transition-all cursor-pointer font-medium"
            >
              Explore Playground
            </motion.button>
          </div>
        </GlassCard>

        {/* 2. PLAYGROUND SUITE (MOST POPULAR) */}
        <div className="relative flex flex-col">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#C9A84C] text-[#050404] text-[10px] font-mono font-bold uppercase tracking-wider z-20 shadow-md">
            Most Popular
          </div>
          <GlassCard className="p-6 flex-1 flex flex-col justify-between border-[#C9A84C] ring-1 ring-[#C9A84C]/40 bg-[rgba(201,168,76,0.04)]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A84C]">
                  Tier 1 • Creation Pass
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(201,168,76,0.2)] text-[#e8c96a] font-bold">
                  Unlimited Tools
                </span>
              </div>

              <div>
                <h3 className="text-xl font-display font-bold text-[#f5f3f0]">Playground Suite</h3>
                <p className="text-xs text-[#8a857e] mt-1">
                  Full unrestricted creation engine for writers, designers, and builders.
                </p>
              </div>

              <div className="py-2 border-y border-[rgba(201,168,76,0.18)] flex items-baseline gap-1">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`price-playground-${currency}`}
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="text-3xl font-mono font-bold text-[#e8c96a]"
                  >
                    {isUsd ? '$9' : '₦8,000'}
                  </motion.span>
                </AnimatePresence>
                <span className="text-xs font-mono text-[#8a857e]"> / month</span>
              </div>

              <ul className="space-y-2 text-xs font-sans text-[#c4c0bb]">
                {STARTUP_PAYSTACK_PLANS.playground.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#C9A84C] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6">
              <motion.button
                key={`btn-playground-${currency}`}
                initial={{ scale: 0.97, opacity: 0.85 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.025, filter: 'brightness(1.1)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 350, damping: 24 }}
                onClick={() => handleSubscribe('playground')}
                disabled={loadingPlan === 'playground'}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#b8941e] text-[#050404] font-mono text-xs font-bold hover:brightness-110 active:scale-[0.99] transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {loadingPlan === 'playground'
                  ? 'Preparing Checkout...'
                  : isUsd
                  ? 'Subscribe to Playground • $9'
                  : 'Subscribe to Playground • ₦8,000'}
              </motion.button>
            </div>
          </GlassCard>
        </div>

        {/* 3. STUDIO PREMIUM */}
        <GlassCard className="p-6 flex flex-col justify-between border-[rgba(201,168,76,0.25)] hover:border-[rgba(201,168,76,0.5)] transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a857e]">
                Tier 2 • Literature & Assets
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(192,57,43,0.15)] text-[#e85a4f]">
                Full Canon
              </span>
            </div>

            <div>
              <h3 className="text-xl font-display font-bold text-[#f5f3f0]">Studio Premium</h3>
              <p className="text-xs text-[#8a857e] mt-1">
                Uncensored Book of Lies, audio narrations, and sovereign media assets.
              </p>
            </div>

            <div className="py-2 border-y border-[rgba(201,168,76,0.12)] flex items-baseline gap-1">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`price-studio-${currency}`}
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="text-3xl font-mono font-bold text-[#f5f3f0]"
                >
                  {isUsd ? '$5' : '₦4,000'}
                </motion.span>
              </AnimatePresence>
              <span className="text-xs font-mono text-[#8a857e]"> / month</span>
            </div>

            <ul className="space-y-2 text-xs font-sans text-[#c4c0bb]">
              {STARTUP_PAYSTACK_PLANS.studio_premium.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6">
            <motion.button
              key={`btn-studio-${currency}`}
              initial={{ scale: 0.97, opacity: 0.85 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.025, filter: 'brightness(1.1)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 350, damping: 24 }}
              onClick={() => handleSubscribe('studio_premium')}
              disabled={loadingPlan === 'studio_premium'}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-[rgba(201,168,76,0.3)] text-xs font-mono text-[#e8c96a] transition-all cursor-pointer font-bold disabled:opacity-50"
            >
              {loadingPlan === 'studio_premium'
                ? 'Preparing Checkout...'
                : isUsd
                ? 'Unlock Studio Premium • $5'
                : 'Unlock Studio Premium • ₦4,000'}
            </motion.button>
          </div>
        </GlassCard>

        {/* 4. SIGNAL PRO */}
        <GlassCard className="p-6 flex flex-col justify-between border-[rgba(255,140,60,0.3)] hover:border-[rgba(255,140,60,0.6)] transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff8c3c]">
                Distribution OS
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(255,140,60,0.15)] text-[#ff8c3c]">
                100 Signals/Day
              </span>
            </div>

            <div>
              <h3 className="text-xl font-display font-bold text-[#f5f3f0]">Signal Pro</h3>
              <p className="text-xs text-[#8a857e] mt-1">
                Autonomous buyer lead scouting with auto-personalized outreach copy.
              </p>
            </div>

            <div className="py-2 border-y border-[rgba(255,140,60,0.15)] flex items-baseline gap-1">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`price-signal-pro-${currency}`}
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="text-3xl font-mono font-bold text-[#ff8c3c]"
                >
                  {isUsd ? '$19' : '₦15,000'}
                </motion.span>
              </AnimatePresence>
              <span className="text-xs font-mono text-[#8a857e]"> / month</span>
            </div>

            <ul className="space-y-2 text-xs font-sans text-[#c4c0bb]">
              {STARTUP_PAYSTACK_PLANS.signal_pro.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#ff8c3c] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6">
            <motion.button
              key={`btn-signal-pro-${currency}`}
              initial={{ scale: 0.97, opacity: 0.85 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.025, filter: 'brightness(1.1)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 350, damping: 24 }}
              onClick={() => handleSubscribe('signal_pro')}
              disabled={loadingPlan === 'signal_pro'}
              className="w-full py-2.5 rounded-xl bg-[rgba(255,140,60,0.2)] border border-[rgba(255,140,60,0.4)] hover:bg-[rgba(255,140,60,0.3)] text-xs font-mono text-[#ffb076] transition-all cursor-pointer font-bold disabled:opacity-50"
            >
              {loadingPlan === 'signal_pro'
                ? 'Preparing Checkout...'
                : isUsd
                ? 'Activate Signal Pro • $19'
                : 'Activate Signal Pro • ₦15,000'}
            </motion.button>
          </div>
        </GlassCard>

        {/* 5. SIGNAL BUSINESS */}
        <GlassCard className="p-6 flex flex-col justify-between border-[rgba(201,168,76,0.35)] hover:border-[rgba(201,168,76,0.6)] transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A84C]">
                Agency & Teams
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(201,168,76,0.15)] text-[#e8c96a]">
                500 Signals/Day + 5 Seats
              </span>
            </div>

            <div>
              <h3 className="text-xl font-display font-bold text-[#f5f3f0]">Signal Business</h3>
              <p className="text-xs text-[#8a857e] mt-1">
                Full-throttle automated outbound radar with founder strategy support.
              </p>
            </div>

            <div className="py-2 border-y border-[rgba(201,168,76,0.15)] flex items-baseline gap-1">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`price-signal-biz-${currency}`}
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="text-3xl font-mono font-bold text-[#f5f3f0]"
                >
                  {isUsd ? '$49' : '₦45,000'}
                </motion.span>
              </AnimatePresence>
              <span className="text-xs font-mono text-[#8a857e]"> / month</span>
            </div>

            <ul className="space-y-2 text-xs font-sans text-[#c4c0bb]">
              {STARTUP_PAYSTACK_PLANS.signal_business.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#C9A84C] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6">
            <motion.button
              key={`btn-signal-biz-${currency}`}
              initial={{ scale: 0.97, opacity: 0.85 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.025, filter: 'brightness(1.1)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 350, damping: 24 }}
              onClick={() => handleSubscribe('signal_business')}
              disabled={loadingPlan === 'signal_business'}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-[rgba(201,168,76,0.4)] text-xs font-mono text-[#e8c96a] transition-all cursor-pointer font-bold disabled:opacity-50"
            >
              {loadingPlan === 'signal_business'
                ? 'Preparing Checkout...'
                : isUsd
                ? 'Deploy Signal Business • $49'
                : 'Deploy Signal Business • ₦45,000'}
            </motion.button>
          </div>
        </GlassCard>

        {/* 6. MARKETPLACE STARTERS */}
        <GlassCard className="p-6 flex flex-col justify-between border-[rgba(201,168,76,0.2)] hover:border-[rgba(201,168,76,0.4)] transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a]">
                Codebase Starters
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(201,168,76,0.1)] text-[#C9A84C]">
                One-Time Purchase
              </span>
            </div>

            <div>
              <h3 className="text-xl font-display font-bold text-[#f5f3f0]">Marketplace Starters</h3>
              <p className="text-xs text-[#8a857e] mt-1">
                Full-stack production apps (Aperture, Vendor, Shelter, Bloom, Glow, Foundry, Codex).
              </p>
            </div>

            <div className="py-2 border-y border-[rgba(201,168,76,0.12)] flex items-baseline gap-1">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`price-market-${currency}`}
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="text-3xl font-mono font-bold text-[#e8c96a]"
                >
                  {isUsd ? '$35 – $65' : '₦52,500 – ₦97,500'}
                </motion.span>
              </AnimatePresence>
              <span className="text-xs font-mono text-[#8a857e]"> / template</span>
            </div>

            <ul className="space-y-2 text-xs font-sans text-[#c4c0bb]">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Full TypeScript + Next.js source code download</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Private GitHub repository invitation token</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Pre-wired Paystack checkout & Supabase database</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Lifetime commercial license for unlimited client projects</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <motion.button
              key={`btn-market-${currency}`}
              initial={{ scale: 0.97, opacity: 0.85 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 350, damping: 24 }}
              onClick={() => onNavigate ? onNavigate('/marketplace') : (window.location.href = '/marketplace')}
              className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-mono text-[#f5f3f0] transition-all cursor-pointer font-medium"
            >
              Browse Template Catalog
            </motion.button>
          </div>
        </GlassCard>
      </div>

      {/* -------------------------------------------------------------------
          FEATURE MATRIX & FAQ CALLOUT
         ------------------------------------------------------------------- */}
      <GlassCard className="p-8 space-y-6 border-[rgba(201,168,76,0.2)]">
        <div className="border-b border-[rgba(201,168,76,0.15)] pb-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A84C]">
            First-Principles Guarantee
          </span>
          <h2 className="text-xl font-display font-bold text-[#f5f3f0] mt-1">
            Why Our Pricing is Different
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed font-sans">
          <div className="space-y-2">
            <h4 className="font-mono font-bold text-sm text-[#e8c96a]">Dual-Currency Rails</h4>
            <p className="text-[#8a857e]">
              Whether paying with a Nigerian debit card via Paystack NGN or international cards in USD,
              checkout clears seamlessly without arbitrary foreign transaction penalties.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-mono font-bold text-sm text-[#e8c96a]">Zero Synthetic Markups</h4>
            <p className="text-[#8a857e]">
            We run our own inference cache and edge workers. Because our underlying architecture is
            strictly optimized, we pass direct efficiency savings on to you.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-mono font-bold text-sm text-[#e8c96a]">Instant Cancel Anytime</h4>
          <p className="text-[#8a857e]">
            No dark patterns. Cancel in one click from your account dashboard. You retain all exported
            manuscripts, codebases, and generated documents forever.
          </p>
        </div>
        </div>
      </GlassCard>

      <FAQSection
        items={BILLING_FAQ}
        title="Billing, Plans & Ownership"
        intro="The honest answers about what you pay, what you own, and what happens when things break."
      />
    </div>
  );
}
