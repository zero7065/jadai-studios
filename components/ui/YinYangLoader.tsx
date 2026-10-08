'use client';

import React, { useState, useEffect } from 'react';
import SacredGeometry from './SacredGeometry';

export interface YinYangLoaderProps {
  size?: number;
  text?: string;
  className?: string;
  fullscreen?: boolean;
  active?: boolean;
  showAura?: boolean;
}

export const YinYangLoader: React.FC<YinYangLoaderProps> = ({
  size = 120,
  text,
  className = '',
  fullscreen = false,
  active = true,
  showAura = false,
}) => {
  const words = ['Assembling', 'Connecting', 'Preparing'];
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    if (text) return;
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [text]);

  const activeText = text || words[wordIndex];

  const content = (
    <div className={`flex flex-col items-center justify-center gap-6 p-6 ${className}`}>
      {/* 120px Yin-yang dual counter-rotating mechanism */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* Outer Halo */}
        <div
          className="absolute -inset-2 rounded-full border border-[rgba(201,168,76,0.25)] animate-pulse"
          style={{ width: size + 16, height: size + 16, left: -8, top: -8 }}
        />

        {/* Counter-rotating Half A (Clockwise 8s) */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden border border-[#C9A84C]/50 shadow-[0_0_25px_rgba(201,168,76,0.3)]"
          style={{
            animation: 'yinSpin 8s linear infinite',
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Dark Void Half */}
            <path d="M50 0 A50 50 0 0 0 50 100 A25 25 0 0 1 50 50 A25 25 0 0 0 50 0" fill="#050404" />
            {/* Gold Accent Half */}
            <path d="M50 0 A50 50 0 0 1 50 100 A25 25 0 0 1 50 50 A25 25 0 0 0 50 0" fill="#C9A84C" />
            {/* Dots */}
            <circle cx="50" cy="25" r="7" fill="#C9A84C" />
            <circle cx="50" cy="75" r="7" fill="#050404" />
          </svg>
        </div>

        {/* Counter-rotating Center Sigil (Counter-clockwise 8s) */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            animation: 'yangSpin 8s linear infinite',
          }}
        >
          <div className="w-9 h-9 rounded-full bg-[#050404]/90 border border-[#e8c96a] flex items-center justify-center shadow-lg">
            <SacredGeometry size={18} className="text-[#e8c96a]" />
          </div>
        </div>
      </div>

      {/* Harmonic Label */}
      <div className="flex flex-col items-center gap-1.5 text-center">
        <span className="text-xs font-mono tracking-[0.25em] text-[#C9A84C] uppercase transition-all duration-300">
          {activeText}
        </span>
        <span className="text-[10px] font-mono text-[#8a6e2a]">
          Jadai Studios • Build Different
        </span>
      </div>

      <style>{`
        @keyframes yinSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes yangSpin {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[999] bg-[#050404]/95 backdrop-blur-md flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default YinYangLoader;
