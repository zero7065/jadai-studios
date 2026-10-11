import React from 'react';
import GlassCard from '../../components/ui/GlassCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { MARKET_TEMPLATES } from './data';

export default function TemplateMarketPage() {
  return (
    <div className="py-12 px-4 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">Elite Catalog</span>
          <h1 className="text-3xl font-display text-[#f5f3f0] mt-1">Elite Template Market</h1>
        </div>
        <StatusBadge status="Live" variant="gold" />
      </div>

      <GlassCard className="p-6 space-y-3">
        <p className="text-sm text-[#c4c0bb] leading-relaxed">
          Production-grade boilerplates, luxury design systems, and resilient infrastructure starter kits.
        </p>
        <p className="text-xs font-mono text-[#8a857e]">
          Acquisition routes through hello@jadai.dev — no self-serve checkout yet.
        </p>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MARKET_TEMPLATES.map((tmpl) => (
          <GlassCard key={tmpl.id} className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a]">
                  {tmpl.category}
                </span>
                <h2 className="font-display font-bold text-[#f5f3f0] mt-1">{tmpl.name}</h2>
              </div>
              <StatusBadge
                status={tmpl.status === 'available' ? 'Available' : 'In Build'}
                variant={tmpl.status === 'available' ? 'emerald' : 'dim'}
              />
            </div>
            <p className="text-sm text-[#c4c0bb] leading-relaxed">{tmpl.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {tmpl.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full border border-[rgba(201,168,76,0.25)] text-[10px] font-mono text-[#c9a84c]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-xs font-mono text-[#e8c96a]">{tmpl.price}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
