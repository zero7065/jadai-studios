'use client';
import React from 'react';
import { Radar, RefreshCw, Sparkles } from 'lucide-react';

export function EmptySignals({ onScan }: { onScan?: () => void }) {
  return (
    <div className="py-20 text-center space-y-4 max-w-md mx-auto p-6 rounded-3xl bg-[#0a0908] border border-[rgba(201,168,76,0.2)]">
      <div className="w-16 h-16 rounded-full bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.3)] flex items-center justify-center text-[#e8c96a] mx-auto shadow-[0_0_30px_rgba(201,168,76,0.2)]">
        <Radar className="w-8 h-8 animate-pulse" />
      </div>

      <div className="space-y-1">
        <h3 className="font-display font-bold text-xl text-[#f5f3f0]">
          Signal Radar Active
        </h3>
        <p className="text-xs font-mono text-[#c4c0bb]">
          Your first signals arrive within 4 hours of connecting your accounts.
        </p>
      </div>

      {onScan && (
        <button
          onClick={onScan}
          className="mt-4 px-6 py-2.5 rounded-full bg-[#C9A84C] text-[#050404] font-mono text-xs font-bold hover:bg-[#e8c96a] transition-all inline-flex items-center gap-2 shadow-md cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Launch Immediate Scout Scan</span>
        </button>
      )}
    </div>
  );
}
