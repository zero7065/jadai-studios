'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import EdgeGlow from '@/components/ui/EdgeGlow';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import { getLocalDrafts } from '@/lib/data/draftWorkspace';
import { PLAYGROUND_TOOLS } from '@/lib/data/playgroundTools';
import { StudioAudio } from '@/lib/watermark';
import { useToast } from '@/components/providers/ToastProvider';
import {
  Crown,
  Sparkles,
  Gift,
  Award,
  Zap,
  CheckCircle2,
  FolderGit2,
  Users,
  ShieldCheck,
  TrendingUp,
  Tag,
  ArrowRight,
} from 'lucide-react';

export default function PremiumProfilePage({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const { showToast } = useToast();
  const [tier, setTier] = useState<string>('prime');
  const [consecutivePayments, setConsecutivePayments] = useState<number>(3);
  const [activityScore, setActivityScore] = useState<number>(88);
  const [discountPercent, setDiscountPercent] = useState<number>(25);
  const [discountCode, setDiscountCode] = useState<string>('JADAI-CONV-25');
  const [surpriseBoxOpened, setSurpriseBoxOpened] = useState(false);
  const [boxReward, setBoxReward] = useState<string | null>(null);
  const [teamMemberOfferAccepted, setTeamMemberOfferAccepted] = useState(false);
  const [teamMemberOfferDeclined, setTeamMemberOfferDeclined] = useState(false);

  const drafts = getLocalDrafts();

  const [userEmail, setUserEmail] = useState('architect@jadai.studio');
  const [userName, setUserName] = useState('Studio Member');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSession = localStorage.getItem('jadai_user_session');
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          if (parsed.email) setUserEmail(parsed.email);
          if (parsed.name) setUserName(parsed.name);
          if (parsed.tier) setTier(parsed.tier);
        } catch {}
      }

      const savedTier = localStorage.getItem('jadai-user-tier');
      if (savedTier) setTier(savedTier);

      const savedPayments = localStorage.getItem('jadai-consecutive-payments');
      if (savedPayments) {
        const count = parseInt(savedPayments, 10);
        setConsecutivePayments(Math.max(count, 3));
      }
    }
  }, []);

  const handleOpenSurpriseBox = () => {
    StudioAudio.playSuccessArpeggio();
    setSurpriseBoxOpened(true);
    const rewards = [
      '30% Architectural Lifetime Discount (Code: SOVEREIGN-30)',
      'Direct 30-Min Strategy Dispatch with Founder Jehu Nanpan',
      'Exclusive Access to Unreleased Book of Lies Act VIII Drafts',
      'Free Production Template License for "Vendor OS"',
    ];
    const picked = rewards[Math.floor(Math.random() * rewards.length)];
    setBoxReward(picked);
    showToast('Surprise reward unlocked!', 'success');
  };

  const handleAcceptTeamOffer = () => {
    StudioAudio.playSuccessArpeggio();
    setTeamMemberOfferAccepted(true);
    showToast('You accepted the Jadai Team Member honorary mantle!', 'success');
  };

  const handleDeclineTeamOffer = () => {
    StudioAudio.playClick();
    setTeamMemberOfferDeclined(true);
    showToast('Offer declined. Your independent architect status remains intact.', 'info');
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

        {/* Reward Tag & Discount Numbers (Section 13) */}
        <div className="relative z-10 p-4 rounded-2xl bg-[#050404] border border-[rgba(201,168,76,0.25)] space-y-1.5 md:text-right">
          <div className="flex md:justify-end items-center gap-1.5 text-xs font-mono text-[#C9A84C] font-bold">
            <Tag className="w-3.5 h-3.5" />
            <span>Reward Tag: Tier-Loyalty Milestone</span>
          </div>
          <p className="text-lg font-mono font-bold text-[#f5f3f0]">
            {discountPercent}% Dedicated Discount
          </p>
          <span className="text-[11px] font-mono text-[#8a6e2a] block">
            Unique Code: <span className="text-[#e8c96a] font-bold">{discountCode}</span>
          </span>
        </div>
      </div>

      {/* SECTION 13 — SURPRISE SHAKING BOX ANIMATION */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.3)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-[#C9A84C]">
            <Gift className="w-4 h-4" />
            <span className="font-bold uppercase tracking-wider">
              Consecutive Payment Milestone Reward
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#8a6e2a]">
            {consecutivePayments}/3 payments logged
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
                title="Click to open surprise box!"
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
                  ? 'Surprise Vault Box Waiting to be Unsealed'
                  : 'Member Reward Disclosed!'}
              </h4>
              <p className="text-xs font-mono text-[#8a6e2a]">
                {!surpriseBoxOpened
                  ? 'Click the shaking box to reveal your random premium perk.'
                  : boxReward}
              </p>
            </div>
          </div>

          {!surpriseBoxOpened && (
            <button
              onClick={handleOpenSurpriseBox}
              className="px-5 py-2.5 rounded-xl bg-[#C9A84C] text-[#050404] font-mono text-xs font-bold hover:bg-[#e8c96a] transition-all shadow-md cursor-pointer shrink-0"
            >
              Unseal Reward
            </button>
          )}
        </div>
      </div>

      {/* LEADERBOARD & TEAM MEMBER OFFER (Section 13) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Leaderboard */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0a0908] border border-[rgba(201,168,76,0.25)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[#C9A84C] font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>Architect Activity Leaderboard (Q3)</span>
            </div>
            <span className="text-[10px] font-mono text-[#8a6e2a]">3-Month Cohort</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="p-3 rounded-xl bg-[rgba(201,168,76,0.12)] border border-[#C9A84C] flex items-center justify-between text-[#f5f3f0]">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#C9A84C] text-[#050404] flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <div>
                  <span className="font-bold block">You (architect@jadai.studio)</span>
                  <span className="text-[10px] text-[#8a6e2a]">Top Architect Rank</span>
                </div>
              </div>
              <span className="text-[#e8c96a] font-bold">Score: 96.4 pts</span>
            </div>

            <div className="p-3 rounded-xl bg-[#050404] border border-neutral-800 flex items-center justify-between text-neutral-400">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <span>kalu.engineer@orbit.ng</span>
              </div>
              <span>91.2 pts</span>
            </div>

            <div className="p-3 rounded-xl bg-[#050404] border border-neutral-800 flex items-center justify-between text-neutral-400">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <span>amara.craft@jos.io</span>
              </div>
              <span>88.0 pts</span>
            </div>
          </div>
        </div>

        {/* Team Member Offer Card */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0a0908] border border-[rgba(201,168,76,0.3)] flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#C9A84C] font-bold">
              <Award className="w-4 h-4" />
              <span>Jadai Team Member Offer</span>
            </div>
            <h4 className="font-display font-bold text-lg text-[#f5f3f0]">
              Honorary Studio Fellowship
            </h4>
            <p className="text-xs text-[#c4c0bb] font-mono leading-relaxed">
              As the top-ranked user across 3 consecutive months, you are formally offered the{' '}
              <span className="text-[#e8c96a] font-bold">"Jadai Team Member"</span> mantle.
              Direct review rights on incoming templates and founder sessions.
            </p>
          </div>

          {!teamMemberOfferAccepted && !teamMemberOfferDeclined ? (
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleDeclineTeamOffer}
                className="w-1/2 py-2.5 rounded-xl border border-[rgba(201,168,76,0.2)] text-[#8a6e2a] hover:text-white font-mono text-xs transition-colors cursor-pointer"
              >
                Decline
              </button>
              <button
                onClick={handleAcceptTeamOffer}
                className="w-1/2 py-2.5 rounded-xl bg-[#C9A84C] text-[#050404] hover:bg-[#e8c96a] font-mono text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Accept Offer
              </button>
            </div>
          ) : teamMemberOfferAccepted ? (
            <div className="p-3 rounded-xl bg-[rgba(201,168,76,0.15)] border border-[#C9A84C] text-xs font-mono text-[#e8c96a] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Mantle Accepted. Verified in studio council ledger.</span>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-mono text-neutral-400">
              Offer politely declined. You remain an independent sovereign architect.
            </div>
          )}
        </div>
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
            View All ({drafts.length}) →
          </a>
        </div>

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
      </div>
    </div>
  );
}
