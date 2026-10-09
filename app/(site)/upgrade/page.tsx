import React, { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import FAQSection from '@/components/ui/FAQSection';
import { BILLING_FAQ } from '@/lib/data/faqs';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/providers/ToastProvider';
import { StudioAudio } from '@/lib/watermark';
import { STARTUP_PAYSTACK_PLANS, PaystackTierPlan } from '@/lib/paystack';
import {
  Crown,
  CheckCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

// Canonical price book — same source as /pricing so both pages never disagree.
const TIER_ORDER = ['free', 'playground', 'studio_premium', 'signal_pro', 'signal_business'];
const TIER_CTA: Record<string, string> = {
  free: 'Current Plan',
  playground: 'Ascend to Playground',
  studio_premium: 'Claim Studio Premium',
  signal_pro: 'Activate Signal Pro',
  signal_business: 'Command Signal Business',
};
const TIER_TAGLINE: Record<string, string> = {
  free: 'Base access for exploratory engineers',
  playground: 'Unlimited AI creation engines',
  studio_premium: 'The complete unredacted canon',
  signal_pro: 'Algorithmic distribution OS',
  signal_business: 'High-volume radar intelligence',
};
const TIER_BADGE: Record<string, string | undefined> = {
  playground: 'Popular',
  studio_premium: 'Canon',
  signal_pro: 'Growth',
  signal_business: 'Partner',
};

type Tier = PaystackTierPlan;

const TIERS: Tier[] = TIER_ORDER.map((id) => STARTUP_PAYSTACK_PLANS[id]).filter(Boolean);

import DefensiveFallback from '@/components/ui/DefensiveFallback';

export default function UpgradePage() {
  const [hasError, setHasError] = useState(false);
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const { showToast } = useToast();

  if (hasError) return <DefensiveFallback />;

  const handleSelectPlan = async (tier: Tier) => {
    if (tier.id === 'free') {
      showToast('You are currently on the Free Floor.', 'info');
      return;
    }

    setLoadingTier(tier.id);
    StudioAudio.playClick();

    const email = prompt('Enter your email to receive your license and receipt:') || '';
    if (!email || !email.includes('@')) {
      setLoadingTier(null);
      showToast('Valid email required for license issuance.', 'error');
      return;
    }

    showToast(
      `Initiating ${tier.name} (${currency === 'NGN' ? tier.priceNgnFormatted : tier.priceUsdFormatted}). Connecting Paystack...`,
      'info',
      'Billing Gateway'
    );

    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: tier.id,
          email,
          currency,
        }),
      });

      const data = await res.json();
      if (data.success && data.authorization_url) {
        StudioAudio.playSuccessArpeggio();
        if (data.admin_bypass) {
          showToast('Master Admin bypass recognized: VIP All-Access Unlocked!', 'success');
          window.location.href = '/account/premium';
          return;
        }
        if (data.simulated) {
          showToast('Sandbox mode: redirecting to license activation...', 'info');
        }
        window.location.href = data.authorization_url;
      } else {
        throw new Error(data.error || 'Payment initialization failed');
      }
    } catch (err: any) {
      showToast(
        err.message || 'Payment system unreachable. Please try again in a moment.',
        'error',
        'Billing Gateway'
      );
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
          Free-until-first-pay. Unlock deeper AI memory, the full canon, and sovereign production tooling — cancel anytime.
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
          const isHighlight = tier.id === 'playground';
          const badge = TIER_BADGE[tier.id];

          return (
            <GlassCard
              key={tier.id}
              className={`p-6 sm:p-8 flex flex-col justify-between space-y-6 relative transition-all duration-300 hover:-translate-y-1 ${
                isHighlight
                  ? 'border-[#C9A84C] shadow-[0_0_30px_rgba(201,168,76,0.2)]'
                  : 'border-[rgba(201,168,76,0.2)]'
              }`}
            >
              {badge && (
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#C9A84C] text-[#050404] font-bold uppercase tracking-wider">
                    {badge}
                  </span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-display font-bold text-[#f5f3f0]">
                    {tier.name}
                  </h3>
                  <p className="text-xs font-mono text-[#8a6e2a] mt-0.5">
                    {TIER_TAGLINE[tier.id] || tier.description}
                  </p>
                </div>

                <div className="pt-2 pb-1 border-b border-[rgba(201,168,76,0.15)]">
                  <div className="text-3xl font-display font-bold text-[#f5f3f0]">
                    {isFree ? '₦0' : currency === 'NGN' ? `₦${(tier.amountKobo / 100).toLocaleString()}` : `$${(tier.amountUsdCents / 100).toLocaleString()}`}
                    <span className="text-xs font-mono text-[#8a6e2a] ml-1">
                      {isFree ? '/ forever' : '/ mo'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#c4c0bb] leading-relaxed">{tier.description}</p>

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
                      <span>{TIER_CTA[tier.id] || 'Select Plan'}</span>
                      {!isFree && <ArrowRight className="w-3.5 h-3.5 ml-1.5" />}
                    </>
                  )}
                </Button>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <p className="text-xs font-mono text-[#8a6e2a]">
          <Sparkles className="w-3 h-3 inline mr-1 text-[#C9A84C]" />
          All plans settle in ₦ via Paystack or $ via global cards. Cancel anytime from Account → Premium.
        </p>
        <p className="text-[11px] text-[#5a5651]">
          Subscriptions activate after payment confirmation. Full feature comparison lives on{' '}
          <a href="/pricing" className="text-[#C9A84C] hover:underline">
            /pricing
          </a>
          .
        </p>
      </div>

      <FAQSection
        items={BILLING_FAQ}
        title="Billing, Plans & Ownership"
        className="max-w-3xl mx-auto w-full pt-4"
      />
    </div>
  );
}
