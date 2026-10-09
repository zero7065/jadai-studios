import React, { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import RecoveryTerminalModal from '@/components/layout/RecoveryTerminalModal';
import { clearAllMemory } from '@/lib/ai/memory';
import { Terminal, ShieldAlert, KeyRound, RefreshCw, AlertTriangle, Brain } from 'lucide-react';

export default function AdminRecoveryPage() {
  const [terminalOpen, setTerminalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(201,168,76,0.2)] pb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#C0392B]">Disaster Recovery</span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#f5f3f0] mt-1">Level 0 Terminal Console</h1>
          <p className="text-xs font-mono text-[#8a6e2a]">
            Direct emergency access to master credentials, offline state purge, and cryptographic recovery codes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6 space-y-4 border-[rgba(192,57,43,0.3)]">
          <div className="flex items-center gap-2 text-[#C0392B]">
            <Terminal className="w-5 h-5" />
            <h2 className="text-base font-display font-bold text-[#f5f3f0]">Direct Hacker Terminal Launch</h2>
          </div>
          <p className="text-xs text-[#c4c0bb] leading-relaxed">
            The 20-tap security sequence is normally triggered via physical gesture on the Jadai Logo. As an authorized administrator in session, you can launch the console directly.
          </p>

          <div className="p-3.5 rounded bg-[#050404] border border-[rgba(192,57,43,0.2)] font-mono text-xs space-y-1 text-[#8a6e2a]">
            <div>Security Passcode: <span className="text-[#39FF14] font-bold">SESSION-LOCAL</span></div>
            <div>Protocol: Level 0 Sovereign Shell Interface</div>
          </div>

          <Button variant="danger" size="md" className="w-full" onClick={() => setTerminalOpen(true)}>
            <Terminal className="w-4 h-4 mr-2" />
            Open Emergency Terminal
          </Button>
        </GlassCard>

        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#C9A84C]">
            <KeyRound className="w-5 h-5" />
            <h2 className="text-base font-display font-bold text-[#f5f3f0]">Local Recovery Checkpoints</h2>
          </div>
          <p className="text-xs text-[#c4c0bb] leading-relaxed">
            In case of trapped service workers or corrupt client IndexedDB stores, execute an atomic browser state reset:
          </p>

          <div className="space-y-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start font-mono text-xs"
              onClick={async () => {
                // Capture builderId + server wipe before nuking localStorage
                await clearAllMemory();
                localStorage.clear();
                sessionStorage.clear();
                alert('All client caches, local storage, and PRIME AI memory (device + server) successfully wiped.');
              }}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-2" />
              Purge LocalStorage, Tokens & AI Memory
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start font-mono text-xs"
              onClick={async () => {
                await clearAllMemory();
                alert('PRIME AI memory cleared: facts (IndexedDB), transcripts, and server sync. Builder identity rotated.');
              }}
            >
              <Brain className="w-3.5 h-3.5 mr-2" />
              Clear PRIME AI Memory Only
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start font-mono text-xs"
              onClick={() => {
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then((registrations) => {
                    for (const reg of registrations) {
                      reg.unregister();
                    }
                  });
                }
                alert('All service workers unregistered.');
              }}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-2" />
              Unregister PWA Service Workers
            </Button>
          </div>
        </GlassCard>
      </div>

      <RecoveryTerminalModal isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} />
    </div>
  );
}
