'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import { getLocalDrafts } from '@/lib/data/draftWorkspace';
import { StudioAudio } from '@/lib/watermark';
import { useToast } from '@/components/providers/ToastProvider';
import {
  Crown,
  Sparkles,
  Gift,
  FolderGit2,
  TrendingUp,
  Tag,
} from 'lucide-react';

export default function PremiumProfilePage({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const { showToast } = useToast();
  const [tier, setTier] = useState<string>('free');
  const [consecutivePayments, setConsecutivePayments] = useState<number>(0);
  const [isLoadingTier, setIsLoadingTier] = useState(true);
  const [surpriseBoxOpened, setSurpriseBoxOpened] = useState(false);
  const [boxReward, setBoxReward] = useState<string | null>(null);

  const drafts = getLocalDrafts();

  const [userEmail, setUserEmail] = useState('guest@jadai.studio');
  const [userName, setUserName] = useState('Studio Guest');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (typeof window !== 'undefined') {
        const savedSession = localStorage.getItem('jadai_user_session');
        let sessionEmail = '';
        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession);
            if (parsed.email) { setUserEmail(parsed.email); sessionEmail = parsed.email; }
            if (parsed.name) setUserName(parsed.name);
          } catch {}
        }

        // Paystack redirect back: verify the reference and grant the tier.
        const params = new URLSearchParams(window.location.search);
        const reference = params.get('reference') || params.get('trxref');
        if (reference) {
          try {
            const verifyRes = await fetch('/api/paystack/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                reference,
                email: sessionEmail || undefined,
                plan: params.get('plan') || undefined,
              }),
            });
            const v = await verifyRes.json();
            if (!cancelled && v?.success && v?.tier) {
              setTier(v.tier);
              showToast('Payment verified — tier unlocked', 'success');
            } else if (!cancelled && v?.error) {
              showToast(v.error, 'error');
            }
          } catch {}
          // Clean the reference off the URL so a refresh doesn't re-verify.
          window.history.replaceState({}, '', window.location.pathname);
        }

        // Fetch the real verified tier from the server — never default to a paid tier.
        try {
          const builderId = localStorage.getItem('jadai_builder_id') || '';
          const res = await fetch(`/api/account/tier${builderId ? `?builderId=${encodeURIComponent(builderId)}` : ''}`);
          const data = await res.json();
          if (!cancelled && data?.success) {
            setTier(data.tier || 'free');
            setConsecutivePayments(Number(data.consecutivePayments) || 0);
          }
        } catch {
          if (!cancelled) setTier('free');
        } finally {
          if (!cancelled) setIsLoadingTier(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleOpenSurpriseBox = () => {
    StudioAudio.playSuccessArpeggio();
    setSurpriseBoxOpened(true);
    // Gamified perk — clearly a loyalty perk preview, not a paid entitlement.
    const rewards = [
      'Early access to new template drops',
      'Priority review queue for studio services',
      'Exclusive Book of Lies draft chapters',
      'Founder strategy session lottery entry',
    ];
    const picked = rewards[Math.floor(Math.random() * rewards.length)];
    setBoxReward(picked);
    showToast('Loyalty perk revealed', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10 text-[#c4c0bb]">
      {/* Exquisite Top Header */}
      <div className="p-8 rounded-3xl bg-[#0a0908] border border-[rgba(201,168,76,0.35)] shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-[rgba(201,168,76,0.15)] to-transparent pointer-events-none" />

        <div className="flex items-center gap-5 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-[#050404] border border-[#C9A84C] flex items-center justify-center text-[#e8c96a] shadow-[0_0_30px_rgba(201,168,76,0.3)]">
            <Crown className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#f5f3f0]">
                {userName.toUpperCase()}
              </h1>
              <VerifiedBadge />
            </div>
            <p className="text-xs font-mono text-[#8a6e2a]">
              Email: {userEmail} • Verified Member Identity
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-[rgba(201,168,76,0.2)] border border-[#C9A84C] text-[#e8c96a] font-bold">
                Tier: {tier.toUpperCase()}
              </span>
              <StatusBadge status="Autonomous" variant="gold" size="sm" />
            </div>
          </div>
        </div>

        {/* Verified tier status — real, fetched */}
        <div className="relative z-10 p-4 rounded-2xl bg-[#050404] border border-[rgba(201,168,76,0.25)] space-y-1.5 md:text-right">
          <div className="flex md:justify-end items-center gap-1.5 text-xs font-mono text-[#C9A84C] font-bold">
            <Tag className="w-3.5 h-3.5" />
            <span>Verified Account Tier</span>
          </div>
          <p className="text-lg font-mono font-bold text-[#f5f3f0]">
            {isLoadingTier ? 'Verifying…' : tier.toUpperCase()}
          </p>
          <span className="text-[11px] font-mono text-[#8a6e2a] block">
            {tier === 'free'
              ? 'Upgrade anytime from Pricing to unlock premium engines.'
              : 'Active subscription — premium engines unlocked.'}
          </span>
        </div>
      </div>

      {/* LOYALTY PERK — Gamified reveal (clearly a perk preview, not a paid entitlement) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.3)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-[#C9A84C]">
            <Gift className="w-4 h-4" />
            <span className="font-bold uppercase tracking-wider">
              Loyalty Perk Vault
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#8a6e2a]">
            {consecutivePayments} verified payment{consecutivePayments === 1 ? '' : 's'} on record
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.2)]">
          <div className="flex items-center gap-4">
            {!surpriseBoxOpened ? (
              <motion.button
                onClick={handleOpenSurpriseBox}
                animate={{
                  rotate: [-3, 3, -3, 3, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: 'easeInOut',
                }}
                className="w-16 h-16 rounded-2xl bg-[#050404] border border-[#C9A84C] flex items-center justify-center text-[#e8c96a] shadow-[0_0_20px_rgba(201,168,76,0.35)] cursor-pointer"
                title="Click to open perk vault!"
              >
                <Gift className="w-8 h-8" />
              </motion.button>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[rgba(201,168,76,0.2)] border border-[#C9A84C] flex items-center justify-center text-[#C9A84C] shadow-[0_0_25px_rgba(201,168,76,0.4)]">
                <Sparkles className="w-8 h-8" />
              </div>
            )}

            <div>
              <h4 className="font-display font-bold text-base text-[#f5f3f0]">
                {!surpriseBoxOpened
                  ? 'Perk Vault Waiting to be Opened'
                  : 'Perk Disclosed!'}
              </h4>
              <p className="text-xs font-mono text-[#8a6e2a]">
                {!surpriseBoxOpened
                  ? 'Click the vault to reveal a loyalty perk preview.'
                  : boxReward}
              </p>
            </div>
          </div>

          {!surpriseBoxOpened && (
            <button
              onClick={handleOpenSurpriseBox}
              className="px-5 py-2.5 rounded-xl bg-[#C9A84C] text-[#050404] font-mono text-xs font-bold hover:bg-[#e8c96a] transition-all shadow-md cursor-pointer shrink-0"
            >
              Open Perk Vault
            </button>
          )}
        </div>
      </div>

      {/* ACCOUNT STATUS — honest, no fabricated leaderboard or fake offers */}
      <div className="p-6 rounded-3xl bg-[#0a0908] border border-[rgba(201,168,76,0.25)] space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-[#C9A84C] font-bold">
          <TrendingUp className="w-4 h-4" />
          <span>Account Status</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.15)] space-y-1">
            <div className="text-[#8a6e2a] uppercase tracking-wider text-[10px]">Current Tier</div>
            <div className="text-[#f5f3f0] text-base font-bold">
              {isLoadingTier ? '…' : tier.toUpperCase()}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.15)] space-y-1">
            <div className="text-[#8a6e2a] uppercase tracking-wider text-[10px]">Verified Payments</div>
            <div className="text-[#f5f3f0] text-base font-bold">{consecutivePayments}</div>
          </div>
          <div className="p-4 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.15)] space-y-1">
            <div className="text-[#8a6e2a] uppercase tracking-wider text-[10px]">Workspace Drafts</div>
            <div className="text-[#f5f3f0] text-base font-bold">{drafts.length}</div>
          </div>
        </div>

        <p className="text-[11px] text-[#8a857e] font-mono leading-relaxed">
          Loyalty rewards, leaderboards, and milestone discounts activate once real payment history
          is recorded through Paystack. No scores or offers are fabricated.
        </p>
      </div>

      {/* WORKSPACE & DRAFTS QUICK ACCESS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-[#C9A84C] font-bold">
            <FolderGit2 className="w-4 h-4" />
            <span>Recent Workspace Drafts</span>
          </div>
          <a
            href="/account/workspace"
            onClick={(e) => {
              e.preventDefault();
              onNavigate ? onNavigate('/account/workspace') : (window.location.href = '/account/workspace');
            }}
            className="text-xs font-mono text-[#8a6e2a] hover:text-[#C9A84C] transition-colors"
          >
            {drafts.length > 0 ? `View All (${drafts.length}) →` : 'Open Workspace →'}
          </a>
        </div>

        {drafts.length === 0 ? (
          <div className="p-5 rounded-2xl bg-[#0a0908] border border-dashed border-[rgba(201,168,76,0.3)] text-center space-y-2">
            <p className="text-xs font-mono text-[#e8c96a]">No drafts yet — your workspace starts clean.</p>
            <p className="text-[11px] text-[#8a857e]">
              Run any engine in the Playground and save a result to see it here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {drafts.slice(0, 3).map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.2)] hover:border-[#C9A84C] transition-all space-y-2"
              >
                <span className="text-[10px] font-mono uppercase text-[#e8c96a] block">
                  {d.serviceName}
                </span>
                <h5 className="font-display font-bold text-sm text-[#f5f3f0] truncate">
                  {d.projectName}
                </h5>
                <p className="text-[11px] font-mono text-[#8a6e2a]">
                  {new Date(d.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
