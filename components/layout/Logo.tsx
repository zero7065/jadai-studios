import React, { useRef, useState } from 'react';
import Sigil from './Sigil';
import { StudioAudio } from '../../lib/watermark';

export interface LogoProps {
  onAdminTrigger?: () => void;
  onQuickLogin?: () => void;
  onRecovery?: () => void;
  onHomeClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  onAdminTrigger,
  onQuickLogin,
  onRecovery,
  onHomeClick,
  size = 'md',
  showWordmark = true,
  className = '',
}) => {
  // Tap tracking: 5 taps within 3 seconds opens Admin Lounge
  const tapHistoryRef = useRef<number[]>([]);
  const resetTimerRef = useRef<any>(null);
  const singleClickTimerRef = useRef<any>(null);
  const [pulsing, setPulsing] = useState(false);

  const handleTap = (e: React.MouseEvent) => {
    e.preventDefault();
    const now = Date.now();

    // Clear reset timer on every tap
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }
    // Reset counter after 3 seconds of no taps
    resetTimerRef.current = setTimeout(() => {
      tapHistoryRef.current = [];
    }, 3000);

    // Keep only taps within the last 3 seconds
    tapHistoryRef.current = [...tapHistoryRef.current, now].filter((t) => now - t <= 3000);

    // If 5 taps within 3 seconds -> show admin passcode modal with chime and gold pulse
    if (tapHistoryRef.current.length >= 5) {
      tapHistoryRef.current = [];
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
      if (singleClickTimerRef.current) {
        clearTimeout(singleClickTimerRef.current);
        singleClickTimerRef.current = null;
      }
      try {
        StudioAudio.playSuccessArpeggio();
      } catch {}
      setPulsing(true);
      setTimeout(() => setPulsing(false), 800);

      if (onAdminTrigger) {
        onAdminTrigger();
      } else if (typeof window !== 'undefined') {
        window.location.href = '/admin';
      }
      return;
    }

    // If single tap and onHomeClick provided, schedule home navigation
    if (tapHistoryRef.current.length === 1 && onHomeClick) {
      if (singleClickTimerRef.current) {
        clearTimeout(singleClickTimerRef.current);
      }
      singleClickTimerRef.current = setTimeout(() => {
        if (tapHistoryRef.current.length <= 1) {
          onHomeClick();
        }
      }, 350);
    }
  };

  const sigilSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div
      onClick={handleTap}
      className={`inline-flex items-center gap-3 cursor-pointer select-none group transition-all duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        pulsing ? 'scale-110 drop-shadow-[0_0_20px_#C9A84C]' : ''
      } ${className}`}
      title="JADAI STUDIOS"
    >
      {/* Handcrafted Jadai Sigil: Micro-animated looping sacred geometry portal */}
      <Sigil size={size} animate={true} className={pulsing ? 'animate-pulse' : 'group-hover:scale-105 transition-transform'} />

      {showWordmark && (
        <div className="flex flex-col">
          <span className={`font-display font-bold tracking-[0.2em] text-[#f5f3f0] ${textSizes[size]} leading-none`}>
            JADAI
          </span>
          <span className="font-mono text-[9px] tracking-[0.3em] text-[#8a6e2a] uppercase mt-0.5">
            STUDIOS
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
