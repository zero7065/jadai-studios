'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import EdgeGlow from '../ui/EdgeGlow';
import Button from '../ui/Button';
import { StudioAudio } from '../../lib/watermark';
import { useToast } from '../providers/ToastProvider';
import { GeneratedContent, GeneratedContentPlatform } from '../../lib/signal/types';
import {
  PenTool,
  Sparkles,
  GitCommit,
  Rocket,
  Trophy,
  Copy,
  Check,
  Share2,
  Calendar,
  Clock,
  Send,
  Trash2,
  RefreshCw,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

interface ContentViewProps {
  onNavigate?: (path: string) => void;
}

export const ContentView: React.FC<ContentViewProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [activityType, setActivityType] = useState<'commit' | 'deployment' | 'milestone' | 'manual'>('commit');
  const [summary, setSummary] = useState('');
  const [details, setDetails] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePlatformTab, setActivePlatformTab] = useState<GeneratedContentPlatform>('x');
  const [contentHistory, setContentHistory] = useState<GeneratedContent[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Latest generated drafts for current activity
  const [latestDrafts, setLatestDrafts] = useState<{
    x?: string;
    linkedin?: string;
    reddit?: string;
  }>({});

  // Fetch past generated content
  const loadHistory = async () => {
    try {
      const res = await fetch('/api/signal/content').then((r) => r.json());
      if (res.success && Array.isArray(res.content)) {
        setContentHistory(res.content);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Quick activity presets
  const presets = [
    {
      type: 'commit' as const,
      summary: 'feat(search): Added real-time Google Maps and Search grounding',
      details: 'Wired up Gemini 3.8 Flash tools with automatic citation chunks. Sub-second place and route query resolutions.',
    },
    {
      type: 'deployment' as const,
      summary: 'deploy: Migrated edge cache to multi-region Cloud Run',
      details: 'Cut global API response latency from 420ms to 48ms. Edge failover to secondary provider active.',
    },
    {
      type: 'milestone' as const,
      summary: 'milestone: First 1,000 developer problem signals detected with zero spam',
      details: 'Scout agent achieved 94% precision on Hacker News and Reddit. Solved cold-outreach fatigue.',
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    StudioAudio.playClick();
    setActivityType(p.type);
    setSummary(p.summary);
    setDetails(p.details);
  };

  const handleGenerate = async () => {
    if (!summary.trim()) {
      showToast('Please provide an activity summary or commit message', 'error');
      return;
    }

    StudioAudio.playClick();
    setIsGenerating(true);
    showToast('Writer Agent crafting high-resonance social drafts...', 'info', 'Generating Posts');

    try {
      const res = await fetch('/api/signal/worker/writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activityType,
          summary,
          details: details || summary,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        const xItem = data.items.find((i: GeneratedContent) => i.platform === 'x');
        const liItem = data.items.find((i: GeneratedContent) => i.platform === 'linkedin');
        const rdItem = data.items.find((i: GeneratedContent) => i.platform === 'reddit');

        setLatestDrafts({
          x: xItem?.content,
          linkedin: liItem?.content,
          reddit: rdItem?.content,
        });

        await loadHistory();
        StudioAudio.playSuccess();
        showToast('Crafted posts for X, LinkedIn & Reddit', 'success', 'Writer Engine');
      } else {
        throw new Error('Writer fallback');
      }
    } catch {
      // Labelled templates — never presented as agent output.
      const xFallback = `[OFFLINE TEMPLATE — writer agent unreachable]\n\nShipped ${summary}. Lesson: don't over-engineer before you verify demand. Build the floor first. #buildinpublic`;
      const liFallback = `[OFFLINE TEMPLATE — writer agent unreachable]\n\nReflecting on our latest release: ${summary}.\n\nWhen we started building Jadai Studios, we thought features mattered most. Turns out distribution and simplicity win every time.\n\n${details || 'Ship fast, measure intent, listen to what developers complain about.'}\n\n#SoftwareEngineering #TechFounders`;
      const rdFallback = `[OFFLINE TEMPLATE — writer agent unreachable]\n\nQuick write-up on how we built and deployed ${summary} without adding tech debt. Details and architectural lessons inside.`;

      setLatestDrafts({
        x: xFallback,
        linkedin: liFallback,
        reddit: rdFallback,
      });

      StudioAudio.playSuccess();
      showToast('Writer agent offline — inserted editable templates instead.', 'info');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    StudioAudio.playSuccess();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied post text to clipboard', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeContentText = latestDrafts[activePlatformTab as keyof typeof latestDrafts] || '';

  return (
    <div className="space-y-8">
      {/* -----------------------------------------------------------------
          HERO HEADER / VISIBILITY ENGINE OVERVIEW
         ----------------------------------------------------------------- */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/80 border border-zinc-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-wider">
              <PenTool className="w-3.5 h-3.5" />
              <span>Visibility Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
              Turn Git Commits Into Social Proof
            </h2>
            <p className="text-xs sm:text-sm font-mono text-zinc-400 max-w-2xl">
              Don&apos;t spend hours staring at Twitter. Feed your actual commits, deployments, and milestones into the Writer Agent to generate authentic, non-generic technical content.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-500">Quick Presets:</span>
            {presets.map((p, i) => (
              <button
                key={i}
                onClick={() => handleApplyPreset(p)}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-400 hover:border-amber-500/40 text-[10px] font-mono transition-colors cursor-pointer"
              >
                {p.type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* -----------------------------------------------------------------
          ACTIVITY INTAKE FORM
         ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-950/90 border border-zinc-800 space-y-5">
            <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-amber-400" />
              <span>Activity Input</span>
            </h3>

            {/* Activity Type Selector */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'commit' as const, label: 'Commit', icon: GitCommit },
                { id: 'deployment' as const, label: 'Deploy', icon: Rocket },
                { id: 'milestone' as const, label: 'Milestone', icon: Trophy },
                { id: 'manual' as const, label: 'Manual', icon: PenTool },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = activityType === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      StudioAudio.playClick();
                      setActivityType(item.id);
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-[11px] font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-black font-bold border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-400 flex items-center justify-between">
                <span>Summary / Commit Header:</span>
                <span className="text-[10px] text-zinc-500">e.g. feat(perf): 4x faster indexing</span>
              </label>
              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="What did you build or ship today?"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:border-amber-400 placeholder-zinc-600"
              />
            </div>

            {/* Details */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-400 flex items-center justify-between">
                <span>Technical Details & Context:</span>
                <span className="text-[10px] text-zinc-500">Optional notes</span>
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                placeholder="What was the hard part? What was the lesson learned? Which metric moved?"
                className="w-full p-3.5 rounded-xl bg-black border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:border-amber-400 placeholder-zinc-600 resize-none leading-relaxed"
              />
            </div>

            {/* Generate Action Button */}
            <Button
              variant="primary"
              size="md"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full gap-2 shadow-xl shadow-amber-500/10"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Writer Agent Drafting...' : 'Generate Multi-Platform Posts'}</span>
            </Button>
          </div>
        </div>

        {/* Right Column: Generated Multi-Platform Output (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-950/90 border border-zinc-800 space-y-5">
            {/* Platform Tabs */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                {[
                  { id: 'x' as const, label: 'X (Twitter)', limit: 280 },
                  { id: 'linkedin' as const, label: 'LinkedIn', limit: 1300 },
                  { id: 'reddit' as const, label: 'Reddit', limit: 4000 },
                ].map((plat) => {
                  const isActive = activePlatformTab === plat.id;
                  const hasDraft = Boolean(latestDrafts[plat.id]);
                  return (
                    <button
                      key={plat.id}
                      onClick={() => {
                        StudioAudio.playClick();
                        setActivePlatformTab(plat.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-amber-500 text-black font-bold'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      <span>{plat.label}</span>
                      {hasDraft && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    </button>
                  );
                })}
              </div>

              {activeContentText && (
                <span className="text-[11px] font-mono text-zinc-500">
                  {activeContentText.length} chars
                </span>
              )}
            </div>

            {/* Generated Content Box */}
            <div className="space-y-4">
              {activeContentText ? (
                <div className="space-y-3">
                  <div className="p-5 rounded-2xl bg-black/80 border border-zinc-800/80 text-sm font-sans text-zinc-100 whitespace-pre-wrap leading-relaxed">
                    {activeContentText}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Optimized for {activePlatformTab.toUpperCase()} algorithm</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleCopy(activeContentText, `latest-${activePlatformTab}`)}
                        className="gap-2"
                      >
                        {copiedId === `latest-${activePlatformTab}` ? (
                          <Check className="w-3.5 h-3.5 text-black" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedId === `latest-${activePlatformTab}` ? 'Copied' : 'Copy Post'}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center space-y-3">
                  <PenTool className="w-8 h-8 text-zinc-700 mx-auto" />
                  <p className="text-sm font-display text-white">No post generated yet</p>
                  <p className="text-xs font-mono text-zinc-500 max-w-sm mx-auto">
                    Fill out the commit summary on the left or select a preset, then click &ldquo;Generate Multi-Platform Posts&rdquo;.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* History of Generated Content */}
          {contentHistory.length > 0 && (
            <div className="p-6 rounded-3xl bg-zinc-950/60 border border-zinc-900 space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Generated Posts Archive ({contentHistory.length})
              </h4>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {contentHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-black/60 border border-zinc-900 flex items-start justify-between gap-4 text-xs font-mono"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-400 uppercase text-[10px] font-bold">
                          {item.platform}
                        </span>
                        <span className="text-zinc-500 text-[10px]">
                          {item.sourceType} • {item.createdAt}
                        </span>
                      </div>
                      <p className="text-zinc-300 font-sans text-xs line-clamp-2">
                        {item.content}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopy(item.content, item.id)}
                      className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors shrink-0 cursor-pointer"
                      title="Copy"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentView;
