'use client';
import React from 'react';
import { SignalPricing } from '@/components/signal/SignalPricing';
import { ArrowLeft } from 'lucide-react';

export default function SignalPricingPage({ onNavigate }: { onNavigate?: (path: string) => void }) {
  return (
    <main className="min-h-screen bg-[#050404] pt-12 pb-24 px-6 text-[#c4c0bb] select-none">
      <div className="max-w-6xl mx-auto mb-6">
        <button
          onClick={() => {
            if (onNavigate) onNavigate('/signal');
            else window.location.href = '/signal';
          }}
          className="inline-flex items-center gap-2 text-xs font-mono text-[#8a6e2a] hover:text-[#C9A84C] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Signal Home</span>
        </button>
      </div>
      <SignalPricing onNavigate={onNavigate} />
    </main>
  );
}
