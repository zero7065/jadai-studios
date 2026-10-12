'use client';
import React, { useState, useEffect } from 'react';
import { SignalCard } from '@/components/signal/SignalCard';
import { SignalFilters } from '@/components/signal/SignalFilters';
import { EmptySignals } from '@/components/signal/EmptySignals';
import { SignalHUD } from '@/components/signal/SignalHUD';
import { signalStore } from '@/lib/signal/store';
import { useToast } from '@/components/providers/ToastProvider';
import { StudioAudio } from '@/lib/watermark';
import { RefreshCw, Sparkles, Radar, Shield } from 'lucide-react';

export default function SignalRadarPage({
  initialSignalId,
  onNavigate,
}: {
  initialSignalId?: string;
  onNavigate?: (path: string) => void;
}) {
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [minScore, setMinScore] = useState(0);
  const [selectedSignal, setSelectedSignal] = useState<any | null>(null);
  const { showToast } = useToast();

  const loadSignals = async () => {
    try {
      const res = await fetch('/api/signal/signals');
      const data = await res.json();
      if (data.signals && data.signals.length > 0) {
        setSignals(data.signals);
      } else {
        setSignals(signalStore.getSignals());
      }
    } catch {
      setSignals(signalStore.getSignals());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSignals();
  }, []);

  useEffect(() => {
    if (initialSignalId && signals.length > 0) {
      const matched = signals.find((s) => s.id === initialSignalId);
      if (matched) setSelectedSignal(matched);
    }
  }, [initialSignalId, signals]);

  const handleLaunchScout = async () => {
    setScanning(true);
    StudioAudio.playClick();
    showToast('Scout agent active on HN, GitHub, and Reddit...', 'info');

    try {
      const res = await fetch('/api/worker/scout', { method: 'POST' });
      const data = await res.json().catch(() => null);
      await loadSignals();
      if (res.ok && data?.success) {
        StudioAudio.playSuccessArpeggio();
        const count = data.result?.savedCount ?? 0;
        showToast(
          count > 0
            ? `Scout scan completed. ${count} new signal${count === 1 ? '' : 's'} detected.`
            : 'Scout scan completed — no new signals found.',
          'success'
        );
      } else {
        showToast(data?.error || 'Scout worker could not run — no new signals added.', 'error');
      }
    } catch {
      showToast('Scout worker unreachable — no new signals added.', 'error');
    } finally {
      setScanning(false);
    }
  };

  const filteredSignals = signals.filter((s) => {
    const score = s.intent_score ?? s.intentScore ?? 0;
    if (score < minScore) return false;
    if (selectedPlatform !== 'all' && s.platform !== selectedPlatform) return false;
    return true;
  });

  if (selectedSignal) {
    return (
      <div className="min-h-screen bg-[#050404] pt-8 pb-20 px-4 sm:px-6">
        <SignalHUD
          signal={selectedSignal}
          onBack={() => {
            setSelectedSignal(null);
            if (onNavigate) onNavigate('/signal/radar');
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050404] text-[#f5f3f0] pt-12 pb-24 px-4 sm:px-6 select-none">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(201,168,76,0.2)] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.25)] text-[#C9A84C] text-xs font-mono mb-2">
              <Radar className="w-3.5 h-3.5" />
              <span>Real-Time Developer Pain Radar</span>
            </div>
            <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-white">
              SIGNAL
            </h1>
            <p className="text-sm font-mono text-[#8a6e2a] mt-1">
              {filteredSignals.length} signals found ·{' '}
              {filteredSignals.filter((s) => (s.intent_score ?? s.intentScore ?? 0) >= 70).length} high intent
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLaunchScout}
              disabled={scanning}
              className="px-6 py-2.5 rounded-full bg-[#C9A84C] text-[#050404] font-mono text-xs font-bold hover:bg-[#e8c96a] transition-all flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? 'Scouting Platforms...' : 'Scan Now'}</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <SignalFilters
          activePlatform={selectedPlatform}
          onChangePlatform={setSelectedPlatform}
          activeMinScore={minScore}
          onChangeMinScore={setMinScore}
        />

        {/* Signal Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs font-mono text-[#8a6e2a]">
            Aligning quantum satellite arrays...
          </div>
        ) : filteredSignals.length === 0 ? (
          <EmptySignals onScan={handleLaunchScout} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSignals.map((s) => (
              <SignalCard
                key={s.id}
                signal={s}
                onSelect={(sig) => setSelectedSignal(sig)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
