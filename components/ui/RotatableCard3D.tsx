'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { RotateCw, Info, Check } from 'lucide-react';
import { StudioAudio } from '../../lib/watermark';

export interface RotatableCard3DProps {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
  flipLabel?: string;
  isFlippedControlled?: boolean;
  onFlipToggle?: (flipped: boolean) => void;
}

export const RotatableCard3D: React.FC<RotatableCard3DProps> = ({
  front,
  back,
  className = '',
  flipLabel = 'Inspect Specs',
  isFlippedControlled,
  onFlipToggle,
}) => {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isFlipped = isFlippedControlled !== undefined ? isFlippedControlled : internalFlipped;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    StudioAudio.playClick();
    const next = !isFlipped;
    if (onFlipToggle) {
      onFlipToggle(next);
    } else {
      setInternalFlipped(next);
    }
  };

  return (
    <div
      className={`relative w-full [perspective:1200px] select-none ${className}`}
      style={{ minHeight: '380px' }}
    >
      <motion.div
        className="w-full h-full relative [transform-style:preserve-3d] transition-all"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* FRONT FACE */}
        <div
          className="w-full h-full [backface-visibility:hidden] relative flex flex-col justify-between"
          style={{ transform: 'rotateY(0deg)' }}
        >
          {front}

          {/* Quick Flip Toggle Button */}
          <button
            type="button"
            onClick={handleToggle}
            className="absolute top-3 right-3 z-20 px-2 py-1 rounded-full bg-[rgba(10,9,8,0.85)] border border-[rgba(201,168,76,0.3)] text-[#C9A84C] hover:bg-[rgba(201,168,76,0.2)] hover:text-[#f5f3f0] transition-all text-[10px] font-mono flex items-center gap-1 shadow-md cursor-pointer backdrop-blur-md"
            title="Flip to view detailed specifications"
          >
            <RotateCw className="w-3 h-3 text-[#C9A84C]" />
            <span>{flipLabel}</span>
          </button>
        </div>

        {/* BACK FACE */}
        <div
          className="w-full h-full [backface-visibility:hidden] absolute inset-0 flex flex-col justify-between bg-[#0a0908] rounded-2xl p-6 border border-[rgba(201,168,76,0.35)] shadow-2xl backdrop-blur-xl"
          style={{ transform: 'rotateY(180deg)' }}
        >
          {back}

          {/* Flip Return Button */}
          <button
            type="button"
            onClick={handleToggle}
            className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full bg-[rgba(201,168,76,0.2)] border border-[#C9A84C] text-[#e8c96a] hover:bg-[#C9A84C] hover:text-[#050404] transition-all text-[10px] font-mono font-bold flex items-center gap-1 shadow-md cursor-pointer"
            title="Return to preview"
          >
            <RotateCw className="w-3 h-3" />
            <span>Front Face</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RotatableCard3D;
