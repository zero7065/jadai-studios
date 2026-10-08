'use client';
import React from 'react';
import { Filter } from 'lucide-react';

export function SignalFilters({
  activePlatform = 'all',
  onChangePlatform,
  activeMinScore = 0,
  onChangeMinScore,
}: {
  activePlatform?: string;
  onChangePlatform?: (p: string) => void;
  activeMinScore?: number;
  onChangeMinScore?: (score: number) => void;
}) {
  const platforms = [
    { id: 'all', label: 'All Sources' },
    { id: 'hackernews', label: 'Hacker News' },
    { id: 'github', label: 'GitHub' },
    { id: 'reddit', label: 'Reddit' },
    { id: 'x', label: 'X (Twitter)' },
    { id: 'threads', label: 'Threads' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#0a0908] border border-[rgba(201,168,76,0.2)]">
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-[#C9A84C] mr-1 hidden sm:inline" />
        {platforms.map((p) => (
          <button
            key={p.id}
            onClick={() => onChangePlatform?.(p.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono transition-colors cursor-pointer ${
              activePlatform === p.id
                ? 'bg-[#C9A84C] text-[#050404] font-bold shadow-sm'
                : 'bg-[#050404] text-[#c4c0bb] hover:text-[#f5f3f0] border border-[rgba(201,168,76,0.15)]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs font-mono text-[#8a6e2a]">
        <span>Min Intent:</span>
        <select
          value={activeMinScore}
          onChange={(e) => onChangeMinScore?.(Number(e.target.value))}
          className="px-2.5 py-1 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0]"
        >
          <option value={0}>All Intent (0%+)</option>
          <option value={50}>Moderate (50%+)</option>
          <option value={70}>High Intent (70%+)</option>
          <option value={85}>Urgent Pain (85%+)</option>
        </select>
      </div>
    </div>
  );
}
