'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface SigilProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

export const Sigil: React.FC<SigilProps> = ({
  size = 'md',
  className = '',
  animate = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Pause micro-animation when off-screen or tab is hidden
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting && !document.hidden);
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
    };
  }, []);

  const sizeStyles = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  const shouldAnimate = animate && isVisible;

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center justify-center shrink-0 ${sizeStyles} ${className}`}
      aria-label="Jadai Studios Sigil"
    >
      <svg
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-[var(--gold)]"
      >
        <defs>
          <linearGradient id="goldSigilGrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#e8c96a" />
            <stop offset="0.5" stopColor="#C9A84C" />
            <stop offset="1" stopColor="#8a6e2a" />
          </linearGradient>
          <filter id="sigilGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Rhombus Diamond: Slow stroke-draw pulse */}
        <polygon
          points="22,2 42,22 22,42 2,22"
          stroke="url(#goldSigilGrad)"
          strokeWidth="1.5"
          strokeDasharray="160"
          strokeDashoffset={shouldAnimate ? 0 : 0}
          style={{
            animation: shouldAnimate ? 'sigilStrokeDraw 8s linear infinite alternate' : 'none',
          }}
        />

        {/* Inner Rotated Sacred Square: Slow micro-rotation */}
        <g
          style={{
            transformOrigin: '22px 22px',
            animation: shouldAnimate ? 'sigilRotateSlow 24s linear infinite' : 'none',
          }}
        >
          <rect
            x="12"
            y="12"
            width="20"
            height="20"
            stroke="#C9A84C"
            strokeWidth="1"
            strokeOpacity="0.85"
            transform="rotate(45 22 22)"
          />
          {/* 4 connecting vertex dots */}
          <circle cx="22" cy="7.8" r="1.2" fill="#e8c96a" />
          <circle cx="36.2" cy="22" r="1.2" fill="#e8c96a" />
          <circle cx="22" cy="36.2" r="1.2" fill="#e8c96a" />
          <circle cx="7.8" cy="22" r="1.2" fill="#e8c96a" />
        </g>

        {/* Central Core with Faint Resonance Ring */}
        <circle
          cx="22"
          cy="22"
          r="6"
          stroke="url(#goldSigilGrad)"
          strokeWidth="0.8"
          strokeDasharray="2 3"
          style={{
            transformOrigin: '22px 22px',
            animation: shouldAnimate ? 'sigilRotateReverse 14s linear infinite' : 'none',
          }}
        />
        <circle cx="22" cy="22" r="2.8" fill="#e8c96a" filter="url(#sigilGlow)" />
      </svg>
    </div>
  );
};

export default Sigil;
