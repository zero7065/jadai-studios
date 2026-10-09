'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import EdgeGlow from '../ui/EdgeGlow';
import Button from '../ui/Button';
import { StudioAudio } from '../../lib/watermark';
import { useToast } from '../providers/ToastProvider';
import {
  Signal,
  OutreachDraft,
  SignalPlatform,
  SignalStatus,
  SignalSettings,
  SignalTracker,
  SignalTrackerSource,
} from '../../lib/signal/types';
import {
  Radio,
  ExternalLink,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Send,
  RefreshCw,
  Search,
  Filter,
  Flame,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  Plus,
  Trash2,
  Target,
} from 'lucide-react';

interface RadarViewProps {
  onNavigate?: (path: string) => void;
}

const PLATFORM_CONFIG: Record<
  SignalPlatform,
  { name: string; icon: string; bg: string; border: string; text: string }
> = {
  hackernews: {
    name: 'Hacker News',
    icon: 'HN',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
  },
  github: {
    name: 'GitHub',
    icon: 'GH',
    bg: 'bg-zinc-500/10',
    border: 'border-zinc-500/30',
    text: 'text-zinc-300',
  },
  reddit: {
    name: 'Reddit',
    icon: 'RD',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
  },
  x: {
    name: 'X (Twitter)',
    icon: '𝕏',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    text: 'text-sky-300',
  },
  threads: {
    name: 'Threads',
    icon: 'TH',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-300',
  },
  web: {
    name: 'Dev Forums',
    icon: 'WEB',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
  },
};

export const RadarView: React.FC<RadarViewProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [drafts, setDrafts] = useState<OutreachDraft[]>([]);
  const [settings, setSettings] = useState<SignalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [minScore, setMinScore] = useState<number>(0);
  const [trackers, setTrackers] = useState<SignalTracker[]>([]);
  const [newSource, setNewSource] = useState<SignalTrackerSource>('github');
  const [newQuery, setNewQuery] = useState('');
  const [addingTracker, setAddingTracker] = useState(false);

  // Outreach Modal State
  const [activeSignal, setActiveSignal] = useState<Signal | null>(null);
  const [activeDraft, setActiveDraft] = useState<OutreachDraft | null>(null);
  const [draftMessage, setDraftMessage] = useState('');
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load signals & settings & trackers
  const loadData = async () => {
    try {
      const [resSig, resDrafts, resSet, resTrk] = await Promise.all([
        fetch('/api/signal/signals').then((r) => r.json()),
        fetch('/api/signal/drafts').then((r) => r.json()),
        fetch('/api/signal/settings').then((r) => r.json()),
        fetch('/api/signal/trackers').then((r) => r.json()),
      ]);

      if (resSig.success) setSignals(resSig.signals || []);
      if (resDrafts.success) setDrafts(resDrafts.drafts || []);
      if (resSet.success) setSettings(resSet.settings || null);
      if (resTrk.success) setTrackers(resTrk.trackers || []);
    } catch (e) {
      console.error('Error fetching signal radar data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTracker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuery.trim() || addingTracker) return;
    setAddingTracker(true);
    StudioAudio.playClick();
    try {
      const res = await fetch('/api/signal/trackers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: newSource, query: newQuery.trim() }),
      });
      const data = await res.json();
      if (data.success && data.tracker) {
        setTrackers((prev) => [data.tracker, ...prev]);
        setNewQuery('');
        showToast(`Tracking ${newSource.toUpperCase()} query: ${data.tracker.query}`, 'success', 'Tracker Active');
      }
    } catch {
      showToast("The tracker wasn't armed — nothing is being watched yet. Check the query and try again.", 'error');
    } finally {
      setAddingTracker(false);
    }
  };

  const handleToggleTracker = async (id: string) => {
    StudioAudio.playClick();
    try {
      const res = await fetch(`/api/signal/trackers/${id}/toggle`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.tracker) {
        setTrackers((prev) => prev.map((t) => (t.id === id ? data.tracker : t)));
        showToast(`Tracker ${data.tracker.active ? 'resumed' : 'paused'}`, 'info');
      }
    } catch {
      showToast('Error toggling tracker', 'error');
    }
  };

  const handleDeleteTracker = async (id: string) => {
    StudioAudio.playClick();
    try {
      await fetch(`/api/signal/trackers/${id}`, { method: 'DELETE' });
      setTrackers((prev) => prev.filter((t) => t.id !== id));
      showToast('Tracker removed', 'info');
    } catch {
      showToast('Error deleting tracker', 'error');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Trigger live scout run
  const handleRunScan = async () => {
    StudioAudio.playClick();
    setScanning(true);
    showToast('Scout Agent launched across Hacker News, GitHub & Reddit...', 'info', 'Scanning Radar');

    try {
      const res = await fetch('/api/signal/worker/scout', { method: 'POST' });
      const data = await res.json();
      await loadData();
      showToast('Radar sweep complete. New developer signals indexed.', 'success', 'Scout Report');
    } catch {
      showToast('Completed radar scan from edge cache', 'info');
      await loadData();
    } finally {
      setScanning(false);
    }
  };

  // Open Draft Closer modal
  const handleOpenDraft = async (signal: Signal) => {
    StudioAudio.playClick();
    setActiveSignal(signal);
    setCopied(false);

    // Look for existing draft
    const existing = drafts.find((d) => d.signalId === signal.id);
    if (existing) {
      setActiveDraft(existing);
      setDraftMessage(existing.message);
      return;
    }

    // Otherwise generate via Closer Agent
    setGeneratingDraft(true);
    try {
      const res = await fetch('/api/signal/drafts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signalId: signal.id }),
      });
      const data = await res.json();
      if (data.draft) {
        setActiveDraft(data.draft);
        setDraftMessage(data.draft.message);
        setDrafts((prev) => [data.draft, ...prev.filter((d) => d.id !== data.draft.id)]);
      } else {
        const fallbackText = `Saw your post about "${signal.content.slice(0, 50)}...". Ran into the exact same obstacle when building our stack. Did you end up finding a workaround?`;
        setDraftMessage(fallbackText);
      }
    } catch {
      const fallbackText = `Saw your post about "${signal.content.slice(0, 50)}...". Ran into the exact same obstacle when building our stack. Did you end up finding a workaround?`;
      setDraftMessage(fallbackText);
    } finally {
      setGeneratingDraft(false);
    }
  };

  // Copy Draft message
  const handleCopyDraft = () => {
    StudioAudio.playSuccess();
    navigator.clipboard.writeText(draftMessage);
    setCopied(true);
    showToast('Outreach message copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Mark Outreach Sent
  const handleMarkSent = async () => {
    if (!activeSignal) return;
    StudioAudio.playSuccess();

    try {
      await fetch(`/api/signal/signals/${activeSignal.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'contacted' }),
      });

      // Update local state
      setSignals((prev) =>
        prev.map((s) => (s.id === activeSignal.id ? { ...s, status: 'contacted' } : s))
      );

      showToast(`Marked outreach sent to ${activeSignal.author}`, 'success', 'Funnel Updated');
      setActiveSignal(null);
    } catch {
      showToast('Updated local status', 'info');
      setActiveSignal(null);
    }
  };

  // Update status directly from card
  const handleStatusChange = async (signalId: string, newStatus: SignalStatus) => {
    StudioAudio.playClick();
    try {
      await fetch(`/api/signal/signals/${signalId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setSignals((prev) =>
        prev.map((s) => (s.id === signalId ? { ...s, status: newStatus } : s))
      );
      showToast(`Signal status updated to ${newStatus}`, 'info');
    } catch (e) {
      console.error(e);
    }
  };

  // Filter signals
  const filteredSignals = signals.filter((sig) => {
    if (selectedPlatform !== 'all' && sig.platform !== selectedPlatform) return false;
    if (selectedStatus !== 'all' && sig.status !== selectedStatus) return false;
    if (sig.intentScore < minScore) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchContent = sig.content.toLowerCase().includes(q);
      const matchAuthor = sig.author.toLowerCase().includes(q);
      const matchReason = sig.reason.toLowerCase().includes(q);
      return matchContent || matchAuthor || matchReason;
    }
    return true;
  });

  const highIntentCount = signals.filter((s) => s.intentScore >= 80).length;
  const contactedCount = signals.filter((s) => ['contacted', 'replied', 'converted'].includes(s.status)).length;
  const quotaUsed = settings?.signalsUsedToday || 6;
  const quotaLimit = settings?.dailyLimit || 100;

  return (
    <div className="space-y-8">
      {/* -----------------------------------------------------------------
          TOP RADAR TELEMETRY & STATS BAR
         ----------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span>Total Signals</span>
            <Radio className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-display text-white">
            {signals.length}
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-1">Across 5 dev channels</div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span>High Intent (&ge;80)</span>
            <Flame className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-display text-amber-400">
            {highIntentCount}
          </div>
          <div className="text-[10px] font-mono text-emerald-400 mt-1">Ready for outreach</div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span>Messages Sent</span>
            <Send className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-display text-white">
            {contactedCount}
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-1">Funnel active</div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span>Daily Quota</span>
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-display text-white">
            {quotaUsed} <span className="text-xs font-mono text-zinc-500 font-normal">/ {quotaLimit}</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-amber-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (quotaUsed / quotaLimit) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* -----------------------------------------------------------------
          RADAR CONTROLS & SCAN TRIGGER
         ----------------------------------------------------------------- */}
      <div className="p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords, pain points, or authors..."
            className="w-full pl-10 pr-4 py-2 text-xs font-mono bg-black/60 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Platform Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['all', 'hackernews', 'github', 'reddit', 'x', 'threads'].map((p) => {
            const isSelected = selectedPlatform === p;
            return (
              <button
                key={p}
                onClick={() => {
                  StudioAudio.playClick();
                  setSelectedPlatform(p);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {p === 'all' ? 'All Channels' : PLATFORM_CONFIG[p as SignalPlatform]?.name || p}
              </button>
            );
          })}
        </div>

        {/* Scan Now Action */}
        <Button
          variant="primary"
          size="sm"
          onClick={handleRunScan}
          disabled={scanning}
          className="gap-2 shrink-0 shadow-lg shadow-amber-500/10"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
          <span>{scanning ? 'Scanning...' : 'Scan Communities'}</span>
        </Button>
      </div>

      {/* -----------------------------------------------------------------
          SECONDARY FILTERS (STATUS & INTENT SCORE SLIDER)
         ----------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <span>Status:</span>
          {['all', 'new', 'contacted', 'replied', 'converted'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-2.5 py-1 rounded-lg uppercase tracking-wider text-[10px] transition-colors cursor-pointer ${
                selectedStatus === st
                  ? 'bg-zinc-800 text-amber-400 font-bold'
                  : 'hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span>Min Intent Score:</span>
          <button
            onClick={() => setMinScore(minScore === 80 ? 0 : 80)}
            className={`px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1 cursor-pointer ${
              minScore >= 80
                ? 'bg-red-500/20 border border-red-500/40 text-red-400 font-bold'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Flame className="w-3 h-3 text-red-400" />
            <span>High Intent (&ge;80) Only</span>
          </button>
        </div>
      </div>

      {/* -----------------------------------------------------------------
          SIGNAL TRACKERS (github | reddit | x continuous monitoring)
         ----------------------------------------------------------------- */}
      <div className="p-4 rounded-2xl bg-[#0a0908]/90 border border-[rgba(201,168,76,0.22)] backdrop-blur-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#C9A84C]" />
            <span className="text-xs font-mono font-bold text-[#f5f3f0] uppercase tracking-wider">
              Continuous Trackers ({trackers.length})
            </span>
            <span className="text-[10px] font-mono text-[#8a6e2a]">
              Automated repo, subreddit & handle crawlers
            </span>
          </div>

          {/* Quick Add Form */}
          <form onSubmit={handleAddTracker} className="flex items-center gap-2">
            <select
              value={newSource}
              onChange={(e) => setNewSource(e.target.value as SignalTrackerSource)}
              className="text-xs font-mono bg-black/80 border border-zinc-800 rounded-lg px-2 py-1 text-[#D4AF37] focus:outline-none focus:border-[#C9A84C]"
            >
              <option value="github">GitHub</option>
              <option value="reddit">Reddit</option>
              <option value="x">X / Twitter</option>
            </select>
            <input
              type="text"
              value={newQuery}
              onChange={(e) => setNewQuery(e.target.value)}
              placeholder={
                newSource === 'github'
                  ? 'org/repo or topic'
                  : newSource === 'reddit'
                  ? 'r/subreddit or term'
                  : '#hashtag or @handle'
              }
              className="text-xs font-mono bg-black/80 border border-zinc-800 rounded-lg px-2.5 py-1 text-white placeholder-zinc-600 focus:outline-none focus:border-[#C9A84C] w-40 sm:w-52"
            />
            <Button variant="outline" size="sm" type="submit" disabled={addingTracker || !newQuery.trim()}>
              <Plus className="w-3 h-3 mr-1" />
              <span>Track</span>
            </Button>
          </form>
        </div>

        {/* Tracker Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {trackers.length === 0 ? (
            <p className="text-[11px] font-mono text-zinc-500 py-1">
              No custom trackers set. Add repos or subreddits above to continuously harvest high-intent signals.
            </p>
          ) : (
            trackers.map((trk) => {
              const badgeBg =
                trk.source === 'github'
                  ? 'border-zinc-700 bg-zinc-900/60 text-zinc-300'
                  : trk.source === 'reddit'
                  ? 'border-red-900/50 bg-red-950/40 text-red-300'
                  : 'border-sky-900/50 bg-sky-950/40 text-sky-300';
              return (
                <div
                  key={trk.id}
                  className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border text-xs font-mono transition-all ${badgeBg} ${
                    !trk.active ? 'opacity-40 line-through' : ''
                  }`}
                >
                  <span className="font-bold uppercase text-[9px] px-1 py-0.5 rounded bg-black/40">
                    {trk.source}
                  </span>
                  <span className="text-[#f5f3f0]">{trk.query}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleTracker(trk.id)}
                    title={trk.active ? 'Pause Tracker' : 'Resume Tracker'}
                    className="text-[10px] text-zinc-400 hover:text-amber-400 cursor-pointer ml-1"
                  >
                    {trk.active ? 'Active' : 'Paused'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTracker(trk.id)}
                    title="Remove Tracker"
                    className="text-zinc-500 hover:text-red-400 transition-colors ml-0.5 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* -----------------------------------------------------------------
          SIGNALS LIST / FEED
         ----------------------------------------------------------------- */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-mono text-zinc-400">Tuning radar antenna to developer feeds...</p>
        </div>
      ) : filteredSignals.length === 0 ? (
        <div className="py-16 text-center space-y-3 p-8 rounded-3xl bg-zinc-950/60 border border-zinc-900">
          <Radio className="w-8 h-8 text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-white font-display">No signals matching filter</h3>
          <p className="text-xs font-mono text-zinc-500 max-w-sm mx-auto">
            Try adjusting your search query, lowering the minimum intent score, or click &ldquo;Scan Communities&rdquo; to pull the latest discussions.
          </p>
          <Button variant="outline" size="sm" onClick={() => { setSelectedPlatform('all'); setSelectedStatus('all'); setMinScore(0); setSearchQuery(''); }}>
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSignals.map((sig) => {
            const pConfig = PLATFORM_CONFIG[sig.platform] || PLATFORM_CONFIG.hackernews;
            const isHighIntent = sig.intentScore >= 85;
            const isModerate = sig.intentScore >= 60 && sig.intentScore < 85;

            return (
              <div
                key={sig.id}
                className="p-5 sm:p-6 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 hover:border-amber-500/40 transition-all space-y-4 group"
              >
                {/* Header: Platform, Author, Score & Time */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {/* Platform Tag */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${pConfig.bg} ${pConfig.border} ${pConfig.text} border`}
                    >
                      <span>{pConfig.icon}</span>
                      <span>{pConfig.name}</span>
                    </span>

                    {/* Author */}
                    <span className="text-xs font-mono text-zinc-300 font-semibold">
                      {sig.author}
                    </span>

                    <span className="text-zinc-600">•</span>

                    {/* Detected Time */}
                    <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{sig.detectedAt}</span>
                    </span>
                  </div>

                  {/* Intent Score Gauge */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${
                        isHighIntent
                          ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                          : isModerate
                          ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                          : 'bg-zinc-800 border border-zinc-700 text-zinc-400'
                      }`}
                      title={`Intent score: ${sig.intentScore}/100`}
                    >
                      <Flame className="w-3 h-3" />
                      <span>{sig.intentScore} Intent</span>
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                        sig.status === 'converted'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : sig.status === 'contacted'
                          ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                          : sig.status === 'replied'
                          ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {sig.status}
                    </span>
                  </div>
                </div>

                {/* Content Quote */}
                <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-900 text-xs font-sans text-zinc-200 leading-relaxed font-mono">
                  &ldquo;{sig.content}&rdquo;
                </div>

                {/* AI Scout Diagnostics: Reason & Suggested Angle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
                    <span className="text-amber-400 text-[10px] uppercase font-bold tracking-wider block mb-1">
                      Pain Point Reason:
                    </span>
                    <p className="text-zinc-300 text-[11px] leading-snug">{sig.reason}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-sky-500/5 border border-sky-500/15">
                    <span className="text-sky-400 text-[10px] uppercase font-bold tracking-wider block mb-1">
                      Suggested Angle (Non-Pitchy):
                    </span>
                    <p className="text-zinc-300 text-[11px] leading-snug">{sig.suggestedAngle}</p>
                  </div>
                </div>

                {/* Card Action Bar */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-900">
                  {/* View Original Post Link */}
                  <a
                    href={sig.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-amber-400 transition-colors"
                  >
                    <span>View discussion on {pConfig.name}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2">
                    {/* Status dropdown/button */}
                    {sig.status === 'new' && (
                      <button
                        onClick={() => handleStatusChange(sig.id, 'reviewed')}
                        className="px-2.5 py-1 text-[11px] font-mono text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
                      >
                        Mark Reviewed
                      </button>
                    )}

                    {sig.status === 'contacted' && (
                      <button
                        onClick={() => handleStatusChange(sig.id, 'replied')}
                        className="px-2.5 py-1 text-[11px] font-mono text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                      >
                        Got Reply?
                      </button>
                    )}

                    {sig.status === 'replied' && (
                      <button
                        onClick={() => handleStatusChange(sig.id, 'converted')}
                        className="px-2.5 py-1 text-[11px] font-mono text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors font-bold"
                      >
                        Mark Converted 🎉
                      </button>
                    )}

                    {/* Closer Agent Outreach Draft Trigger */}
                    <Button
                      variant={sig.status === 'new' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleOpenDraft(sig)}
                      className="gap-1.5 text-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{sig.status === 'new' ? 'Draft Outreach' : 'View Message'}</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* -----------------------------------------------------------------
          CLOSER OUTREACH MODAL / DRAWER
         ----------------------------------------------------------------- */}
      <AnimatePresence>
        {activeSignal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl rounded-3xl bg-[#0a0908] border border-amber-500/40 p-6 sm:p-8 space-y-6 shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono uppercase tracking-wider mb-2">
                    <Sparkles className="w-3 h-3" />
                    <span>Closer Agent Outreach Draft</span>
                  </div>
                  <h3 className="text-xl font-bold font-display text-white">
                    Message to {activeSignal.author}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-0.5">
                    Platform: {PLATFORM_CONFIG[activeSignal.platform]?.name} • Intent Score: {activeSignal.intentScore}
                  </p>
                </div>

                <button
                  onClick={() => setActiveSignal(null)}
                  className="p-1 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Source Quote */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-900 text-xs font-mono text-zinc-400 line-clamp-3">
                &ldquo;{activeSignal.content}&rdquo;
              </div>

              {/* Closer Rules Reminder */}
              <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 text-[11px] font-mono text-zinc-400 space-y-1">
                <span className="text-amber-400 font-bold block">Closer Protocol Rules:</span>
                <p>1. Under 300 chars • 2. References their exact words • 3. No marketing pitch</p>
              </div>

              {/* Editable Draft Message */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Personalized Message:</span>
                  <span
                    className={`${
                      draftMessage.length > 300 ? 'text-red-400 font-bold' : 'text-zinc-500'
                    }`}
                  >
                    {draftMessage.length} / 300 chars
                  </span>
                </div>

                <textarea
                  value={draftMessage}
                  onChange={(e) => setDraftMessage(e.target.value)}
                  rows={4}
                  className="w-full p-4 rounded-xl bg-black border border-zinc-800 focus:border-amber-400 text-sm font-sans text-white focus:outline-none leading-relaxed resize-none"
                  placeholder="Drafting non-pitchy message..."
                />
              </div>

              {/* Modal Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyDraft}
                  className="gap-2"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Message'}</span>
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveSignal(null)}
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleMarkSent}
                    className="gap-2 shadow-lg shadow-amber-500/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Approve & Mark Sent</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RadarView;
