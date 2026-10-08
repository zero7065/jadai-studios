import React from 'react';
import { Eye, BookOpen, Sparkles, ShoppingBag, Users, Layers } from 'lucide-react';

export const SystemsCircle: React.FC = () => {
  const nodes = [
    { label: 'Studio Core', path: '/services', icon: Layers, angle: 0 },
    { label: 'PRIME Oracle', path: '/oracle', icon: Eye, angle: 60 },
    { label: 'Book of Lies', path: '/book-of-lies', icon: BookOpen, angle: 120 },
    { label: 'JadaiHub', path: '/hub', icon: Users, angle: 180 },
    { label: 'Dream Forge', path: '/dream-forge', icon: Sparkles, angle: 240 },
    { label: 'Marketplace', path: '/marketplace', icon: ShoppingBag, angle: 300 },
  ];

  return (
    <div className="relative py-16 flex flex-col items-center justify-center">
      <div className="text-center mb-10 space-y-2">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A84C]">
          System Constellation
        </span>
        <h2 className="text-3xl font-display font-bold text-[#f5f3f0]">
          The Interconnected Matrix
        </h2>
        <p className="text-xs font-mono text-[#8a6e2a]">
          Six sovereign verticals revolving around one unified architectural floor.
        </p>
      </div>

      {/* Orbit Container */}
      <div className="relative w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] flex items-center justify-center">
        {/* Outer Orbit Ring */}
        <div className="absolute inset-0 rounded-full border border-[rgba(201,168,76,0.25)] border-dashed animate-spin-slow pointer-events-none" />
        <div className="absolute inset-10 rounded-full border border-[rgba(201,168,76,0.15)] pointer-events-none" />

        {/* Center Node: Founder Sigil / Portrait */}
        <div className="relative z-10 w-28 h-28 sm:w-36 sm:h-36 rounded-full glass border-2 border-[#C9A84C] flex flex-col items-center justify-center p-3 text-center shadow-[0_0_30px_rgba(201,168,76,0.25)]">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-1">
            <polygon points="20,2 38,20 20,38 2,20" stroke="#C9A84C" strokeWidth="1.5" />
            <rect x="11" y="11" width="18" height="18" stroke="#8a6e2a" strokeWidth="1" transform="rotate(45 20 20)" />
            <circle cx="20" cy="20" r="2.5" fill="#C9A84C" />
          </svg>
          <span className="font-display font-bold text-[11px] sm:text-xs text-[#f5f3f0] uppercase tracking-wider">
            Jehu Nanpan
          </span>
          <span className="text-[9px] font-mono text-[#8a6e2a]">
            Jos, Nigeria
          </span>
        </div>

        {/* Six Surrounding Nodes */}
        {nodes.map((node) => {
          const rad = (node.angle * Math.PI) / 180;
          const radius = typeof window !== 'undefined' && window.innerWidth < 640 ? 125 : 185;
          const x = radius * Math.cos(rad);
          const y = radius * Math.sin(rad);
          const Icon = node.icon;

          return (
            <a
              key={node.label}
              href={node.path}
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
              className="absolute z-20 group"
            >
              <div className="p-3 sm:p-4 rounded-full glass border border-[rgba(201,168,76,0.3)] hover:border-[#C9A84C] hover:scale-110 flex flex-col items-center justify-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.7)] transition-all cursor-pointer bg-[#0a0908]/90">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#C9A84C] group-hover:text-[#e8c96a] transition-colors" />
                <span className="text-[9px] sm:text-[10px] font-mono font-medium text-[#c4c0bb] group-hover:text-[#f5f3f0] mt-1 whitespace-nowrap">
                  {node.label}
                </span>
              </div>
            </a>
          );
        })}
      </div>

      <style>{`
        @keyframes spin-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-orbit 120s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SystemsCircle;
