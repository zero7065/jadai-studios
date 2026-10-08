import React from 'react';
import WorkCarousel from '@/components/sections/WorkCarousel';
import PortfolioCard from '@/components/content/PortfolioCard';
import { getAllProjects } from '@/lib/data/portfolio';

import DefensiveFallback from '@/components/ui/DefensiveFallback';

export default function WorkPage() {
  let projects: any[] = [];
  try {
    projects = getAllProjects();
  } catch (err) {
    console.warn('WorkPage error:', err);
    return <DefensiveFallback />;
  }

  return (
    <div className="py-12 px-4 max-w-6xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A84C]">
          Proof of Architecture
        </span>
        <h1 className="text-4xl sm:text-6xl font-display font-bold text-[#f5f3f0] tracking-wide">
          Selected Works
        </h1>
        <p className="text-sm font-mono text-[#8a6e2a]">
          Live production architectures, edge consoles, and sovereign platforms.
        </p>
      </div>

      {/* Main Feature: Holographic Browser Frame Carousel */}
      <WorkCarousel />

      {/* Comprehensive Grid of all projects */}
      <div className="space-y-6 pt-12 border-t border-[rgba(201,168,76,0.15)]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-[#f5f3f0]">
            Complete Repository & Frame Archive
          </h2>
          <span className="text-xs font-mono text-[#8a6e2a]">
            {projects.length} Works Registered
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, idx) => (
            <PortfolioCard key={p.id} project={p} index={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}
