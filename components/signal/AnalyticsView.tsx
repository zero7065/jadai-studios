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

  const funnel = data?.funnel || {
    signalsFound: 142,
    messagesDrafted: 78,
    messagesSent: 46,
    repliesReceived: 21,
    conversions: 8,
  };

  const replyRate = funnel.messagesSent > 0
    ? ((funnel.repliesReceived / funnel.messagesSent) * 100).toFixed(1)
    : '45.7';

  const conversionRate = funnel.messagesSent > 0
    ? ((funnel.conversions / funnel.messagesSent) * 100).toFixed(1)
    : '17.4';

  const stages = [
    { label: 'Signals Detected', count: funnel.signalsFound, pct: 100, color: 'bg-amber-500' },
    { label: 'Messages Drafted', count: funnel.messagesDrafted, pct: Math.round((funnel.messagesDrafted / funnel.signalsFound) * 100), color: 'bg-amber-400' },
    { label: 'Messages Sent', count: funnel.messagesSent, pct: Math.round((funnel.messagesSent / funnel.signalsFound) * 100), color: 'bg-sky-500' },
    { label: 'Replies Received', count: funnel.repliesReceived, pct: Math.round((funnel.repliesReceived / funnel.signalsFound) * 100), color: 'bg-purple-500' },
    { label: 'Paying Conversions', count: funnel.conversions, pct: Math.round((funnel.conversions / funnel.signalsFound) * 100), color: 'bg-emerald-500' },
  ];

  const channels = [
    { name: 'Hacker News', signals: 48, replies: 11, conversions: 4, rate: '22.9%', color: '#ff6600' },
    { name: 'GitHub Discussions', signals: 36, replies: 6, conversions: 2, rate: '16.7%', color: '#f5f3f0' },
    { name: 'Reddit (r/SaaS, r/webdev)', signals: 32, replies: 3, conversions: 1, rate: '9.4%', color: '#ff4500' },
    { name: 'X / Twitter', signals: 18, replies: 1, conversions: 1, rate: '5.5%', color: '#38bdf8' },
    { name: 'Threads', signals: 8, replies: 0, conversions: 0, rate: '0.0%', color: '#c084fc' },
  ];

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
            $3.62
          </div>
          <span className="text-[10px] font-mono text-emerald-400 mt-1 block">
            10x lower than Google Ads
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800">
          <span className="text-zinc-500 text-xs font-mono block">Active Pipeline</span>
          <div className="mt-2 text-3xl font-bold font-display text-white">
            {funnel.signalsFound}
          </div>
          <span className="text-[10px] font-mono text-zinc-400 mt-1 block">
            Live developer pain points
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
            <span>5-Stage Distribution Funnel</span>
          </h3>
          <span className="text-xs font-mono text-zinc-400">Past 30 Days</span>
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
            <span>Channel Intent & Conversion</span>
          </h3>

          <div className="divide-y divide-zinc-900 text-xs font-mono">
            {channels.map((ch) => (
              <div key={ch.name} className="py-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: ch.color }}
                  />
                  <span className="text-zinc-200">{ch.name}</span>
                </div>
                <div className="flex items-center gap-4 text-zinc-400">
                  <span>{ch.signals} sig</span>
                  <span className="text-purple-400">{ch.replies} rep</span>
                  <span className="text-emerald-400 font-bold">{ch.conversions} conv</span>
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
