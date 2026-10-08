'use client';

import React from 'react';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverGlow?: boolean;
  glowColor?: 'gold' | 'crimson' | 'dual';
  glowIntensity?: 'subtle' | 'medium' | 'intense';
  borderRadius?: number | string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hoverGlow = true,
  glowColor = 'gold',
  glowIntensity = 'subtle',
  borderRadius = 12,
  style,
  ...props
}) => {
  const radiusVal = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius;

  return (
    <div
      className={`w-full p-5 relative overflow-hidden transition-all duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] hover:-translate-y-0.5 bg-[var(--glass-fill)] backdrop-blur-[var(--glass-blur)] shadow-sm hover:shadow-[var(--glass-glow)] ${className}`}
      style={{ borderRadius: radiusVal, ...style }}
      {...props}
    >
      {/* Soft top-edge highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--glass-highlight)] to-transparent pointer-events-none" />
      {children}
    </div>
  );
};

export default GlassCard;
