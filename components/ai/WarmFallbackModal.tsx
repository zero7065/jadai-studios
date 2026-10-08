'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import YinYangLoader from '../ui/YinYangLoader';
import EdgeGlow from '../ui/EdgeGlow';
import Button from '../ui/Button';
import { getRandomFallback, evaluateRiddleAnswer, FallbackRiddle } from '../../lib/ai/fallbacks';
import { StudioAudio } from '../../lib/watermark';
import { Sparkles, BookOpen, ShoppingBag, Users, FolderGit2, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

export interface WarmFallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
  onNavigate?: (path: string) => void;
}

export const WarmFallbackModal: React.FC<WarmFallbackModalProps> = ({
  isOpen,
  onClose,
  onRetry,
  onNavigate,
}) => {
  const [{ message, riddle }, setFallbackState] = useState(() => getRandomFallback());
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; score: number; isCorrect: boolean } | null>(null);

  if (!isOpen) return null;

  const handleRefreshRiddle = () => {
    StudioAudio.playClick();
    setFallbackState(getRandomFallback());
    setUserAnswer('');
    setFeedback(null);
  };

  const handleCheckAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    const result = evaluateRiddleAnswer(userAnswer, riddle);
    setFeedback(result);
    if (result.isCorrect) {
      StudioAudio.playSuccessArpeggio();
    } else {
      StudioAudio.playClick();
    }
  };

  const handleNavigate = (path: string) => {
    StudioAudio.playClick();
    onClose();
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-xl"
      >
        <EdgeGlow intensity="intense" color="gold" borderRadius={24}>
          <div
            style={{ borderRadius: '24px' }}
            className="p-6 sm:p-8 bg-[#0a0908] border border-[rgba(201,168,76,0.3)] shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-[#c4c0bb] space-y-6"
          >
            {/* Top Rotating Yin-Yang Loader */}
            <div className="flex flex-col items-center justify-center space-y-3 pt-2">
              <YinYangLoader size={72} active={true} showAura={true} />

              <div className="text-center space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9A84C] font-bold">
                  System Recalibration Matrix
                </span>
                {/* 16 Random Warm Messages */}
                <h3 className="text-xl sm:text-2xl font-display font-bold text-[#f5f3f0]">
                  {message}
                </h3>
              </div>
            </div>

            {/* Riddle / Socratic Meditation from Book of Lies */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#050404]/90 border border-[rgba(201,168,76,0.2)] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-[#8a6e2a]">
                <span className="flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
                  Philosophical Riddle #{riddle.id}
                </span>
                <button
                  type="button"
                  onClick={handleRefreshRiddle}
                  className="flex items-center gap-1 hover:text-[#C9A84C] transition-colors cursor-pointer"
                  title="Different riddle"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Cycle Riddle</span>
                </button>
              </div>

              <p className="text-sm sm:text-base font-display italic text-[#e8c96a] leading-relaxed">
                "{riddle.question}"
              </p>

              {/* Interactive Riddle Answer Field with Cosine Similarity Verification */}
              <form onSubmit={handleCheckAnswer} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => {
                    setUserAnswer(e.target.value);
                    if (feedback) setFeedback(null);
                  }}
                  placeholder="Your answer..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#0a0908] border border-[rgba(201,168,76,0.25)] text-xs font-mono text-[#f5f3f0] focus:outline-none focus:border-[#C9A84C]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C9A84C] text-[#050404] font-mono text-xs font-bold hover:bg-[#e8c96a] transition-all cursor-pointer"
                >
                  Verify
                </button>
              </form>

              {feedback && (
                <div
                  className={`text-xs font-mono p-2.5 rounded-lg border flex items-center justify-between ${
                    feedback.isCorrect
                      ? 'bg-[rgba(201,168,76,0.15)] border-[#C9A84C] text-[#e8c96a]'
                      : feedback.score >= 0.7
                      ? 'bg-amber-950/30 border-amber-600/40 text-amber-200'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-300'
                  }`}
                >
                  <span>{feedback.message}</span>
                  {feedback.isCorrect && <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" />}
                </div>
              )}
            </div>

            {/* Offline Activities (What you can still do without AI) */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8a6e2a] block">
                Offline Studio Tools (Zero AI Required):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                <button
                  onClick={() => handleNavigate('/book-of-lies')}
                  className="p-2.5 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.2)] hover:border-[#C9A84C] text-[#f5f3f0] hover:text-[#C9A84C] flex items-center gap-2 transition-all cursor-pointer text-left"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" />
                  <span className="truncate">Book of Lies</span>
                </button>

                <button
                  onClick={() => handleNavigate('/marketplace')}
                  className="p-2.5 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.2)] hover:border-[#C9A84C] text-[#f5f3f0] hover:text-[#C9A84C] flex items-center gap-2 transition-all cursor-pointer text-left"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" />
                  <span className="truncate">Templates</span>
                </button>

                <button
                  onClick={() => handleNavigate('/about')}
                  className="p-2.5 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.2)] hover:border-[#C9A84C] text-[#f5f3f0] hover:text-[#C9A84C] flex items-center gap-2 transition-all cursor-pointer text-left"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" />
                  <span className="truncate">Philosophy</span>
                </button>

                <button
                  onClick={() => handleNavigate('/hub')}
                  className="p-2.5 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.2)] hover:border-[#C9A84C] text-[#f5f3f0] hover:text-[#C9A84C] flex items-center gap-2 transition-all cursor-pointer text-left"
                >
                  <Users className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" />
                  <span className="truncate">Community</span>
                </button>

                <button
                  onClick={() => handleNavigate('/account/workspace')}
                  className="col-span-2 sm:col-span-2 p-2.5 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.2)] hover:border-[#C9A84C] text-[#f5f3f0] hover:text-[#C9A84C] flex items-center gap-2 transition-all cursor-pointer text-left"
                >
                  <FolderGit2 className="w-3.5 h-3.5 text-[#C9A84C] shrink-0" />
                  <span className="truncate">Manage Existing Drafts</span>
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[rgba(201,168,76,0.15)]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-mono text-[#8a6e2a] hover:text-[#f5f3f0] transition-colors cursor-pointer"
              >
                Dismiss Notice
              </button>

              {onRetry && (
                <button
                  type="button"
                  onClick={() => {
                    StudioAudio.playClick();
                    onRetry();
                  }}
                  className="px-5 py-2 rounded-xl bg-[rgba(201,168,76,0.2)] border border-[#C9A84C] text-[#e8c96a] font-mono text-xs font-bold hover:bg-[#C9A84C] hover:text-[#050404] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Signal</span>
                </button>
              )}
            </div>
          </div>
        </EdgeGlow>
      </motion.div>
    </div>
  );
};

export default WarmFallbackModal;
