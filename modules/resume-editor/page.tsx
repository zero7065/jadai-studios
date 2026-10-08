import React from 'react';
import GlassCard from '../../components/ui/GlassCard';
import StatusBadge from '../../components/ui/StatusBadge';

export default function ResumeEditorPage() {
  return (
    <div className="py-12 px-4 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">Career Engineering</span>
          <h1 className="text-3xl font-display text-[#f5f3f0] mt-1">Architectural Resume Editor</h1>
        </div>
        <StatusBadge status="Beta" variant="gold" />
      </div>
      <GlassCard className="p-6 space-y-3">
        <p className="text-sm text-[#c4c0bb] leading-relaxed">
          Ruthless resume scoring, Pareto summarization, and executive voice rewriting for top-tier engineers.
        </p>
      </GlassCard>
    </div>
  );
}
