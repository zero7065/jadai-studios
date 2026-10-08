'use client';

import React, { ReactNode, useState } from 'react';
import { motion } from 'motion/react';

export interface EdgeGlowProps extends React.HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  intensity?: 'subtle' | 'medium' | 'intense';
  color?: 'gold' | 'crimson' | 'cyan' | 'dual';
  borderRadius?: number | string;
  pulse?: boolean;
  className?: string;
  as?: 'div' | 'button' | 'a' | any;
  disabled?: boolean;
}

export function EdgeGlow({
  children,
  intensity = 'medium',
  color = 'gold',
  borderRadius = 12,
  pulse = true,
  className = '',
  as: Tag = 'div',
  disabled = false,
  ...props
}: EdgeGlowProps) {
  const [isHovered, setIsHovered] = useState(false);

  const radiusValue = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius;

  const colorMap = {
    gold: ['var(--gold-300, #C9A84C)', 'var(--gold-100, #e8c96a)', 'var(--gold-300, #C9A84C)'],
    crimson: ['var(--crimson-200, #C0392B)', 'var(--crimson-100, #e85a4f)', 'var(--crimson-200, #C0392B)'],
    cyan: ['var(--cyan-300, #0ea5e9)', 'var(--cyan-100, #7dd3fc)', 'var(--cyan-300, #0ea5e9)'],
    dual: ['var(--gold-300, #C9A84C)', 'var(--crimson-200, #C0392B)', 'var(--gold-300, #C9A84C)'],
  };

  const blurMap = { subtle: 2, medium: 5, intense: 10 };
  const blur = isHovered ? blurMap[intensity] * 1.4 : blurMap[intensity];
  const [c1, c2, c3] = colorMap[color] || colorMap.gold;

  const Component: any = Tag;

  return (
    <Component
      className={`edge-glow-wrapper relative inline-flex group ${
        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
      } ${className}`}
      style={{
        borderRadius: radiusValue,
        position: 'relative',
        isolation: 'isolate',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Outer rotating glow ring */}
      <motion.div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: -2,
          borderRadius: radiusValue,
          background: `conic-gradient(from 0deg, transparent 0%, ${c1} 20%, ${c2} 40%, transparent 60%, ${c3} 80%, transparent 100%)`,
          filter: `blur(${blur}px)`,
          zIndex: -1,
          pointerEvents: 'none',
          opacity: isHovered ? 1 : intensity === 'subtle' ? 0.6 : intensity === 'medium' ? 0.8 : 1,
        }}
        animate={pulse ? { rotate: 360 } : {}}
        transition={{
          duration: isHovered ? 2 : 4,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Static subtle border */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: radiusValue,
          border: `1px solid ${color === 'crimson' ? 'rgba(192, 57, 43, 0.4)' : color === 'cyan' ? 'rgba(14, 165, 233, 0.4)' : 'rgba(201, 168, 76, 0.35)'}`,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Content layer */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          borderRadius: radiusValue,
          width: '100%',
          height: '100%',
        }}
      >
        {children}
      </div>
    </Component>
  );
}

export default EdgeGlow;
