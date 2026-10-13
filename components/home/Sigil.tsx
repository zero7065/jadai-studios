'use client';

import React, { useState, useRef } from 'react';

export interface SigilProps {
  size?: number;
  className?: string;
}

/**
 * Jadai Studios hexagonal sigil — the ONE purposeful animated brand element.
 * - Outer rings rotate slowly (90s per rotation, CSS only)
 * - Hover/tap: expands 20%, ripple rings spread, tooltip fades in
 * - Double-click / double-tap: opens the PRIME Guide Bee chat panel
 * - This element is the only one on the home hero with will-change: transform
 */
export const Sigil: React.FC<SigilProps> = ({ size = 180, className = '' }) => {
  const [hovered, setHovered] = useState(false);
  const lastTapRef = useRef(0);
  const center = size / 2;
  const rOuter = size * 0.46;
  const rMid = size * 0.36;
  const rInner = size * 0.26;

  const openGuideBee = () => {
    try {
      window.dispatchEvent(new CustomEvent('jadai_open_guidebee'));
    } catch {}
  };

  const handleDoubleAction = () => {
    openGuideBee();
  };

  const handlePointerUp = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      handleDoubleAction();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  const hexPoints = (r: number) =>
    Array.from({ length: 6 })
      .map((_, i) => {
        const a = (i * 60 - 90) * (Math.PI / 180);
        return `${center + r * Math.cos(a)},${center + r * Math.sin(a)}`;
      })
      .join(' ');

  const nodes = Array.from({ length: 12 }).map((_, i) => {
    const ring = i < 6 ? rInner : rMid;
    const a = ((i < 6 ? i * 60 : (i - 6) * 60 + 30) - 90) * (Math.PI / 180);
    return { x: center + ring * Math.cos(a), y: center + ring * Math.sin(a), id: i };
  });

  return (
    <div
      className={`relative inline-flex flex-col items-center select-none ${className}`}
      style={{ willChange: 'transform' }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onPointerUp={handlePointerUp}
      onDoubleClick={handleDoubleAction}
      role="button"
      tabIndex={0}
      aria-label="Jadai Studios sigil — double-click opens the PRIME guide"
      onKeyDown={(e) => {
        if (e.key === 'Enter') openGuideBee();
      }}
    >
      <div
        className="relative"
        style={{
          width: size,
          height: size,
          transform: hovered ? 'scale(1.2)' : 'scale(1)',
          transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'transform',
        }}
      >
        {/* Ripple rings — spread outward on hover */}
        {[0, 1].map((idx) => (
          <div
            key={idx}
            className="absolute rounded-full border pointer-events-none"
            style={{
              inset: -size * 0.08 * (idx + 1),
              borderColor: `rgba(201, 168, 76, ${hovered ? 0.35 - idx * 0.15 : 0})`,
              transform: hovered ? `scale(${1 + (idx + 1) * 0.12})` : 'scale(0.85)',
              opacity: hovered ? 1 : 0,
              transition: `transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${idx * 80}ms, opacity 0.5s ease ${idx * 80}ms`,
            }}
          />
        ))}

        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="block overflow-visible"
        >
          <defs>
            <linearGradient id="sigilGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff8e7" />
              <stop offset="45%" stopColor="#e8c96a" />
              <stop offset="100%" stopColor="#8a6e2a" />
            </linearGradient>
            <radialGradient id="sigilCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#e8c96a" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#8a6e2a" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Outer hex ring — rotates 90s per revolution (CSS only) */}
          <g
            style={{
              transformOrigin: `${center}px ${center}px`,
              animation: 'jadaiSigilSpin90 90s linear infinite',
            }}
          >
            <polygon
              points={hexPoints(rOuter)}
              fill="none"
              stroke="url(#sigilGold)"
              strokeWidth="1.4"
              strokeOpacity="0.85"
            />
            {/* 6 outer notches */}
            {Array.from({ length: 6 }).map((_, i) => {
              const a = (i * 60 - 90) * (Math.PI / 180);
              const x1 = center + (rOuter - 4) * Math.cos(a);
              const y1 = center + (rOuter - 4) * Math.sin(a);
              const x2 = center + (rOuter + 6) * Math.cos(a);
              const y2 = center + (rOuter + 6) * Math.sin(a);
              return (
                <line
                  key={`notch-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#fde08b"
                  strokeWidth="1.3"
                  strokeOpacity="0.9"
                />
              );
            })}
          </g>

          {/* Mid hex ring — counter-rotates at the same 90s cadence */}
          <g
            style={{
              transformOrigin: `${center}px ${center}px`,
              animation: 'jadaiSigilSpin90r 90s linear infinite',
            }}
          >
            <polygon
              points={hexPoints(rMid)}
              fill="none"
              stroke="url(#sigilGold)"
              strokeWidth="1"
              strokeOpacity="0.6"
              strokeDasharray="7 5"
            />
          </g>

          {/* Inner static hex + Metatron lines */}
          <polygon
            points={hexPoints(rInner)}
            fill="none"
            stroke="url(#sigilGold)"
            strokeWidth="1.1"
            strokeOpacity="0.8"
          />
          {nodes.map((n1, i) =>
            nodes.slice(i + 1).map((n2, j) => (
              <line
                key={`m-${i}-${j}`}
                x1={n1.x}
                y1={n1.y}
                x2={n2.x}
                y2={n2.y}
                stroke="#C9A84C"
                strokeWidth="0.55"
                strokeOpacity={hovered ? 0.4 : 0.22}
                style={{ transition: 'stroke-opacity 0.4s ease' }}
              />
            ))
          )}

          {/* 12 sacred nodes */}
          {nodes.map((n) => (
            <g key={`n-${n.id}`}>
              <circle cx={n.x} cy={n.y} r={size * 0.028} fill="url(#sigilCore)" />
              <circle
                cx={n.x}
                cy={n.y}
                r={size * 0.014}
                fill="#fffdf5"
              />
            </g>
          ))}

          {/* Center star */}
          <polygon
            points={`${center},${center - size * 0.085} ${center + size * 0.062},${center} ${center},${
              center + size * 0.085
            } ${center - size * 0.062},${center}`}
            fill="url(#sigilGold)"
            stroke="#ffffff"
            strokeWidth="0.9"
          />
          <polygon
            points={`${center},${center - size * 0.062} ${center + size * 0.085},${center} ${center},${
              center + size * 0.062
            } ${center - size * 0.085},${center}`}
            fill="url(#sigilGold)"
            stroke="#ffffff"
            strokeWidth="0.6"
            opacity="0.85"
          />
          <circle cx={center} cy={center} r={size * 0.022} fill="#ffffff" />

          <style>{`
            @keyframes jadaiSigilSpin90 {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes jadaiSigilSpin90r {
              from { transform: rotate(0deg); }
              to { transform: rotate(-360deg); }
            }
          `}</style>
        </svg>
      </div>

      {/* Tooltip — fades in below on hover */}
      <div
        className="mt-3 text-center pointer-events-none"
        style={{
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(4px)',
          transition: 'opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s',
        }}
      >
        <span className="text-[11px] font-mono tracking-[0.22em] text-[#e8c96a] uppercase whitespace-nowrap">
          ⬡ JADAI STUDIOS — Code. Story. Frame.
        </span>
      </div>
    </div>
  );
};

export default Sigil;
