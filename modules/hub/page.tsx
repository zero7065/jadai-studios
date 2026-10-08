import React from 'react';
import GlassCard from '../../components/ui/GlassCard';
import StatusBadge from '../../components/ui/StatusBadge';

export default function HubModulePage() {
  return (
    <div className="py-12 px-4 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">Collaborative Ecosystem</span>
          <h1 className="text-3xl font-display text-[#f5f3f0] mt-1">JadaiHub Collaborative</h1>
        </div>
        <StatusBadge status="Live" variant="gold" />
      </div>
      <GlassCard className="p-6 space-y-3">
        <p className="text-sm text-[#c4c0bb] leading-relaxed">
          Decentralized talent, freelance missions, peer code reviews, and tactical collaborations.
        </p>
      </GlassCard>
    </div>
  );
}
