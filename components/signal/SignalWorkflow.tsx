'use client';
import React from 'react';
import { Radar, MessageSquare, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';

export function SignalWorkflow() {
  const steps = [
    {
      num: '01',
      title: 'Scout Detects Intent',
      desc: 'Monitors Hacker News, GitHub, and Reddit for active developer pain points. Filters out brand noise, scoring 0-100% genuine buying intent.',
      icon: Radar,
    },
    {
      num: '02',
      title: 'Closer Formulates First Outreach',
      desc: 'Generates personal, non-pitch conversation starters referencing their exact post. DMs under 300 chars tailored to sound like a peer builder.',
      icon: MessageSquare,
    },
    {
      num: '03',
      title: 'Writer Turns Commits Into Content',
      desc: 'Converts daily git commits and architecture decisions into high-signal build-in-public posts for X, LinkedIn, and Reddit.',
      icon: Sparkles,
    },
    {
      num: '04',
      title: 'Analytics Tracks Conversion',
      desc: 'Traces leads from discovery to reply and conversion. Closed-loop attribution shows exactly which channels yield high-value clients.',
      icon: TrendingUp,
    },
  ];

  return (
    <section id="how" className="py-24 px-6 max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A84C]">
          The Signal Flywheel
        </span>
        <h2 className="text-3xl sm:text-4xl font-mono font-bold text-[#f5f3f0]">
          How Signal Works
        </h2>
        <p className="text-sm font-mono text-[#8a6e2a] max-w-xl mx-auto">
          An autonomous system that listens, drafts, and distributes so solo builders can focus on code.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.num}
              className="p-6 rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.2)] hover:border-[#C9A84C] transition-all duration-200 space-y-4 shadow-lg group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.3)] flex items-center justify-center text-[#e8c96a] group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-mono text-xs font-bold text-[#8a6e2a]">
                  {s.num}
                </span>
              </div>
              <h3 className="font-display font-bold text-base text-[#f5f3f0]">
                {s.title}
              </h3>
              <p className="text-xs text-[#c4c0bb] leading-relaxed">
                {s.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
