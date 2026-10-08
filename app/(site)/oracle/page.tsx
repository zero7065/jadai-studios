import React, { useState, useEffect } from 'react';
import PrimeChat from '@/components/oracle/PrimeChat';
import ProfilingFlow from '@/components/oracle/ProfilingFlow';
import RatingModal from '@/components/feedback/RatingModal';
import DefensiveFallback from '@/components/ui/DefensiveFallback';
import GhostwritingWorkspace from '@/components/oracle/GhostwritingWorkspace';
import type { PrimePersona } from '@/lib/ai/prompts';
import { Feather, MessageSquare } from 'lucide-react';

export default function OraclePage() {
  const [hasError, setHasError] = useState(false);
  const [showProfiling, setShowProfiling] = useState(false);
  const [persona, setPersona] = useState<PrimePersona>('The Architect');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [oracleView, setOracleView] = useState<'writer' | 'chat'>('writer');

  if (hasError) return <DefensiveFallback />;

  useEffect(() => {
    // Check if user has answered profiling questions
    const profilingDone = localStorage.getItem('jadai-oracle-profiling-done');
    const savedPersona = localStorage.getItem('jadai-oracle-persona') as PrimePersona;

    if (!profilingDone) {
      setShowProfiling(true);
    } else if (savedPersona) {
      setPersona(savedPersona);
    }
  }, []);

  const handleProfilingComplete = (selectedPersona: PrimePersona) => {
    setPersona(selectedPersona);
    setShowProfiling(false);
    localStorage.setItem('jadai-oracle-profiling-done', 'true');
    localStorage.setItem('jadai-oracle-persona', selectedPersona);

    // Trigger feedback after completing profiling
    if (!sessionStorage.getItem('jadai-feedback-submitted')) {
      setTimeout(() => setShowRatingModal(true), 1500);
    }
  };

  const handleSkipProfiling = () => {
    setShowProfiling(false);
    localStorage.setItem('jadai-oracle-profiling-done', 'true');
  };

  return (
    <div className="w-full">
      {/* Top Navigation between Writer's Room and Dialogue */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-2 flex items-center justify-between border-b border-[rgba(201,168,76,0.15)]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a]">
            Oracle Chamber:
          </span>
          <div className="inline-flex p-1 rounded-xl bg-[#0a0908] border border-[rgba(201,168,76,0.25)]">
            <button
              onClick={() => setOracleView('writer')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                oracleView === 'writer'
                  ? 'bg-[#C9A84C] text-[#050404] font-bold shadow-xs'
                  : 'text-[#8a857e] hover:text-[#f5f3f0]'
              }`}
            >
              <Feather className="w-3.5 h-3.5" />
              <span>Writer's Room</span>
            </button>
            <button
              onClick={() => setOracleView('chat')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                oracleView === 'chat'
                  ? 'bg-[#C9A84C] text-[#050404] font-bold shadow-xs'
                  : 'text-[#8a857e] hover:text-[#f5f3f0]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Socratic Dialogue</span>
            </button>
          </div>
        </div>

        <span className="hidden sm:inline-block text-[10px] font-mono text-[#8a6e2a]">
          Jadai Studios • Sovereign Intelligence
        </span>
      </div>

      {oracleView === 'writer' ? (
        <GhostwritingWorkspace />
      ) : (
        <div className="py-6">
          {showProfiling ? (
            <ProfilingFlow
              onComplete={handleProfilingComplete}
              onSkip={handleSkipProfiling}
            />
          ) : (
            <PrimeChat
              initialPersona={persona}
              onOpenProfiling={() => setShowProfiling(true)}
            />
          )}
        </div>
      )}

      {/* Post-interaction rating modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        sourceContext="oracle_profiling"
        moduleType="oracle"
      />
    </div>
  );
}
