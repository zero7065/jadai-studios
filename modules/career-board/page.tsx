import React from 'react';
import GlassCard from '../../components/ui/GlassCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { CAREER_MISSIONS } from './data';

export default function CareerBoardPage() {
  return (
    <div className="py-12 px-4 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#C9A84C]">Mission Board</span>
          <h1 className="text-3xl font-display text-[#f5f3f0] mt-1">Career &amp; Mission Board</h1>
        </div>
        <StatusBadge status="Coming Soon" variant="dim" />
      </div>

      <GlassCard className="p-6 space-y-3">
        <p className="text-sm text-[#c4c0bb] leading-relaxed">
          High-impact technology and design missions for developers building beyond standard ceilings.
        </p>
        <p className="text-xs font-mono text-[#8a857e]">
          Pipeline preview — the board goes live with the JadaiHub public launch. Nothing below is an active posting yet.
        </p>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CAREER_MISSIONS.map((mission) => (
          <GlassCard key={mission.id} className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display font-bold text-[#f5f3f0]">{mission.title}</h2>
                <p className="text-xs font-mono text-[#8a857e] mt-0.5">
                  {mission.org} · {mission.type} · {mission.mode}
                </p>
              </div>
              <StatusBadge
                status={mission.status === 'preview' ? 'Preview' : 'Pipeline'}
                variant="dim"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {mission.stack.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 rounded-full border border-[rgba(201,168,76,0.25)] text-[10px] font-mono text-[#c9a84c]"
                >
                  {tech}
                </span>
              ))}
            </div>
            <p className="text-xs font-mono text-[#e8c96a]">{mission.compBand}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
