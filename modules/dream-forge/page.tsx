import React from 'react';
import GlassCard from '../../components/ui/GlassCard';
import StatusBadge from '../../components/ui/StatusBadge';

export default function DreamForgePage() {
  return (
    <div className="py-12 px-4 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">Creation Suite</span>
          <h1 className="text-3xl font-display text-[#f5f3f0] mt-1">Dream Forge</h1>
        </div>
        <StatusBadge status="Live" variant="gold" />
      </div>
      <GlassCard className="p-6 space-y-3">
        <p className="text-sm text-[#c4c0bb] leading-relaxed">
          Turn concepts and vision documents into actionable architectural blueprints and technical roadmaps.
        </p>
        <div className="p-4 rounded bg-[#050404] border border-[rgba(201,168,76,0.15)] text-xs font-mono text-[#8a6e2a]">
          Prompt 2 implements the multi-step intake flow and PRIME-powered architectural blueprint generator.
        </div>
      </GlassCard>
    </div>
  );
}
