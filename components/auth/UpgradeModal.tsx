'use client';

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { StudioAudio } from '../../lib/watermark';
import { useToast } from '../providers/ToastProvider';
import { useCurrency } from '../providers/CurrencyProvider';
import { Sparkles, ArrowRight, ShieldCheck, Check, Loader2, CreditCard } from 'lucide-react';
import { getActiveUser } from '../../lib/supabase/gates';

export interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (path: string) => void;
  sourceTool?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  sourceTool,
}) => {
  const { showToast } = useToast();
  const { formatDual, currency } = useCurrency();
  const [loadingPlan, setLoadingPlan] = useState<'playground' | 'signal' | null>(null);

  const playgroundPrice = formatDual(9, 8000);
  const signalPrice = formatDual(19, 15000);

  const handleCheckout = async (plan: 'playground' | 'signal') => {
    setLoadingPlan(plan);
    StudioAudio.playClick();

    try {
      const user = await getActiveUser();
      const userEmail = user?.email || 'member@jadai.dev';

      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          email: userEmail,
          userId: user?.id,
          currency,
        }),
      });

      const data = await res.json();
      if (data.success && data.authorization_url) {
        showToast('Connecting to Global Payment Gateway...', 'info');
        window.location.href = data.authorization_url;
      } else {
        showToast(data.error || 'Checkout initialization failed', 'error');
        setLoadingPlan(null);
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to initialize checkout', 'error');
      setLoadingPlan(null);
    }
  };

  const handleBrowseTemplates = () => {
    StudioAudio.playClick();
    onClose();
    if (onNavigate) {
      onNavigate('/marketplace');
    } else {
      window.location.href = '/marketplace';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Access Expansion">
      <div className="space-y-6 select-none text-[#f5f3f0] py-2">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.3)] flex items-center justify-center text-[#e8c96a]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="font-display text-2xl font-bold tracking-wide text-[#f5f3f0]">
            Unlimited Creative Access
          </h2>
          <p className="text-sm font-mono text-[#c4c0bb]">
            Choose a plan to continue building without daily caps.
          </p>
        </div>

        {/* Pricing Options */}
        <div className="space-y-3">
          {/* Option 1: Playground */}
          <button
            type="button"
            disabled={loadingPlan !== null}
            onClick={() => handleCheckout('playground')}
            className="w-full p-4 rounded-2xl bg-[#0a0908] hover:bg-[#111010] border border-[rgba(201,168,76,0.25)] hover:border-[#C9A84C] transition-all flex items-center justify-between group cursor-pointer text-left disabled:opacity-60"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base text-[#f5f3f0] group-hover:text-[#e8c96a]">
                  Playground — {playgroundPrice.main}/mo
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[rgba(201,168,76,0.15)] text-[#C9A84C] border border-[rgba(201,168,76,0.2)]">
                  Unlimited
                </span>
              </div>
              <p className="text-xs font-mono text-[#8a857e]">
                ≈ {playgroundPrice.alt} • Full access to FORGE, ORACLE, MIRAGE, and SENTINEL.
              </p>
            </div>
            <div className="pl-3">
              {loadingPlan === 'playground' ? (
                <Loader2 className="w-5 h-5 text-[#C9A84C] animate-spin" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[rgba(201,168,76,0.15)] group-hover:bg-[#C9A84C] text-[#C9A84C] group-hover:text-[#050404] flex items-center justify-center transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          </button>

          {/* Option 2: Signal */}
          <button
            type="button"
            disabled={loadingPlan !== null}
            onClick={() => handleCheckout('signal')}
            className="w-full p-4 rounded-2xl bg-[#0a0908] hover:bg-[#111010] border border-[rgba(201,168,76,0.25)] hover:border-[#C9A84C] transition-all flex items-center justify-between group cursor-pointer text-left disabled:opacity-60"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base text-[#f5f3f0] group-hover:text-[#e8c96a]">
                  Signal — {signalPrice.main}/mo
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[rgba(201,168,76,0.15)] text-[#e8c96a] border border-[rgba(201,168,76,0.3)]">
                  Pro Suite
                </span>
              </div>
              <p className="text-xs font-mono text-[#8a857e]">
                ≈ {signalPrice.alt} • Includes Playground + 24/7 Automated Signal Radar telemetry.
              </p>
            </div>
            <div className="pl-3">
              {loadingPlan === 'signal' ? (
                <Loader2 className="w-5 h-5 text-[#C9A84C] animate-spin" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[rgba(201,168,76,0.15)] group-hover:bg-[#C9A84C] text-[#C9A84C] group-hover:text-[#050404] flex items-center justify-center transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          </button>
        </div>

        {/* International Payment Trust Strip */}
        <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-400 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[#C9A84C] shrink-0" />
          <span>Global checkout: Accepts Visa, Mastercard, Apple Pay, Verve & Bank Transfer in USD and NGN.</span>
        </div>

        {/* Footer links: Browse templates & Maybe later */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <button
            type="button"
            onClick={handleBrowseTemplates}
            className="text-[#C9A84C] hover:text-[#e8c96a] flex items-center gap-1 transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            <span>Browse templates →</span>
            <span className="text-[10px] text-[#8a857e]">(one-time purchases, no subscription needed)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="text-[#8a857e] hover:text-[#c4c0bb] transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            Maybe later
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default UpgradeModal;
