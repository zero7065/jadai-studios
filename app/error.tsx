'use client';

import React from 'react';
import Button from '../components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#050404] text-[#f5f3f0]">
      <div className="w-12 h-12 rounded-full border border-[#C0392B] flex items-center justify-center text-[#C0392B] mb-4">
        ◈
      </div>
      <h1 className="text-2xl font-display text-[#f5f3f0]">State Disrupted</h1>
      <p className="text-xs font-mono text-[#8a6e2a] mt-2 max-w-md">
        {error.message || 'An architectural anomaly occurred in this execution node.'}
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" size="sm" onClick={() => reset()}>
          Reset Floor State
        </Button>
        <Button variant="ghost" size="sm" onClick={() => (window.location.href = '/')}>
          Return to Void
        </Button>
      </div>
    </div>
  );
}
