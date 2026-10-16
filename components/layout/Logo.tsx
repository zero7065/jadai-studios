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
  // Tap tracking:
  //  - 5 taps within 3s (fires 500ms after the user pauses) → Admin Lounge
  //  - 20 taps within 10s (fires immediately) → Disaster Recovery Terminal
  // The 5-tap decision is quiet-debounced so uninterrupted rapid tapping can
  // escalate past it to the 20-tap recovery gesture instead of being cut off.
  const tapHistoryRef = useRef<number[]>([]);
  const escalateRef = useRef<number[]>([]);
  const resetTimerRef = useRef<any>(null);
  const singleClickTimerRef = useRef<any>(null);
  const adminDecideTimerRef = useRef<any>(null);
  const [pulsing, setPulsing] = useState(false);

  const fireFeedback = () => {
    try {
      StudioAudio.playSuccessArpeggio();
    } catch {}
    setPulsing(true);
    setTimeout(() => setPulsing(false), 800);
  };

  const clearGestureState = () => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    if (singleClickTimerRef.current) clearTimeout(singleClickTimerRef.current);
    if (adminDecideTimerRef.current) clearTimeout(adminDecideTimerRef.current);
    resetTimerRef.current = null;
    singleClickTimerRef.current = null;
    adminDecideTimerRef.current = null;
    tapHistoryRef.current = [];
    escalateRef.current = [];
  };

  const handleTap = (e: React.MouseEvent) => {
    e.preventDefault();
    const now = Date.now();

    // Reset the 5-tap window after 3 seconds of no taps
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = setTimeout(() => {
      tapHistoryRef.current = [];
    }, 3000);

    tapHistoryRef.current = [...tapHistoryRef.current, now].filter((t) => now - t <= 3000);
    escalateRef.current = [...escalateRef.current, now].filter((t) => now - t <= 10000);

    // 20 taps within 10 seconds → Disaster Recovery Terminal.
    if (escalateRef.current.length >= 20) {
      clearGestureState();
      fireFeedback();
      if (onRecovery) {
        onRecovery();
      } else if (typeof window !== 'undefined') {
        window.location.href = '/admin/recovery';
      }
      return;
    }

    // ≥5 taps within 3 seconds → Admin Lounge opens after 500ms of quiet.
    // Every additional tap postpones it, so continuous mashing escalates to 20.
    if (tapHistoryRef.current.length >= 5) {
      if (adminDecideTimerRef.current) {
        clearTimeout(adminDecideTimerRef.current);
      }
      adminDecideTimerRef.current = setTimeout(() => {
        clearGestureState();
        fireFeedback();
        if (onAdminTrigger) {
          onAdminTrigger();
        } else if (typeof window !== 'undefined') {
          window.location.href = '/admin';
        }
      }, 500);
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
