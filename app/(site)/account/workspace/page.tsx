'use client';

import React, { useState, useEffect } from 'react';
import EdgeGlow from '@/components/ui/EdgeGlow';
import Button from '@/components/ui/Button';
import RotatableCard3D from '@/components/ui/RotatableCard3D';
import { getLocalDrafts, deleteLocalDraft, WorkspaceDraft } from '@/lib/data/draftWorkspace';
import { StudioAudio } from '@/lib/watermark';
import { useToast } from '@/components/providers/ToastProvider';
import {
  FolderGit2,
  Trash2,
  ArrowRight,
  Clock,
  Plus,
  Lock,
  Mail,
  User,
  Crown,
  Sparkles,
  Gift,
  CheckCircle2,
  RotateCw,
  FileCode,
  Eye,
  Activity,
  Layers,
  ShieldCheck,
  TrendingUp,
  Tag,
  LogOut,
} from 'lucide-react';

export default function WorkspacePage({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [userProfile, setUserProfile] = useState<{ email: string; tier: string; name: string } | null>(null);

  const [drafts, setDrafts] = useState<WorkspaceDraft[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [consecutivePayments, setConsecutivePayments] = useState(3);
  const [boxUnsealed, setBoxUnsealed] = useState(false);
  const [boxReward, setBoxReward] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    // Check saved session
    try {
      const session = localStorage.getItem('jadai_user_session');
      if (session) {
        const parsed = JSON.parse(session);
        setUserProfile(parsed);
        setIsAuthenticated(true);
      }
    } catch {
      // Non-fatal
    }
    setDrafts(getLocalDrafts());
  }, []);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim()) {
      showToast('Please provide your architect email', 'error');
      return;
    }

    StudioAudio.playClick();
    const profile = {
      email: authEmail.trim(),
      name: authEmail.split('@')[0],
      tier: 'prime',
    };

    localStorage.setItem('jadai_user_session', JSON.stringify(profile));
    setUserProfile(profile);
    setIsAuthenticated(true);
    StudioAudio.playSuccessArpeggio();
    showToast(`Welcome back, Architect ${profile.name}`, 'success', 'Session Established');
  };

  const handleLogout = () => {
    StudioAudio.playClick();
    localStorage.removeItem('jadai_user_session');
    setIsAuthenticated(false);
    setUserProfile(null);
    showToast('Signed out of Architect Workspace', 'info');
  };

  const handleDelete = (id: string, name: string) => {
    StudioAudio.playClick();
    deleteLocalDraft(id);
    setDrafts((prev) => prev.filter((d) => d.id !== id));
    showToast(`Draft "${name}" removed from workspace`, 'info');
  };

  const handleResume = (draft: WorkspaceDraft) => {
    StudioAudio.playClick();
    const targetPath = `/playground/${draft.serviceSlug}`;
    if (onNavigate) {
      onNavigate(targetPath);
    } else {
      window.location.href = targetPath;
    }
  };

  const handleUnsealBox = () => {
    StudioAudio.playSuccessArpeggio();
    setBoxUnsealed(true);
    const rewards = [
      '25% Continuous Loyalty Lifetime Discount (Code: SOVEREIGN-25)',
      'Unreleased Book of Lies Act IV Manuscript Excerpts',
      'Complimentary Production Starter License (Vendor OS)',
      '30-Min High-Altitude Architectural Dispatch Token',
    ];
    const picked = rewards[Math.floor(Math.random() * rewards.length)];
    setBoxReward(picked);
    showToast('Surprise Menu reward unsealed!', 'success');
  };

  const filteredDrafts =
    activeFilter === 'all'
      ? drafts
      : drafts.filter((d) => d.serviceSlug.toLowerCase().includes(activeFilter.toLowerCase()));

  // -------------------------------------------------------------------------
  // 1. AUTHENTICATION GATE (Required Login/Register Before Dashboard Access)
  // -------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-[#c4c0bb] space-y-6 select-none">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(201,168,76,0.12)] border border-[#C9A84C] flex items-center justify-center text-[#e8c96a] mx-auto shadow-[0_0_30px_rgba(201,168,76,0.3)]">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#f5f3f0]">
              Architect Identification Required
            </h1>
            <p className="text-xs font-mono text-[#8a6e2a]">
              Sign in or establish your sovereign identity to unlock your personal Bento workspace.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#0a0908] border border-[rgba(201,168,76,0.3)] shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-5">
          <form onSubmit={handleAuthSubmit} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-[10px] text-[#8a6e2a] uppercase mb-1">
                Architect Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a6e2a]" />
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="architect@domain.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] placeholder-[#8a6e2a] focus:outline-none focus:border-[#C9A84C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-[#8a6e2a] uppercase mb-1">
                Master Passphrase
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a6e2a]" />
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] placeholder-[#8a6e2a] focus:outline-none focus:border-[#C9A84C]"
                />
              </div>
            </div>

            <EdgeGlow intensity="subtle" color="gold" borderRadius="12px">
              <Button variant="primary" size="md" className="w-full" type="submit">
                <span>{isRegisterMode ? 'Establish Identity' : 'Authenticate & Enter Workspace'}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </EdgeGlow>
          </form>

          <div className="pt-2 border-t border-[rgba(201,168,76,0.15)] flex items-center justify-between text-[11px] font-mono text-[#8a6e2a]">
            <button
              type="button"
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="hover:text-[#C9A84C] transition-colors cursor-pointer"
            >
              {isRegisterMode ? 'Already registered? Sign in' : 'New architect? Create account'}
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthEmail('guest.architect@jadai.dev');
                setAuthPassword('guest6057');
              }}
              className="text-[#C9A84C] hover:underline cursor-pointer"
            >
              One-Click Demo Entry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 2. AUTHENTICATED BENTO DASHBOARD (Sleek, Compact, High-Density)
  // -------------------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-[#c4c0bb] select-none">
      {/* Top Banner: User Mantle & Quick Controls */}
      <div className="p-6 rounded-3xl bg-[#0a0908] border border-[rgba(201,168,76,0.3)] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#050404] border border-[#C9A84C] flex items-center justify-center text-[#e8c96a] shadow-[0_0_20px_rgba(201,168,76,0.25)]">
            <Crown className="w-7 h-7" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-display font-bold text-[#f5f3f0]">
                {userProfile?.name?.toUpperCase() || 'SOVEREIGN ARCHITECT'}
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[rgba(201,168,76,0.2)] text-[#e8c96a] border border-[#C9A84C] font-bold">
                PRIME MEMBER
              </span>
            </div>
            <p className="text-xs font-mono text-[#8a6e2a]">
              Email: {userProfile?.email} • Verified Client Device
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('/playground') : (window.location.href = '/playground')}
            className="px-3.5 py-2 rounded-xl bg-[#C9A84C] text-[#050404] font-mono text-xs font-bold hover:bg-[#e8c96a] transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Session</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-xl border border-[rgba(201,168,76,0.25)] text-[#8a6e2a] hover:text-[#C0392B] hover:bg-[rgba(192,57,43,0.1)] transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bento Grid Matrix (Compact & Space-Filling) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* BENTO COL 1 (Wide): Continuous Workspace Drafts & Filter Tabs */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-3xl bg-[#0a0908] border border-[rgba(201,168,76,0.25)] shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(201,168,76,0.15)] pb-3">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-[#C9A84C]" />
              <h2 className="font-display font-bold text-sm text-[#f5f3f0]">
                Continuous Project Drafts ({drafts.length})
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-[#050404] p-1 rounded-xl border border-[rgba(201,168,76,0.2)] text-[10px] font-mono">
              {['all', 'forge', 'oracle', 'mirage', 'sentinel'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    StudioAudio.playClick();
                    setActiveFilter(tab);
                  }}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                    activeFilter === tab
                      ? 'bg-[#C9A84C] text-[#050404] font-bold shadow'
                      : 'text-[#8a6e2a] hover:text-[#f5f3f0]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Drafts List (Compact rows or grid) */}
          {filteredDrafts.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <FolderGit2 className="w-8 h-8 text-[#8a6e2a] mx-auto opacity-50" />
              <p className="text-xs font-mono text-[#8a6e2a]">No drafts found for {activeFilter}.</p>
              <button
                onClick={() => onNavigate ? onNavigate('/playground') : (window.location.href = '/playground')}
                className="text-xs font-mono text-[#C9A84C] hover:underline"
              >
                Launch a tool in the Creation Lab →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="p-3.5 rounded-2xl bg-[#050404] border border-[rgba(201,168,76,0.2)] hover:border-[#C9A84C] transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#8a6e2a]">
                      <span className="uppercase px-1.5 py-0.2 rounded bg-[rgba(201,168,76,0.15)] text-[#e8c96a]">
                        {draft.serviceName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(draft.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-sm text-[#f5f3f0] truncate group-hover:text-[#e8c96a] transition-colors">
                      {draft.projectName}
                    </h4>

                    <p className="text-xs text-[#c4c0bb] line-clamp-2 font-mono">
                      {typeof draft.inputData === 'string'
                        ? draft.inputData
                        : JSON.stringify(draft.inputData)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[rgba(201,168,76,0.1)]">
                    <button
                      type="button"
                      onClick={() => handleDelete(draft.id, draft.projectName)}
                      className="p-1 rounded text-[#8a6e2a] hover:text-[#C0392B] transition-colors cursor-pointer text-xs"
                      title="Delete Draft"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleResume(draft)}
                      className="px-3 py-1 rounded-lg bg-[#C9A84C] text-[#050404] font-mono text-xs font-bold hover:bg-[#e8c96a] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Resume</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BENTO COL 2 (Sidebar): 3D Rotatable Loyalty Milestone & Shaking Vault */}
        <div className="lg:col-span-4 space-y-5">
          {/* 3D Rotatable Loyalty Card */}
          <RotatableCard3D
            flipLabel="Perk Specs"
            front={
              <div className="p-5 rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.25)] space-y-3 h-full flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-[#8a6e2a]">
                      Milestone Reward Tag
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                      Tier 3 Active
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-lg text-[#f5f3f0]">
                    25% Architectural Discount
                  </h3>

                  <p className="text-xs font-mono text-[#8a6e2a]">
                    Consecutive payment streak: <span className="text-[#e8c96a] font-bold">3 of 3 complete</span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.2)] font-mono text-xs space-y-1">
                  <span className="text-[#8a6e2a] block text-[10px]">Your Dedicated Discount Code:</span>
                  <span className="text-[#e8c96a] font-bold text-sm tracking-wider">JADAI-CONV-25</span>
                </div>
              </div>
            }
            back={
              <div className="space-y-3 text-xs font-mono">
                <h4 className="font-display font-bold text-sm text-[#f5f3f0] border-b border-[rgba(201,168,76,0.2)] pb-2">
                  Unlocked Prime Perks
                </h4>
                <ul className="space-y-2 text-[#c4c0bb] text-[11px]">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>25% off all starter templates & licenses</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Direct WhatsApp line with Principal Architect</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Early access to Book of Lies unreleased drops</span>
                  </li>
                </ul>
              </div>
            }
          />

          {/* Shaking Surprise Vault Box */}
          <div className="p-5 rounded-3xl bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.25)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-[#C9A84C] font-bold flex items-center gap-1">
                <Gift className="w-3.5 h-3.5" />
                <span>Vault Box</span>
              </span>
              <span className="text-[10px] font-mono text-[#8a6e2a]">Monthly Perk</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.2)]">
              <button
                type="button"
                onClick={handleUnsealBox}
                className="w-12 h-12 rounded-xl bg-[#050404] border border-[#C9A84C] flex items-center justify-center text-[#e8c96a] shadow-[0_0_15px_rgba(201,168,76,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                title="Tap to unseal surprise perk"
              >
                {boxUnsealed ? <Sparkles className="w-6 h-6 text-[#C9A84C]" /> : <Gift className="w-6 h-6" />}
              </button>

              <div className="space-y-0.5">
                <h5 className="font-display font-bold text-xs text-[#f5f3f0]">
                  {boxUnsealed ? 'Member Reward Disclosed' : 'Unseal Monthly Perk'}
                </h5>
                <p className="text-[11px] font-mono text-[#8a6e2a]">
                  {boxUnsealed ? boxReward : 'Tap the golden box to unseal your random reward.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
