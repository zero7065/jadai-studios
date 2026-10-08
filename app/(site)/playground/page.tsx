'use client';

import React, { useState } from 'react';
import EdgeGlow from '@/components/ui/EdgeGlow';
import StatusBadge from '@/components/ui/StatusBadge';
import ModuleIcon from '@/components/ui/ModuleIcon';
import Button from '@/components/ui/Button';
import { PLAYGROUND_TOOLS } from '@/lib/data/playgroundTools';
import { StudioAudio } from '@/lib/watermark';
import { Terminal, Sparkles, ArrowRight, FolderGit2, Search, Filter } from 'lucide-react';

import DefensiveFallback from '@/components/ui/DefensiveFallback';

export default function PlaygroundPage({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const [hasError, setHasError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Live' | 'In Build'>('All');

  if (hasError) return <DefensiveFallback onNavigate={onNavigate} />;

  let filtered: any[] = [];
  try {
    filtered = PLAYGROUND_TOOLS.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.what.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.why.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' ? true : t.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  } catch {
    filtered = [];
  }

  const handleLaunch = (slug: string) => {
    StudioAudio.playClick();
    const path = `/playground/${slug}`;
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10 text-[#c4c0bb]">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.25)] text-[#C9A84C] text-[10px] font-mono uppercase tracking-[0.25em]">
          <Terminal className="w-3.5 h-3.5" />
          <span>Studio Tool Chamber</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-[#f5f3f0]">
          The Playground
        </h1>
        <p className="text-sm font-mono text-[#8a6e2a] leading-relaxed">
          12 purpose-built utility engines engineered for founders, architects, and writers.
          Zero fluff. Pure mathematical leverage.
        </p>

        {/* Quick Search & Draft Link */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a6e2a]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search 12 sovereign tools..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0a0908] border border-[rgba(201,168,76,0.25)] text-xs font-mono text-[#f5f3f0] placeholder:text-neutral-600 focus:outline-none focus:border-[#C9A84C]"
            />
          </div>

          <a
            href="/account/workspace"
            onClick={(e) => {
              e.preventDefault();
              onNavigate ? onNavigate('/account/workspace') : (window.location.href = '/account/workspace');
            }}
            className="px-4 py-2 rounded-xl bg-[#0a0908] border border-[rgba(201,168,76,0.25)] hover:border-[#C9A84C] text-xs font-mono text-[#f5f3f0] flex items-center gap-2 transition-all"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-[#C9A84C]" />
            <span>Open Saved Drafts</span>
          </a>
        </div>
      </div>

      {/* 12 Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((tool) => (
          <div
            key={tool.slug}
            onClick={() => handleLaunch(tool.slug)}
            className="cursor-pointer group h-full"
          >
            <EdgeGlow
              intensity="subtle"
              color="gold"
              borderRadius={24}
              className="h-full w-full block transition-transform duration-300 group-hover:-translate-y-1"
            >
              <div
                style={{ borderRadius: '24px' }}
                className="relative h-full flex flex-col justify-between p-6 bg-[#0a0908]/90 border border-[rgba(201,168,76,0.2)] group-hover:border-[#C9A84C] transition-all duration-300 shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl overflow-hidden"
              >
                {/* Background image overlay */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity scale-105 group-hover:scale-100"
                  style={{ backgroundImage: `url(${tool.backgroundImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050404] via-[#050404]/80 to-transparent pointer-events-none" />

                {/* Top Strip */}
                <div className="relative z-10 flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.25)] flex items-center justify-center p-2.5 group-hover:border-[#C9A84C] transition-colors shadow-inner">
                    <ModuleIcon name={tool.iconName} size={24} />
                  </div>
                  <StatusBadge status={tool.status} variant="gold" size="sm" />
                </div>

                {/* Title & Lore */}
                <div className="relative z-10 space-y-2 mb-4">
                  <h3 className="text-xl font-display font-bold text-[#f5f3f0] group-hover:text-[#e8c96a] transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs font-mono text-[#8a6e2a] italic line-clamp-2">
                    "{tool.why}"
                  </p>
                  <p className="text-xs text-[#c4c0bb] line-clamp-3 leading-relaxed pt-1">
                    {tool.what}
                  </p>
                </div>

                {/* Bottom Action */}
                <div className="relative z-10 pt-4 border-t border-[rgba(201,168,76,0.15)] flex items-center justify-between text-xs font-mono mt-auto">
                  <span className="text-[10px] text-[#8a6e2a] uppercase tracking-wider">
                    {tool.guestLimitPerDay ? `${tool.guestLimitPerDay} Scans/Day Free` : 'Subscribers Only'}
                  </span>
                  <div className="flex items-center gap-1 text-[#e8c96a] group-hover:translate-x-1 transition-transform font-bold">
                    <span>Launch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </EdgeGlow>
          </div>
        ))}
      </div>
    </div>
  );
}
