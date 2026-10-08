'use client';

import React from 'react';
import PersistentAtmosphereCanvas from './PersistentAtmosphereCanvas';

export interface LivingAtmosphereProps {
  currentPath?: string;
}

/**
 * LivingAtmosphere uses a single persistent React.memoized canvas layer
 * across path transitions, only updating visual properties based on path changes,
 * to reduce paint overhead and eliminate layout thrash.
 */
export const LivingAtmosphere: React.FC<LivingAtmosphereProps> = React.memo(({ currentPath = '/' }) => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden select-none"
      style={{ zIndex: 0 }}
    >
      {/* Single persistent React.memoized canvas layer */}
      <PersistentAtmosphereCanvas currentPath={currentPath} />

      {/* Subtle deep background vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 100% 70% at 50% 0%, rgba(201,168,76,0.03) 0%, transparent 70%)',
        }}
      />
    </div>
  );
});

LivingAtmosphere.displayName = 'LivingAtmosphere';

export default LivingAtmosphere;
