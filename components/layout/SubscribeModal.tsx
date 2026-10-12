'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import EdgeGlow from '../ui/EdgeGlow';
import VerifiedBadge from '../ui/VerifiedBadge';
import { JADAI_ROSTER, JadaiCharacter } from '../../lib/data/jadaiArt';
import { StudioAudio } from '../../lib/watermark';
import { useCurrency } from '../providers/CurrencyProvider';
import { STARTUP_PAYSTACK_PLANS } from '../../lib/paystack';
import {
  Check,
  Sparkles,
  Shield,
  Zap,
  Flame,
  Crown,
  Play,
  SkipForward,
  Lock,
  ArrowRight,
  Gift,
  CheckCircle2,
} from 'lucide-react';

export interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (tier: string) => void;
  onNavigate?: (path: string) => void;
}

export const SubscribeModal: React.FC<SubscribeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onNavigate,
}) => {
  const [artStep, setArtStep] = useState(0); // 0 to 8 characters in 30s sequence
  const [animatingSequence, setAnimatingSequence] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string>('playground');
  const [email, setEmail] = useState('');
  const [googleAuthenticated, setGoogleAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const { currency, formatDual } = useCurrency();

  // 30-second sequence timer
  useEffect(() => {
    if (!isOpen || !animatingSequence) return;

    const interval = setInterval(() => {
      setArtStep((prev) => {
        if (prev >= JADAI_ROSTER.length - 1) {
          setAnimatingSequence(false);
          return prev;
        }
        return prev + 1;
      });
    }, 3300);

    return () => clearInterval(interval);
  }, [isOpen, animatingSequence]);

  const activeCharacter = JADAI_ROSTER[artStep] || JADAI_ROSTER[0];

  // Canonical price book — derived from STARTUP_PAYSTACK_PLANS so this modal,
  // /pricing, and /upgrade can never disagree.
  const tiers = [
    {
      id: 'free',
      name: 'Free Covenant',
      price: 'Free Forever',
      desc: 'Weekly intelligence, Book of Lies drops, and 3 tries/day on the core engines.',
      icon: Sparkles,
      amountKobo: 0,
      usd: 0,
      isPaid: false,
    },
    {
      id: 'playground',
      name: 'Playground Suite',
      price: `${formatDual(9, 8000).main} / mo`,
      desc: 'Unlimited FORGE, ORACLE, MIRAGE & SENTINEL runs with 4K exports.',
      icon: Shield,
      amountKobo: STARTUP_PAYSTACK_PLANS.playground.amountKobo,
      usd: 9,
      isPaid: true,
    },
    {
      id: 'studio_premium',
      name: 'Studio Premium',
      price: `${formatDual(5, 4000).main} / mo`,
      desc: 'Full 70-episode Book of Lies canon, audio transmissions, and asset gallery.',
      icon: Zap,
      amountKobo: STARTUP_PAYSTACK_PLANS.studio_premium.amountKobo,
      usd: 5,
      isPaid: true,
    },
    {
      id: 'signal_pro',
      name: 'Signal Pro',
      price: `${formatDual(19, 15000).main} / mo`,
      desc: '100 autonomous signals/day, watchlists, and smart outreach writer.',
      icon: Flame,
      amountKobo: STARTUP_PAYSTACK_PLANS.signal_pro.amountKobo,
      usd: 19,
      isPaid: true,
    },
    {
      id: 'signal_business',
      name: 'Signal Business',
      price: `${formatDual(49, 45000).main} / mo`,
      desc: '500 signals/day, 5 seats, outbound dispatcher, and founder strategy call.',
      icon: Crown,
      amountKobo: STARTUP_PAYSTACK_PLANS.signal_business.amountKobo,
      usd: 49,
      isPaid: true,
    },
  ];

  const handleGoogleSignIn = async () => {
    StudioAudio.playClick();
    const { isSupabaseConfigured } = await import('../../lib/supabase/client');
    if (!isSupabaseConfigured()) {
      setCheckoutError(
        'Google verification requires Supabase OAuth — not configured for this deployment yet.'
      );
      return;
    }
    const { supabase } = await import('../../lib/supabase/client');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
    });
    if (error) {
      setCheckoutError(error.message);
      return;
    }
    setGoogleAuthenticated(true);
  };

  const handleCompleteSubscription = async () => {
    StudioAudio.playClick();
    setLoading(true);
    setCheckoutError(null);

    const activeTierObj = tiers.find((t) => t.id === selectedTier);

    if (activeTierObj?.isPaid) {
      try {
        const res = await fetch('/api/paystack/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email || 'guest@jadai.dev',
            currency,
            plan: selectedTier,
          }),
        });
        const data = await res.json();
        if (data?.success && data.authorization_url) {
          if (data.admin_bypass) {
            // Master admin bypass — unlock without payment
            localStorage.setItem('jadai-user-tier', selectedTier);
            localStorage.setItem('jadai-user-subscribed', 'true');
            localStorage.setItem('jadai-subscription-date', new Date().toISOString());
            StudioAudio.playSuccessArpeggio();
            setLoading(false);
            setSuccess(true);
            if (onSuccess) onSuccess(selectedTier);
            return;
          }
          // Real checkout — entitlements activate via webhook after payment
          localStorage.setItem('jadai_pending_plan', selectedTier);
          window.location.href = data.authorization_url;
          return;
        }
        throw new Error(data?.error || 'Checkout could not start');
      } catch (err: any) {
        setLoading(false);
        setCheckoutError(err?.message || 'Payment gateway unreachable. Try again shortly.');
        return;
      }
    }

    localStorage.setItem('jadai-user-tier', selectedTier);
    localStorage.setItem('jadai-user-subscribed', 'true');
    localStorage.setItem('jadai-subscription-date', new Date().toISOString());

    StudioAudio.playSuccessArpeggio();
    setLoading(false);
    setSuccess(true);
    if (onSuccess) onSuccess(selectedTier);
  };

  const handleGoToPremium = () => {
    onClose();
    if (onNavigate) {
      onNavigate('/account/premium');
    } else {
      window.location.href = '/account/premium';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl overflow-y-auto">
      <div className="w-full max-w-4xl my-auto">
        <EdgeGlow intensity="intense" color="gold" borderRadius={24}>
          <div
            style={{ borderRadius: '24px' }}
            className="p-6 sm:p-8 bg-[#0a0908] border border-[rgba(201,168,76,0.35)] shadow-[0_25px_80px_rgba(0,0,0,0.95)] text-[#c4c0bb] space-y-6 max-h-[92vh] overflow-y-auto"
          >
            {/* 1. ARTISTIC REVEAL SEQUENCE (Section 8 & 12) */}
            {animatingSequence && (
              <div className="relative rounded-2xl overflow-hidden border border-[rgba(201,168,76,0.3)] bg-[#050404] h-72 sm:h-80 shadow-2xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCharacter.id}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                  >
                    <img
                      src={activeCharacter.image}
                      alt={activeCharacter.name}
                      className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050404] via-[#050404]/60 to-transparent" />

                    {/* Story Text Overlay (Cinematic Donghua Style) */}
                    <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-[0.25em] px-2.5 py-1 rounded bg-[rgba(201,168,76,0.2)] border border-[rgba(201,168,76,0.3)] text-[#e8c96a]">
                          {activeCharacter.realm.toUpperCase()} // SIN: {activeCharacter.sinTied}
                        </span>
                        <span className="text-[10px] font-mono text-[#8a6e2a]">
                          Roster 0{artStep + 1} / 09
                        </span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#f5f3f0] drop-shadow-lg">
                        {activeCharacter.name}
                      </h3>
                      <p className="text-xs sm:text-sm font-mono text-[#e8c96a] max-w-xl leading-relaxed italic drop-shadow">
                        "{activeCharacter.story}"
                      </p>
                      <p className="text-[11px] text-[#c4c0bb] line-clamp-1">
                        Shadow Manifest: {activeCharacter.shadowBeing.name} — {activeCharacter.shadowBeing.description}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Skip / Proceed Button */}
                <button
                  onClick={() => setAnimatingSequence(false)}
                  className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-black/80 border border-[rgba(201,168,76,0.3)] hover:border-[#C9A84C] text-[11px] font-mono text-[#e8c96a] flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Skip Reveal</span>
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {!success ? (
              <>
                {/* Header */}
                <div className="text-center space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9A84C] font-bold">
                    Studio Membership
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#f5f3f0]">
                    Select Your Tier
                  </h2>
                  <p className="text-xs font-mono text-[#8a6e2a]">
                    Unlock the 12 studio tools, Book of Lies canon, and private builder network.
                  </p>
                </div>

                {/* Tier Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tiers.map((tier) => {
                    const isSelected = selectedTier === tier.id;
                    const Icon = tier.icon;

                    return (
                      <div
                        key={tier.id}
                        onClick={() => {
                          StudioAudio.playClick();
                          setSelectedTier(tier.id);
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                          isSelected
                            ? 'bg-[rgba(201,168,76,0.12)] border-[#C9A84C] shadow-[0_0_20px_rgba(201,168,76,0.2)]'
                            : 'bg-[#050404] border-[rgba(201,168,76,0.2)] hover:border-[#8a6e2a]'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="w-8 h-8 rounded-lg bg-[rgba(201,168,76,0.15)] border border-[rgba(201,168,76,0.3)] flex items-center justify-center text-[#e8c96a]">
                              <Icon className="w-4 h-4" />
                            </div>
                            {isSelected && (
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#C9A84C] text-[#050404] font-bold">
                                Active Choice
                              </span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-display font-bold text-base text-[#f5f3f0]">
                              {tier.name}
                            </h4>
                            <span className="font-mono text-sm text-[#e8c96a] font-bold">
                              {tier.price}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#c4c0bb] leading-relaxed">
                            {tier.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Google Sign-in Verification & Paystack Checkout */}
                <div className="p-5 rounded-2xl bg-[#050404] border border-[rgba(201,168,76,0.25)] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a] block">
                        Step 1: Identity Anchor
                      </span>
                      <h4 className="font-display font-bold text-sm text-[#f5f3f0]">
                        Google Authentication
                      </h4>
                    </div>

                    {!googleAuthenticated ? (
                      <button
                        onClick={handleGoogleSignIn}
                        className="px-4 py-2.5 rounded-xl bg-white text-black font-mono text-xs font-bold hover:bg-neutral-200 transition-all flex items-center gap-2 cursor-pointer shadow"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span>Continue with Google</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(201,168,76,0.15)] border border-[#C9A84C] text-[#e8c96a] font-mono text-xs font-bold">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Email Verified: {email}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[rgba(201,168,76,0.15)]">
                    <button
                      onClick={onClose}
                      className="text-xs font-mono text-[#8a6e2a] hover:text-white"
                    >
                      Dismiss
                    </button>

                    <div className="flex items-center gap-3">
                      {checkoutError && (
                        <span className="text-[11px] font-mono text-[#C0392B] max-w-[240px] text-right">
                          {checkoutError}
                        </span>
                      )}
                      <button
                        onClick={handleCompleteSubscription}
                        disabled={loading || !googleAuthenticated}
                        className="px-6 py-2.5 rounded-xl bg-[#C9A84C] text-[#050404] font-mono text-xs font-bold hover:bg-[#e8c96a] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-md cursor-pointer"
                      >
                        <span>
                          {loading
                            ? 'Authorizing...'
                            : `Complete with Paystack (${tiers.find((t) => t.id === selectedTier)?.name})`}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Success Screen (Unlocks Premium Profile) */
              <div className="text-center space-y-6 py-6">
                <div className="w-16 h-16 rounded-full bg-[rgba(201,168,76,0.2)] border border-[#C9A84C] text-[#C9A84C] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(201,168,76,0.4)]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#f5f3f0]">
                    Membership Access Activated
                  </h3>
                  <p className="text-xs font-mono text-[#8a6e2a]">
                    Welcome email dispatched. Verified Member Badge added to your profile.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.2)] max-w-md mx-auto text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between text-[#e8c96a]">
                    <span>Current Tier:</span>
                    <span className="font-bold uppercase">{selectedTier}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#c4c0bb]">
                    <span>Status:</span>
                    <span className="text-emerald-400 font-bold">Active • Unrestricted</span>
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={handleGoToPremium}
                    className="px-6 py-3 rounded-xl bg-[#C9A84C] text-[#050404] font-mono text-xs font-bold hover:bg-[#e8c96a] transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <span>Enter Premium Profile</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </EdgeGlow>
      </div>
    </div>
  );
};

export default SubscribeModal;
