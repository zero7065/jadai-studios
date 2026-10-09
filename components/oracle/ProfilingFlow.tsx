import React, { useState } from 'react';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import { Sparkles, ArrowRight, SkipForward } from 'lucide-react';
import type { PrimePersona } from '../../lib/ai/prompts';
import { getBuilderId, saveFact } from '../../lib/ai/memory';

export const PROFILING_QUESTIONS = [
  "What did you want to be when you were ten? And why did you stop?",
  "If you had to describe your life right now in one weather pattern, what would it be?",
  "What problem keeps coming back no matter how many times you think you've solved it?",
  "A character in a story is exactly where you are right now. What happens next to them — best case, worst case, and most likely?",
  "When was the last time you made a decision you were genuinely proud of? What made it different?",
  "What do you do when everything goes wrong at once?",
  "If someone wanted to stop you from succeeding, what is the exact strategy they would use?",
  "What does 'making it' look like in five years — in a scene, not a statement?",
  "What's the thing you keep almost doing but don't?",
  "If I told you your current plan won't work, what's your first instinct — defend it or hear why?",
];

export interface ProfilingFlowProps {
  onComplete: (persona: PrimePersona, answersCount: number) => void;
  onSkip: () => void;
}

export const ProfilingFlow: React.FC<ProfilingFlowProps> = ({
  onComplete,
  onSkip,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const total = PROFILING_QUESTIONS.length;
  const currentQuestion = PROFILING_QUESTIONS[currentIdx];

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setSubmitting(true);
    const updatedAnswers = { ...answers, [currentIdx]: answer.trim() };
    setAnswers(updatedAnswers);

    // Persist answer to backend (unified memory) + local device memory
    try {
      void saveFact(
        'profile',
        `profile:q${currentIdx}`,
        `${currentQuestion.slice(0, 120)} → ${answer.trim().slice(0, 400)}`,
        0.9,
        'oracle'
      );
      await fetch('/api/oracle/profiling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          builderId: getBuilderId(),
          questionIndex: currentIdx,
          question: currentQuestion,
          answer: answer.trim(),
        }),
      });
    } catch {
      // Non-blocking fallback
    }

    setAnswer('');
    setSubmitting(false);

    if (currentIdx + 1 < total) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Finished all 10 questions -> evaluate persona
      const chosenPersona = evaluatePersona(updatedAnswers);
      onComplete(chosenPersona, Object.keys(updatedAnswers).length);
    }
  };

  const evaluatePersona = (collected: Record<number, string>): PrimePersona => {
    const text = Object.values(collected).join(' ').toLowerCase();
    if (text.includes('system') || text.includes('code') || text.includes('build') || text.includes('plan')) {
      return 'The Architect';
    }
    if (text.includes('fear') || text.includes('tired') || text.includes('hard') || text.includes('fail')) {
      return 'The Companion';
    }
    if (text.includes('data') || text.includes('metrics') || text.includes('numbers') || text.includes('logic')) {
      return 'The Analyst';
    }
    if (text.includes('push') || text.includes('prove') || text.includes('defend') || text.includes('win')) {
      return 'The Challenger';
    }
    return 'The Mirror';
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <GlassCard className="p-8 space-y-6 border-[rgba(201,168,76,0.35)] shadow-[0_10px_40px_rgba(0,0,0,0.7)]">
        {/* Progress header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#C9A84C] uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Cognitive Calibration • Question {currentIdx + 1} of {total}
            </span>
            <span className="text-[#8a6e2a]">
              {Math.round(((currentIdx + 1) / total) * 100)}%
            </span>
          </div>

          <div className="w-full h-1 bg-[#050404] rounded-full overflow-hidden border border-[rgba(201,168,76,0.2)]">
            <div
              className="h-full bg-gradient-to-r from-[#8a6e2a] via-[#C9A84C] to-[#e8c96a] transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Statement */}
        <div className="space-y-3 pt-2">
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-[#f5f3f0] leading-snug">
            "{currentQuestion}"
          </h2>
          <p className="text-xs font-mono text-[#8a6e2a]">
            PRIME does not evaluate answers for correctness. It evaluates for velocity and truth.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleNext} className="space-y-4">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={4}
            placeholder="Type your response with total candor..."
            required
            autoFocus
            className="w-full p-4 rounded bg-[#050404] border border-[rgba(201,168,76,0.25)] text-[#f5f3f0] font-sans text-sm focus:outline-none focus:border-[#C9A84C] leading-relaxed resize-none"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onSkip}
              className="text-xs font-mono text-[#8a6e2a] hover:text-[#c4c0bb] transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Bypass profiling directly to open terminal</span>
            </button>

            <Button type="submit" size="md" disabled={submitting || !answer.trim()}>
              <span>{currentIdx + 1 === total ? 'Complete Calibration' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

export default ProfilingFlow;
