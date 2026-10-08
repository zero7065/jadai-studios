'use client';
import React from 'react';
import { motion } from 'motion/react';

const SATELLITES = [
  { name: 'HN', angle: 0 },
  { name: 'GitHub', angle: 60 },
  { name: 'Reddit', angle: 120 },
  { name: 'X', angle: 180 },
  { name: 'Threads', angle: 240 },
  { name: 'Web', angle: 300 },
];

export function SignalHero({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const handleNav = (path: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (onNavigate) onNavigate(path);
    else window.location.href = path;
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050404] text-[#f5f3f0]">
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,76,0.15),transparent_60%)] pointer-events-none" />

      {/* Central node + satellites */}
      <div className="relative w-[340px] sm:w-[600px] h-[340px] sm:h-[600px] flex items-center justify-center my-auto">
        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 600">
          {SATELLITES.map((s, i) => {
            const rad = (s.angle * Math.PI) / 180;
            const x = 300 + Math.cos(rad) * 220;
            const y = 300 + Math.sin(rad) * 220;
            return (
              <motion.line
                key={i}
                x1="300"
                y1="300"
                x2={x}
                y2={y}
                stroke="url(#goldGradient)"
                strokeWidth="1"
                strokeDasharray="4 4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.4 }}
                transition={{ duration: 1.5, delay: i * 0.1 }}
              />
            );
          })}
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C9A84C" stopOpacity="0" />
              <stop offset="50%" stopColor="#e8c96a" stopOpacity="1" />
              <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Satellites */}
        {SATELLITES.map((s, i) => {
          const rad = (s.angle * Math.PI) / 180;
          const x = Math.cos(rad) * 220;
          const y = Math.sin(rad) * 220;
          return (
            <motion.div
              key={i}
              className="absolute w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-[#0a0908]/90 border border-[rgba(201,168,76,0.3)] flex items-center justify-center text-[#c4c0bb] text-xs font-mono shadow-[0_0_15px_rgba(201,168,76,0.15)]"
              style={{ transform: `translate(${x}px, ${y}px)` }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1, type: 'spring' }}
            >
              {s.name}
            </motion.div>
          );
        })}

        {/* Central node */}
        <motion.div
          className="w-28 sm:w-32 h-28 sm:h-32 rounded-full bg-[#0a0908]/95 border-2 border-[#C9A84C] flex items-center justify-center shadow-[0_0_40px_rgba(201,168,76,0.35)] cursor-pointer"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          onClick={(e) => handleNav('/signal/radar', e)}
        >
          <span className="font-mono text-[#e8c96a] text-base sm:text-lg tracking-widest font-bold">
            SIGNAL
          </span>
        </motion.div>
      </div>

      {/* Hero text */}
      <div className="absolute top-16 sm:top-24 left-1/2 -translate-x-1/2 text-center space-y-3 sm:space-y-4 max-w-2xl px-6 pointer-events-none">
        <h1 className="font-mono text-3xl sm:text-5xl font-bold text-white tracking-tight">
          Find your people.
        </h1>
        <p className="text-[#c4c0bb] text-sm sm:text-lg font-mono">
          Build in public. Track what works. Zero noise.
        </p>
      </div>

      {/* CTAs */}
      <div className="absolute bottom-16 sm:bottom-24 left-1/2 -translate-x-1/2 flex flex-col sm:flex-row gap-3 sm:gap-4 z-20">
        <a
          href="/signal/radar"
          onClick={(e) => handleNav('/signal/radar', e)}
          className="px-8 py-3 rounded-full bg-[#C9A84C] text-[#050404] font-mono text-xs sm:text-sm font-bold tracking-widest hover:bg-[#e8c96a] transition-all text-center shadow-lg cursor-pointer"
        >
          START FREE
        </a>
        <a
          href="#how"
          onClick={(e) => {
            const el = document.getElementById('how');
            if (el) {
              e.preventDefault();
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="px-8 py-3 rounded-full border border-[rgba(201,168,76,0.4)] text-[#c4c0bb] hover:text-[#f5f3f0] hover:border-[#C9A84C] font-mono text-xs sm:text-sm tracking-widest transition-all text-center cursor-pointer"
        >
          SEE HOW
        </a>
      </div>
    </section>
  );
}
