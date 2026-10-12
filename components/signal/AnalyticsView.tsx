'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Button from '../ui/Button';
import { StudioAudio } from '../../lib/watermark';
import {
  BarChart3,
  TrendingUp,
  Flame,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Users,
  Target,
  Send,
  MessageSquare,
  Sparkles,
  Zap,
} from 'lucide-react';

interface AnalyticsViewProps {
  onNavigate?: (path: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/signal/analytics')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const summary = data || {
    totalSignals: 0,
    messagesSent: 0,
    replies: 0,
    conversions: 0,
    platformCounts: {},
  };

  const replyRate = summary.messagesSent > 0
    ? ((summary.replies / summary.messagesSent) * 100).toFixed(1)
    : '0.0';

  const conversionRate = summary.messagesSent > 0
    ? ((summary.conversions / summary.messagesSent) * 100).toFixed(1)
    : '0.0';

  const pctOf = (n: number) =>
    summary.totalSignals > 0 ? Math.round((n / summary.totalSignals) * 100) : 0;

  const stages = [
    { label: 'Signals Detected', count: summary.totalSignals, pct: pctOf(summary.totalSignals), color: 'bg-amber-500' },
    { label: 'Outreach Sent', count: summary.messagesSent, pct: pctOf(summary.messagesSent), color: 'bg-amber-400' },
    { label: 'Replies Received', count: summary.replies, pct: pctOf(summary.replies), color: 'bg-purple-500' },
    { label: 'Conversions', count: summary.conversions, pct: pctOf(summary.conversions), color: 'bg-emerald-500' },
  ];

  const PLATFORM_META: Record<string, { name: string; color: string }> = {
    hackernews: { name: 'Hacker News', color: '#ff6600' },
    github: { name: 'GitHub', color: '#f5f3f0' },
    reddit: { name: 'Reddit', color: '#ff4500' },
    x: { name: 'X / Twitter', color: '#38bdf8' },
    threads: { name: 'Threads', color: '#c084fc' },
    web: { name: 'Web', color: '#a1a1aa' },
    linkedin: { name: 'LinkedIn', color: '#0a66c2' },
  };

  const channels = Object.entries(summary.platformCounts || {})
    .filter(([, count]) => Number(count) > 0)
    .map(([key, count]) => ({
      key,
      signals: Number(count),
      name: PLATFORM_META[key]?.name || key,
      color: PLATFORM_META[key]?.color || '#71717a',
    }))
    .sort((a, b) => b.signals - a.signals);

  return (
    <div className="space-y-8">
      {/* -----------------------------------------------------------------
          TOP HEADER
         ----------------------------------------------------------------- */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/80 border border-zinc-800 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-wider">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Full-Funnel Telemetry</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
          Signal to Conversion Velocity
        </h2>
        <p className="text-xs sm:text-sm font-mono text-zinc-400 max-w-2xl">
          Track the complete conversion cycle: from public forum complaints, to personalized first messages, to paying subscribers.
        </p>
      </div>

      {/* -----------------------------------------------------------------
          KEY METRICS TILES
         ----------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800">
          <span className="text-zinc-500 text-xs font-mono block">Reply Rate</span>
          <div className="mt-2 text-3xl font-bold font-display text-purple-400">
            {replyRate}%
          </div>
          <span className="text-[10px] font-mono text-emerald-400 mt-1 block">
            vs 3.2% cold email average
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800">
          <span className="text-zinc-500 text-xs font-mono block">Conversion Rate</span>
          <div className="mt-2 text-3xl font-bold font-display text-emerald-400">
            {conversionRate}%
          </div>
          <span className="text-[10px] font-mono text-zinc-400 mt-1 block">
            From sent outreach
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800">
          <span className="text-zinc-500 text-xs font-mono block">Cost Per Acquired Dev</span>
          <div className="mt-2 text-3xl font-bold font-display text-amber-400">
            Not tracked
          </div>
          <span className="text-[10px] font-mono text-zinc-400 mt-1 block">
            No spend data in Signal yet
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800">
          <span className="text-zinc-500 text-xs font-mono block">Active Pipeline</span>
          <div className="mt-2 text-3xl font-bold font-display text-white">
            {summary.totalSignals}
          </div>
          <span className="text-[10px] font-mono text-zinc-400 mt-1 block">
            Signals captured in workspace
          </span>
        </div>
      </div>

      {/* -----------------------------------------------------------------
          VISUAL FUNNEL STACK
         ----------------------------------------------------------------- */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/90 border border-zinc-800 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" />
            <span>Distribution Funnel</span>
          </h3>
          <span className="text-xs font-mono text-zinc-400">All time</span>
        </div>

        <div className="space-y-4">
          {stages.map((stage, idx) => (
            <div key={stage.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300 font-semibold">{stage.label}</span>
                <span className="text-zinc-400">
                  {stage.count} <span className="text-zinc-600">({stage.pct}%)</span>
                </span>
              </div>
              <div className="w-full bg-zinc-900 h-3 rounded-full overflow-hidden p-0.5 border border-zinc-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stage.pct}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  className={`${stage.color} h-full rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* -----------------------------------------------------------------
          CHANNEL BREAKDOWN & COMPETITOR COMPARISON
         ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Channel Performance Table */}
        <div className="p-6 rounded-3xl bg-zinc-950/90 border border-zinc-800 space-y-4">
          <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-400" />
            <span>Signals by Channel</span>
          </h3>

          <div className="divide-y divide-zinc-900 text-xs font-mono">
            {channels.length === 0 && (
              <div className="py-3 text-zinc-500">
                No signals captured yet — run a scout scan.
              </div>
            )}
            {channels.map((ch) => (
              <div key={ch.key} className="py-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: ch.color }}
                  />
                  <span className="text-zinc-200">{ch.name}</span>
                </div>
                <div className="flex items-center gap-4 text-zinc-400">
                  <span>{ch.signals} sig</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Competitor ROI Stack */}
        <div className="p-6 rounded-3xl bg-zinc-950/90 border border-zinc-800 space-y-4">
          <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Stack Cost vs Competitors</span>
          </h3>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-900 flex items-center justify-between">
              <div>
                <span className="text-white font-bold block">Clay Enterprise</span>
                <span className="text-zinc-500 text-[10px]">No intent scoring • Generic scraper</span>
              </div>
              <span className="text-red-400 font-bold">$185 - $800 / mo</span>
            </div>

            <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-900 flex items-center justify-between">
              <div>
                <span className="text-white font-bold block">Apollo CRM</span>
                <span className="text-zinc-500 text-[10px]">CRM-first • Bloated for solo founders</span>
              </div>
              <span className="text-red-400 font-bold">$49 - $119 / mo</span>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-400 font-bold">Jadai Signal (Pro)</span>
                </div>
                <span className="text-zinc-400 text-[10px]">Full loop from HN signal to conversion</span>
              </div>
              <div className="text-right">
                <span className="text-amber-300 font-black text-sm block">$29 / mo</span>
                <span className="text-emerald-400 text-[10px] font-bold">Save $156+/mo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
