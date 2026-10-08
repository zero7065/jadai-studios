'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import EdgeGlow from '../ui/EdgeGlow';
import { StudioAudio } from '../../lib/watermark';
import { Star, Sparkles, Send, CheckCircle2, Heart } from 'lucide-react';

export interface RatingFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribePrompt?: () => void;
}

export const RatingFeedbackModal: React.FC<RatingFeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubscribePrompt,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showEmojiExplosion, setShowEmojiExplosion] = useState(false);

  // Emojis for 5th star explosion
  const explosionEmojis = ['🎊', '🥳', '🎉', '✨', '👑', '🔥', '⚡', '🏆', '💎', '🌟'];

  const handleStarClick = (starIndex: number) => {
    setRating(starIndex);

    if (starIndex === 1) {
      StudioAudio.playClick();
    } else if (starIndex === 2) {
      StudioAudio.playClick();
    } else if (starIndex === 3) {
      StudioAudio.playClick();
    } else if (starIndex === 4) {
      StudioAudio.playSuccessArpeggio();
    } else if (starIndex === 5) {
      StudioAudio.playSuccessArpeggio();
      setShowEmojiExplosion(true);
      setTimeout(() => setShowEmojiExplosion(false), 2500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !comment.trim()) return;

    StudioAudio.playSuccessArpeggio();

    // Store in localStorage / feedback ledger
    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('jadai-feedback-ratings') || '[]');
      existing.unshift({
        id: `fb-${Date.now()}`,
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('jadai-feedback-ratings', JSON.stringify(existing));
    }

    setSubmitted(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[125] flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-lg relative"
      >
        {/* 5th Star Emoji Explosion Particles */}
        <AnimatePresence>
          {showEmojiExplosion && (
            <div className="absolute inset-0 pointer-events-none z-50 overflow-visible flex items-center justify-center">
              {explosionEmojis.map((emoji, i) => {
                const angle = (i / explosionEmojis.length) * 2 * Math.PI;
                const distance = 160 + (i % 3) * 40;
                const targetX = Math.cos(angle) * distance;
                const targetY = Math.sin(angle) * distance;

                return (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                    animate={{
                      x: targetX,
                      y: targetY,
                      scale: [0, 1.8, 1.2],
                      opacity: [1, 1, 0],
                      rotate: (i % 2 === 0 ? 1 : -1) * 360,
                    }}
                    transition={{
                      duration: 1.8,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute text-3xl"
                  >
                    {emoji}
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>

        <EdgeGlow intensity="intense" color="gold" borderRadius={24}>
          <div
            style={{ borderRadius: '24px' }}
            className="p-6 sm:p-8 bg-[#0a0908] border border-[rgba(201,168,76,0.3)] shadow-[0_25px_70px_rgba(0,0,0,0.95)] text-[#c4c0bb] space-y-6"
          >
            {!submitted ? (
              <>
                <div className="text-center space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9A84C] font-bold">
                    Architectural Assessment
                  </span>
                  <h3 className="text-2xl font-display font-bold text-[#f5f3f0]">
                    Rate Your Experience
                  </h3>
                  <p className="text-xs font-mono text-[#8a6e2a]">
                    How true and dependable has the Jadai environment proven for your builds?
                  </p>
                </div>

                {/* 5 Stars with Interactive Jiggle */}
                <div className="flex items-center justify-center gap-3 py-2">
                  {[1, 2, 3, 4, 5].map((starIndex) => {
                    const isFilled = starIndex <= (hoverRating || rating);

                    // Jiggle hardness classes based on star number
                    const jiggleClass =
                      starIndex === 1
                        ? 'hover:animate-[spin_0.2s_ease-in-out]'
                        : starIndex === 2
                        ? 'hover:scale-125'
                        : starIndex === 3
                        ? 'hover:scale-135 hover:rotate-6'
                        : starIndex === 4
                        ? 'hover:scale-145 hover:-rotate-12'
                        : 'hover:scale-150 hover:rotate-12';

                    return (
                      <button
                        key={starIndex}
                        type="button"
                        onClick={() => handleStarClick(starIndex)}
                        onMouseEnter={() => setHoverRating(starIndex)}
                        onMouseLeave={() => setHoverRating(0)}
                        className={`transition-all duration-150 p-2 cursor-pointer ${jiggleClass}`}
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            isFilled
                              ? 'text-[#C9A84C] fill-[#C9A84C] filter drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]'
                              : 'text-neutral-700 hover:text-[#8a6e2a]'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Comment Form (Required after rating) */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-[#8a6e2a] uppercase block">
                      Detailed Commentary (Required)
                    </label>
                    <textarea
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="What worked? What broke? What needs tighter tolerances?"
                      required
                      className="w-full p-3 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.25)] text-xs font-mono text-[#f5f3f0] placeholder:text-neutral-600 focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-xs font-mono text-[#8a6e2a] hover:text-[#c4c0bb]"
                    >
                      Dismiss
                    </button>

                    <button
                      type="submit"
                      disabled={!rating || !comment.trim()}
                      className="px-6 py-2.5 rounded-xl bg-[#C9A84C] text-[#050404] font-mono text-xs font-bold hover:bg-[#e8c96a] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Transmit Feedback</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Success & Subscribe Prompt */
              <div className="text-center space-y-5 py-4">
                <div className="w-14 h-14 rounded-full bg-[rgba(201,168,76,0.15)] border border-[#C9A84C] text-[#C9A84C] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(201,168,76,0.3)]">
                  <CheckCircle2 className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-display font-bold text-[#f5f3f0]">
                    Feedback Inscribed
                  </h3>
                  <p className="text-xs font-mono text-[#8a6e2a]">
                    Your signal has been registered into the studio feedback ledger.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#050404] border border-[rgba(201,168,76,0.2)] text-xs font-mono space-y-2">
                  <p className="text-[#c4c0bb]">
                    Subscribe to eliminate all rate limits, unlock the full 12 tools, and receive nightly Book of Lies transmissions.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-[rgba(201,168,76,0.2)] text-xs font-mono text-[#8a6e2a] hover:text-white"
                  >
                    Done
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      if (onSubscribePrompt) onSubscribePrompt();
                    }}
                    className="px-6 py-2 rounded-xl bg-[#C9A84C] text-[#050404] font-mono text-xs font-bold hover:bg-[#e8c96a] transition-all shadow-md cursor-pointer"
                  >
                    Explore Membership Tiers
                  </button>
                </div>
              </div>
            )}
          </div>
        </EdgeGlow>
      </motion.div>
    </div>
  );
};

export default RatingFeedbackModal;
