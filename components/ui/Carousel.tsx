'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { StudioAudio } from '../../lib/watermark';

export interface CarouselItem {
  id: string | number;
  content: React.ReactNode;
}

export interface CarouselProps {
  items: CarouselItem[];
  categoryLabel?: string;
  autoAdvanceMs?: number;
  className?: string;
  onItemChange?: (index: number) => void;
}

/**
 * FIX 6 — Single-Card Carousel
 * One card visible at a time. Centered. Full width (max 480px).
 * - 40px circle glass arrows outside card
 * - Dot indicators below
 * - Touch swipe support on mobile
 * - Auto-advance every 8s (pause on hover)
 * - Category label above carousel
 */
export const Carousel: React.FC<CarouselProps> = ({
  items,
  categoryLabel,
  autoAdvanceMs = 8000,
  className = '',
  onItemChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance every 8s (pauses on hover)
  useEffect(() => {
    if (items.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      paginate(1);
    }, autoAdvanceMs);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, items.length, autoAdvanceMs]);

  const paginate = (newDirection: number) => {
    try {
      StudioAudio.playClick();
    } catch {}
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      const next =
        newDirection === 1
          ? (prev + 1) % items.length
          : (prev - 1 + items.length) % items.length;
      if (onItemChange) onItemChange(next);
      return next;
    });
  };

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 40;
    if (info.offset.x < -threshold) {
      paginate(1);
    } else if (info.offset.x > threshold) {
      paginate(-1);
    }
  };

  if (!items || items.length === 0) return null;

  const currentItem = items[currentIndex];

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 350, damping: 28 },
        opacity: { duration: 0.28 },
        scale: { duration: 0.28 },
      },
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.96,
      transition: {
        x: { type: 'spring' as const, stiffness: 350, damping: 28 },
        opacity: { duration: 0.22 },
        scale: { duration: 0.22 },
      },
    }),
  };

  return (
    <div
      className={`w-full flex flex-col items-center justify-center select-none py-4 ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Category Label Above Carousel */}
      {categoryLabel && (
        <div className="mb-4 text-center">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#C9A84C] px-3.5 py-1 rounded-full bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.25)] font-bold">
            {categoryLabel}
          </span>
        </div>
      )}

      {/* Main Single-Card Stage with 40px Outside Arrows */}
      <div className="relative w-full max-w-[580px] px-12 sm:px-14 flex items-center justify-center">
        {/* Left Arrow: 40px Glass Circle */}
        {items.length > 1 && (
          <button
            type="button"
            onClick={() => paginate(-1)}
            className="absolute left-0 z-20 w-10 h-10 rounded-full border border-[rgba(201,168,76,0.3)] bg-[rgba(15,13,10,0.85)] hover:bg-[#C9A84C] text-[#c4c0bb] hover:text-[#050404] transition-all flex items-center justify-center cursor-pointer shadow-md active:scale-95 backdrop-blur-xl"
            aria-label="Previous item"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Centered Single Card (Max 480px Wide) with Mobile Swipe */}
        <div className="w-full max-w-[480px] overflow-hidden flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentItem.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={handleDragEnd}
              className="w-full max-w-[480px] cursor-grab active:cursor-grabbing flex justify-center"
            >
              <div className="w-full">{currentItem.content}</div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Arrow: 40px Glass Circle */}
        {items.length > 1 && (
          <button
            type="button"
            onClick={() => paginate(1)}
            className="absolute right-0 z-20 w-10 h-10 rounded-full border border-[rgba(201,168,76,0.3)] bg-[rgba(15,13,10,0.85)] hover:bg-[#C9A84C] text-[#c4c0bb] hover:text-[#050404] transition-all flex items-center justify-center cursor-pointer shadow-md active:scale-95 backdrop-blur-xl"
            aria-label="Next item"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dot Indicators Below */}
      {items.length > 1 && (
        <div className="flex items-center gap-1.5 mt-5">
          {items.map((it, idx) => (
            <button
              key={it.id}
              type="button"
              onClick={() => {
                try {
                  StudioAudio.playClick();
                } catch {}
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
                if (onItemChange) onItemChange(idx);
              }}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                currentIndex === idx
                  ? 'w-6 bg-[#C9A84C] shadow-[0_0_8px_#C9A84C]'
                  : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
