'use client';

import React from 'react';
import SacredGeometry from '@/components/ui/SacredGeometry';
import EdgeGlow from '@/components/ui/EdgeGlow';
import { WifiOff, RefreshCw, Home, ShieldCheck } from 'lucide-react';
import { StudioAudio } from '@/lib/watermark';

export default function OfflinePage() {
  const handleRetry = () => {
    StudioAudio.playClick();
    window.location.reload();
  };

  return (
    <div className="min-h-[85vh] w-full flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden">
      {/* Background Sacred Geometry */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20">
        <SacredGeometry size={600} opacity={0.15} interactive={false} />
      </div>

      <div className="relative z-10 max-w-md mx-auto space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto shadow-[0_0_30px_rgba(14,165,233,0.3)]">
          <WifiOff className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400">
            OFFLINE DURABILITY PROTOCOL
          </span>
          <h1 className="text-3xl font-display font-bold text-white">
            Connection Suspended
          </h1>
          <p className="text-xs font-mono text-slate-300 leading-relaxed">
            Your local storage cache is intact. Jadai Studios is engineered for low-connectivity environments. Saved drafts and cached architectures remain safe.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Local Storage State: Preserved</span>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <EdgeGlow intensity="subtle" color="gold" borderRadius={12}>
            <button
              onClick={handleRetry}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-mono text-xs font-bold hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </EdgeGlow>

          <a
            href="/"
            className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </a>
        </div>
      </div>
    </div>
  );
}
