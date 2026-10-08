'use client';
import React, { useState, useEffect } from 'react';
import { SignalHUD } from '@/components/signal/SignalHUD';
import { signalStore } from '@/lib/signal/store';
import BrandedErrorFallback from '@/components/ui/BrandedErrorFallback';

export default function SignalDetailPage({
  params,
  onNavigate,
}: {
  params?: { id?: string };
  onNavigate?: (path: string) => void;
}) {
  const signalId = params?.id || '';
  const [signal, setSignal] = useState<any>(null);
  const [draft, setDraft] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/signal/signals/${signalId}`);
        const data = await res.json();
        if (data.signal) {
          setSignal(data.signal);
          setDraft(data.draft);
          return;
        }
      } catch {}

      const found = signalStore.getSignalById(signalId);
      if (found) {
        setSignal(found);
        setDraft(signalStore.getDraftBySignalId(signalId));
      }
      setLoading(false);
    }

    if (signalId) {
      load();
    } else {
      setLoading(false);
    }
  }, [signalId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050404] p-12 text-center text-xs font-mono text-[#8a6e2a]">
        Loading signal telemetry...
      </div>
    );
  }

  if (!signal) {
    return (
      <div className="min-h-screen bg-[#050404] flex items-center justify-center">
        <BrandedErrorFallback
          message="Signal coordinates could not be loaded."
          onNavigate={() => {
            if (onNavigate) onNavigate('/signal/radar');
            else window.location.href = '/signal/radar';
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050404] pt-8 pb-20 px-4 sm:px-6">
      <SignalHUD
        signal={signal}
        draft={draft}
        onBack={() => {
          if (onNavigate) onNavigate('/signal/radar');
          else window.location.href = '/signal/radar';
        }}
      />
    </div>
  );
}
