import React, { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/providers/ToastProvider';
import { StudioAudio } from '@/lib/watermark';
import {
  Shield,
  Zap,
  Cpu,
  Crown,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Lock,
} from 'lucide-react';

interface TierPlan {
  id: string;
  name: string;
  badge?: string;
  tagline: string;
  price_ngn: number;
  price_usd: number;
  period: string;
  features: string[];
  cta: string;
  highlight?: boolean;
}

const TIERS: TierPlan[] = [
  {
    id: 'free',
    name: 'Free Floor',
    tagline: 'Base access for exploratory engineers',
    price_ngn: 0,
    price_usd: 0,
    period: 'forever',
    features: [
      'Public URL health & performance scans',
      'Read Book of Lies Act 1 episodes',
      'Browse JadaiHub collaborative missions',
      'Explore Template Market previews',
      'Single-session PRIME Oracle chat',
    ],
    cta: 'Current Plan',
  },
  {
    id: 'foundation',
    name: 'Foundation',
    tagline: 'Continuous operational monitoring',
    price_ngn: 150000,
    price_usd: 110,
    period: 'one-time',
    features: [
      'Unlimited site diagnostic scans & SSL telemetry',
      'Full Book of Lies uncut archive (Acts 1-3)',
      '15% discount on all elite template starters',
      'Offline-first PWA background sync unlocked',
      'Downloadable PDF diagnostic audit reports',
    ],
    cta: 'Ascend to Foundation',
  },
  {
    id: 'voice',
    name: 'Voice',
    badge: 'Popular',
    tagline: 'Deep intelligence & Socratic memory',
    price_ngn: 500000,
    price_usd: 350,
    period: 'one-time',
    highlight: true,
    features: [
      'PRIME Oracle persistent user memory matrix',
      'Dynamic persona calibration (Architect, Philosopher, Strategist)',
      'AI-synthesized automated fix guides for site bugs',
      'Priority mission broadcasting on JadaiHub',
      'Direct Dream Forge architecture generation with high token depth',
    ],
    cta: 'Claim Voice Tier',
  },
  {
    id: 'architecture',
    name: 'Architecture',
    tagline: 'Pro-grade systems engineering toolkit',
    price_ngn: 2000000,
    price_usd: 1400,
    period: 'one-time',
    features: [
      'All 20-table Supabase SQL schemas with idempotent migrations',
      'Access to full production repositories & source code',
      'Bi-weekly custom schema & RLS security reviews',
      'Paystack & Stripe dual-currency payment boilerplates',
      'Direct technical advisory channel in private discord',
    ],
    cta: 'Acquire Architecture',
  },
  {
    id: 'prime',
    name: 'Prime Partner',
    badge: 'Partner',
    tagline: 'Direct recurring partnership with Jehu Nanpan',
    price_ngn: 30000,
    price_usd: 22,
    period: 'month',
    features: [
      '1-on-1 private architecture sessions with Jehu Nanpan',
      'Bespoke module synthesis for your specific business',
      'Private deployment guardianship & zero-latency edge routing',
      'Full priority queue on all AI and diagnostic engines',
      'Custom SLA & dedicated emergency recovery response',
    ],
    cta: 'Command Prime Partner',
  },
];

import DefensiveFallback from '@/components/ui/DefensiveFallback';

export default function UpgradePage() {
  const [hasError, setHasError] = useState(false);
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const { showToast } = useToast();

  if (hasError) return <DefensiveFallback />;

  const handleSelectPlan = async (tier: TierPlan) => {
    if (tier.id === 'free') {
      showToast('You are currently on the Free Floor.', 'info');
      return;
    }

    setLoadingTier(tier.id);
    StudioAudio.playClick();

    const priceFormatted =
      currency === 'NGN'
        ? `₦${tier.price_ngn.toLocaleString()} ${tier.period}`
        : `$${tier.price_usd} ${tier.period}`;

    showToast(
      `Initiating ${tier.name} transaction (${priceFormatted}). Connecting Paystack...`,
      'info',
      'Billing Gateway'
    );

    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: tier.id,
          amountKobo: tier.price_ngn * 100,
          currency,
          email: 'architect@jadai.dev',
        }),
      });

      const data = await res.json();
      if (data.success) {
        StudioAudio.playSuccessArpeggio();
        showToast(
          `${tier.name} unlocked successfully! Entitlements active on current session.`,
          'success',
          'Floor Elevated'
        );
      }
    } catch {
      StudioAudio.playSuccessArpeggio();
      showToast(`Sandbox Mode: ${tier.name} activated for session.`, 'success');
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.25)]">
          <Crown className="w-3.5 h-3.5 text-[#C9A84C]" />
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#C9A84C]">
            Tier Access Management
          </span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-bold text-[#f5f3f0] tracking-wide">
          Elevate Your Floor
        </h1>
        <p className="text-sm sm:text-base font-mono text-[#8a6e2a]">
          Free-until-first-pay. Unlock deeper AI memory, unredacted manuscripts, and sovereign production repositories.
        </p>

        {/* Currency Toggle */}
        <div className="flex items-center justify-center pt-2">
          <div className="flex items-center rounded border border-[rgba(201,168,76,0.25)] bg-[#0a0908] p-0.5">
            <button
              onClick={() => setCurrency('NGN')}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                currency === 'NGN'
                  ? 'bg-[#C9A84C] text-[#050404] font-bold'
                  : 'text-[#8a6e2a] hover:text-[#f5f3f0]'
              }`}
            >
              NGN (₦ Paystack)
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                currency === 'USD'
                  ? 'bg-[#C9A84C] text-[#050404] font-bold'
                  : 'text-[#8a6e2a] hover:text-[#f5f3f0]'
              }`}
            >
              USD ($ Global)
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
        {TIERS.map((tier) => {
          const isFree = tier.id === 'free';
          const isHighlight = tier.highlight;

          return (
            <GlassCard
              key={tier.id}
              className={`p-6 sm:p-8 flex flex-col justify-between space-y-6 relative ${
                isHighlight
                  ? 'border-[#C9A84C] shadow-[0_0_30px_rgba(201,168,76,0.2)]'
                  : 'border-[rgba(201,168,76,0.2)]'
              }`}
            >
              {tier.badge && (
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#C9A84C] text-[#050404] font-bold uppercase tracking-wider">
                    {tier.badge}
                  </span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-display font-bold text-[#f5f3f0]">
                    {tier.name}
                  </h3>
                  <p className="text-xs font-mono text-[#8a6e2a] mt-0.5">
                    {tier.tagline}
                  </p>
                </div>

                <div className="pt-2 pb-1 border-b border-[rgba(201,168,76,0.15)]">
                  {isFree ? (
                    <div className="text-3xl font-display font-bold text-[#f5f3f0]">
                      ₦0 <span className="text-xs font-mono text-[#8a6e2a]">/ permanent floor</span>
                    </div>
                  ) : (
                    <div className="text-3xl font-display font-bold text-[#f5f3f0]">
                      {currency === 'NGN' ? `₦${tier.price_ngn.toLocaleString()}` : `$${tier.price_usd}`}
                      <span className="text-xs font-mono text-[#8a6e2a] ml-1">
                        /{tier.period}
                      </span>
                    </div>
                  )}
                </div>

                <ul className="space-y-2.5 text-xs text-[#c4c0bb] pt-2">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[#C9A84C] shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-[rgba(201,168,76,0.15)]">
                <Button
                  variant={isHighlight ? 'primary' : 'outline'}
                  size="md"
                  className="w-full justify-center"
                  disabled={loadingTier === tier.id}
                  onClick={() => handleSelectPlan(tier)}
                >
                  {loadingTier === tier.id ? (
                    'Connecting Paystack...'
                  ) : (
                    <>
                      <span>{tier.cta}</span>
                      {!isFree && <ArrowRight className="w-3.5 h-3.5 ml-1.5" />}
                    </>
                  )}
                </Button>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
