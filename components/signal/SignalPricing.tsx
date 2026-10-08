'use client';
import React, { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';
import { StudioAudio } from '@/lib/watermark';

const TIERS = [
  {
    id: 'free',
    name: 'Free',
    price_ngn: 0,
    price_usd: 0,
    signals: '10 signals / day',
    features: ['10 signals/day', '1 platform (HN)', 'Manual content generation', 'Community support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price_ngn: 25000,
    price_usd: 29,
    signals: '100 signals / day',
    featured: true,
    features: ['100 signals/day', 'All 5 platforms (HN, GH, Reddit, X, Threads)', 'Auto content drafting from commits', 'Funnel analytics & attribution', 'Priority webhook alerts'],
  },
  {
    id: 'business',
    name: 'Business',
    price_ngn: 75000,
    price_usd: 89,
    signals: '500 signals / day',
    features: ['500 signals/day', '5 team seats', 'REST API & Webhooks', 'Custom intent model calibration', 'Priority support line'],
  },
  {
    id: 'agency',
    name: 'Agency',
    price_ngn: 250000,
    price_usd: 299,
    signals: 'Unlimited signals',
    features: ['Unlimited signals', '20 team seats', 'White label reports', 'Dedicated account architect', 'Direct WhatsApp dispatch'],
  },
];

export function SignalPricing({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [processingTier, setProcessingTier] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleChoose = async (tier: typeof TIERS[0]) => {
    StudioAudio.playClick();
    if (tier.id === 'free') {
      showToast('Switched to Free Radar tier', 'success');
      if (onNavigate) onNavigate('/signal/radar');
      return;
    }

    setProcessingTier(tier.id);
    try {
      const res = await fetch('/api/signal/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planTier: tier.id,
          currency,
          email: 'architect@jadai.dev',
        }),
      });
      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        StudioAudio.playSuccessArpeggio();
        showToast(`Signal ${tier.name} activated!`, 'success');
        if (onNavigate) onNavigate('/signal/radar');
      }
    } catch {
      showToast(`Selected ${tier.name} tier`, 'info');
      if (onNavigate) onNavigate('/signal/radar');
    } finally {
      setProcessingTier(null);
    }
  };

  return (
    <section className="py-20 px-6 max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-3">
        <h2 className="font-mono text-3xl sm:text-4xl text-white font-bold tracking-tight">
          Pricing that respects builders.
        </h2>
        <p className="text-[#8a6e2a] font-mono text-sm max-w-lg mx-auto">
          4x cheaper than enterprise scrapers. Pay in Naira or USD via Paystack.
        </p>

        {/* Currency Switcher */}
        <div className="inline-flex items-center p-1 rounded-full bg-[#0a0908] border border-[rgba(201,168,76,0.3)] text-xs font-mono">
          <button
            onClick={() => setCurrency('NGN')}
            className={`px-4 py-1.5 rounded-full transition-colors ${
              currency === 'NGN' ? 'bg-[#C9A84C] text-[#050404] font-bold' : 'text-[#8a6e2a]'
            }`}
          >
            NGN (₦)
          </button>
          <button
            onClick={() => setCurrency('USD')}
            className={`px-4 py-1.5 rounded-full transition-colors ${
              currency === 'USD' ? 'bg-[#C9A84C] text-[#050404] font-bold' : 'text-[#8a6e2a]'
            }`}
          >
            USD ($)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`p-6 rounded-2xl bg-[#0a0908] border flex flex-col justify-between transition-all duration-200 ${
              tier.featured
                ? 'border-[#C9A84C] shadow-[0_0_30px_rgba(201,168,76,0.18)] scale-[1.02]'
                : 'border-[rgba(201,168,76,0.2)] hover:border-[rgba(201,168,76,0.4)]'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-lg font-bold text-[#f5f3f0]">
                  {tier.name}
                </h3>
                {tier.featured && (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[rgba(201,168,76,0.2)] text-[#e8c96a] border border-[#C9A84C]">
                    Popular
                  </span>
                )}
              </div>

              <div>
                <span className="text-white text-3xl font-mono font-bold">
                  {currency === 'NGN'
                    ? `₦${tier.price_ngn.toLocaleString()}`
                    : `$${tier.price_usd}`}
                </span>
                <span className="text-[#8a6e2a] text-xs font-mono ml-2">/ month</span>
              </div>

              <span className="text-xs font-mono text-[#C9A84C] block">
                {tier.signals}
              </span>

              <ul className="space-y-2 pt-2 border-t border-[rgba(201,168,76,0.15)] text-xs text-[#c4c0bb]">
                {tier.features.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[#C9A84C] shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleChoose(tier)}
              disabled={processingTier === tier.id}
              className={`mt-6 w-full py-3 rounded-full font-mono text-xs tracking-widest font-bold transition-all cursor-pointer ${
                tier.featured
                  ? 'bg-[#C9A84C] text-[#050404] hover:bg-[#e8c96a] shadow-md'
                  : 'bg-[rgba(201,168,76,0.1)] text-[#e8c96a] hover:bg-[#C9A84C] hover:text-[#050404]'
              }`}
            >
              {processingTier === tier.id ? 'CONNECTING...' : `CHOOSE ${tier.name.toUpperCase()}`}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
