'use client';

import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { StudioAudio } from '../../lib/watermark';
import { useToast } from '../providers/ToastProvider';
import { SIGNAL_PLANS, SignalPlanTier } from '../../lib/signal/types';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Crown,
  ChevronDown,
} from 'lucide-react';

interface PricingViewProps {
  onNavigate?: (path: string) => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('USD');
  const [currentTier, setCurrentTier] = useState<SignalPlanTier>('free');
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [showAgency, setShowAgency] = useState(false);

  useEffect(() => {
    // Paystack callback lands here with a verified status from the server.
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const tier = params.get('tier');
    if (status === 'success' && tier) {
      showToast(`Payment confirmed — Jadai Signal ${SIGNAL_PLANS[tier as SignalPlanTier]?.name || tier} is active.`, 'success', 'Tier Active');
      setCurrentTier(tier as SignalPlanTier);
      window.history.replaceState({}, '', window.location.pathname);
    } else if (status && status !== 'success') {
      const messages: Record<string, string> = {
        failed: 'Payment not confirmed with Paystack — plan unchanged.',
        amount_mismatch: 'Payment amount did not match the plan — plan unchanged.',
        unconfigured: 'Paystack is not configured on this deployment — plan unchanged.',
        missing_reference: 'Checkout returned without a payment reference — plan unchanged.',
        error: 'Could not verify payment with Paystack — plan unchanged.',
      };
      showToast(messages[status] || 'Checkout did not complete — plan unchanged.', 'error', 'Payment Not Applied');
      window.history.replaceState({}, '', window.location.pathname);
    }

    fetch('/api/signal/settings')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.settings?.plan) {
          setCurrentTier(res.settings.plan);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const handleSubscribe = async (tierKey: SignalPlanTier) => {
    StudioAudio.playClick();
    setLoadingTier(tierKey);

    try {
      const res = await fetch('/api/signal/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planTier: tierKey,
          currency,
          email: 'architect@jadai.dev',
        }),
      });

      const data = await res.json();

      if (!data.success && !data.authorization_url) {
        showToast(data.error || 'Subscription request failed — plan unchanged.', 'error', 'Not Activated');
        return;
      }

      if (data.authorization_url && !String(data.authorization_url).includes('example.com')) {
        showToast('Redirecting to Paystack — your plan activates after payment confirms.', 'info', 'Secure Checkout');
        window.location.href = data.authorization_url;
        return;
      }

      if (data.plan === 'free' || tierKey === 'free') {
        setCurrentTier('free');
        StudioAudio.playSuccess();
        showToast(`Switched to Jadai Signal ${SIGNAL_PLANS.free.name}.`, 'success', 'Tier Active');
        return;
      }

      showToast('Checkout could not start (no payment URL returned) — plan unchanged.', 'error', 'Not Activated');
    } catch {
      showToast('Signal service unreachable — plan unchanged.', 'error', 'Not Activated');
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      {/* -----------------------------------------------------------------
          PRICING HEADER
         ----------------------------------------------------------------- */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Independent Signal Plans</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold font-display text-white">
          Developer-First Pricing
        </h2>
        <p className="text-sm font-mono text-zinc-400">
          Separate from Studio tiers. Cancel anytime. Full distribution loop starting at $0.
        </p>

        {/* Currency Switcher */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => {
              StudioAudio.playClick();
              setCurrency('USD');
            }}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
              currency === 'USD'
                ? 'bg-amber-500 text-black font-bold'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
            }`}
          >
            USD ($)
          </button>
          <button
            onClick={() => {
              StudioAudio.playClick();
              setCurrency('NGN');
            }}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
              currency === 'NGN'
                ? 'bg-amber-500 text-black font-bold'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
            }`}
          >
            NGN (₦)
          </button>
        </div>
      </div>

      {/* -----------------------------------------------------------------
          3 PRIMARY CARDS: FREE, PRO, BUSINESS
         ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['free', 'pro', 'business'] as SignalPlanTier[]).map((tierKey) => {
          const plan = SIGNAL_PLANS[tierKey];
          const isPro = tierKey === 'pro';
          const isCurrent = currentTier === tierKey;

          return (
            <div
              key={plan.id}
              className={`p-6 sm:p-8 rounded-3xl border flex flex-col justify-between transition-all relative ${
                isPro
                  ? 'bg-zinc-950 border-amber-500/60 shadow-2xl shadow-amber-500/10'
                  : 'bg-zinc-950/60 border-zinc-800'
              }`}
            >
              {isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-mono font-bold text-[10px] uppercase tracking-wider">
                  Recommended For Solo Founders
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold font-display text-white">{plan.name}</h3>
                  <span className="text-xs font-mono text-zinc-400">{plan.signalsPerDay}/day</span>
                </div>

                <div className="text-3xl font-display font-black text-white">
                  {currency === 'USD' ? plan.priceUsdFormatted : plan.priceNgnFormatted}
                </div>

                <ul className="space-y-2.5 pt-4 border-t border-zinc-800/80 text-xs font-mono text-zinc-300">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Button
                  variant={isPro ? 'primary' : 'outline'}
                  size="md"
                  disabled={loadingTier === tierKey || isCurrent}
                  onClick={() => handleSubscribe(tierKey)}
                  className="w-full gap-2"
                >
                  <span>
                    {isCurrent
                      ? 'Current Plan'
                      : loadingTier === tierKey
                      ? 'Activating...'
                      : `Select ${plan.name}`}
                  </span>
                  {!isCurrent && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* -----------------------------------------------------------------
          AGENCY TIER ACCORDION
         ----------------------------------------------------------------- */}
      <div className="text-center pt-2">
        <button
          onClick={() => setShowAgency(!showAgency)}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 hover:text-amber-300 cursor-pointer"
        >
          <span>{showAgency ? 'Hide Agency Tier' : 'Looking for Agency Tier with 20 Seats & White-Label?'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAgency ? 'rotate-180' : ''}`} />
        </button>

        {showAgency && (
          <div className="mt-6 max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-amber-500/40 text-left space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-lg">Agency Enterprise</h4>
                <p className="text-xs font-mono text-zinc-400">Unlimited signals • 20 client seats • White-label reports</p>
              </div>
              <div className="text-2xl font-bold font-display text-amber-400">
                {currency === 'USD' ? '$299 / mo' : '₦250,000 / mo'}
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              disabled={currentTier === 'agency'}
              onClick={() => handleSubscribe('agency')}
              className="w-full"
            >
              {currentTier === 'agency' ? 'Current Active Tier' : 'Upgrade to Agency Tier'}
            </Button>
          </div>
        )}
      </div>

      {/* -----------------------------------------------------------------
          STACK COMPARISON TABLE
         ----------------------------------------------------------------- */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/80 border border-zinc-800 space-y-6">
        <h3 className="text-lg font-bold font-display text-white">
          Why Jadai Signal vs Legacy Outbound
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="py-3 px-4">Feature</th>
                <th className="py-3 px-4">Clay</th>
                <th className="py-3 px-4">Apollo</th>
                <th className="py-3 px-4 text-amber-400">Jadai Signal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-zinc-300">
              <tr>
                <td className="py-3 px-4 font-semibold">Monthly Price</td>
                <td className="py-3 px-4 text-red-400">$185 - $800</td>
                <td className="py-3 px-4 text-red-400">$49 - $119</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">$19 / mo (₦15k)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">Target Audience</td>
                <td className="py-3 px-4">Enterprise SDRs</td>
                <td className="py-3 px-4">B2B Sales Teams</td>
                <td className="py-3 px-4 text-amber-400 font-bold">Solo Devs & Founders</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">LLM Intent Scoring</td>
                <td className="py-3 px-4">Custom setup needed</td>
                <td className="py-3 px-4">No</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">Built-in (0-100)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">Channels Monitored</td>
                <td className="py-3 px-4">LinkedIn, Web</td>
                <td className="py-3 px-4">Email, LinkedIn</td>
                <td className="py-3 px-4 text-amber-400 font-bold">HN, GitHub, Reddit, X, Threads</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">Build-in-Public Content</td>
                <td className="py-3 px-4">No</td>
                <td className="py-3 px-4">No</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">Automated from Git commits</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PricingView;
