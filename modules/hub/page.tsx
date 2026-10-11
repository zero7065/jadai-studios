import React from 'react';
import GlassCard from '../../components/ui/GlassCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { HUB_LISTINGS } from './data';

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
        <p className="text-xs font-mono text-[#8a857e]">
          Curated board — apply through hello@jadai.dev until public JadaiHub accounts open.
        </p>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {HUB_LISTINGS.map((listing) => (
          <GlassCard key={listing.id} className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display font-bold text-[#f5f3f0]">{listing.title}</h2>
                <p className="text-xs font-mono text-[#8a857e] mt-0.5">
                  {listing.role} · {listing.mode} · {listing.engagement}
                </p>
              </div>
              <StatusBadge
                status={listing.status === 'open' ? 'Open' : 'Reviewing'}
                variant={listing.status === 'open' ? 'emerald' : 'gold'}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {listing.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded-full border border-[rgba(201,168,76,0.25)] text-[10px] font-mono text-[#c9a84c]"
                >
                  {skill}
                </span>
              ))}
            </div>
            <p className="text-xs font-mono text-[#e8c96a]">{listing.budgetBand}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
