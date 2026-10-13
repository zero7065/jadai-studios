import React from 'react';
import WorkCarousel from '@/components/sections/WorkCarousel';
import WorkArchive from '@/components/sections/WorkArchive';

import DefensiveFallback from '@/components/ui/DefensiveFallback';

export default function WorkPage() {
  try {
    // Page shell only — data loading lives in WorkArchive (client).
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

      {/* Comprehensive Grid of all projects (live registry + preview modal) */}
      <WorkArchive />
    </div>
  );
}
