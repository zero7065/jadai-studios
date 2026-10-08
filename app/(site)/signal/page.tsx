'use client';
import React from 'react';
import { SignalHero } from '@/components/signal/SignalHero';
import { SignalWorkflow } from '@/components/signal/SignalWorkflow';
import { SignalPricing } from '@/components/signal/SignalPricing';

export default function SignalLanding({ onNavigate }: { onNavigate?: (path: string) => void }) {
  return (
    <main className="bg-[#050404] min-h-screen text-[#c4c0bb] select-none">
      <SignalHero onNavigate={onNavigate} />
      <SignalWorkflow />
      <SignalPricing onNavigate={onNavigate} />
    </main>
  );
}
