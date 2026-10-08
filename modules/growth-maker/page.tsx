import React from 'react';
import GlassCard from '../../components/ui/GlassCard';
import StatusBadge from '../../components/ui/StatusBadge';

export default function GrowthMakerPage() {
  return (
    <div className="py-12 px-4 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">Growth Strategy</span>
          <h1 className="text-3xl font-display text-[#f5f3f0] mt-1">Growth Strategy Engine</h1>
        </div>
        <StatusBadge status="Coming Soon" variant="dim" />
      </div>
      <GlassCard className="p-6 space-y-3">
        <p className="text-sm text-[#c4c0bb] leading-relaxed">
          Autonomous growth roadmaps, conversion teardowns, and market penetration models.
        </p>
      </GlassCard>
    </div>
  );
}
