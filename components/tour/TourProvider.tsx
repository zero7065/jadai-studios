'use client';
// components/tour/TourProvider.tsx
// Contextual, element-anchored product walkthroughs.
//
// Any element can be tagged with data-tour="<step-id>". A tour is a list of
// steps; each step anchors to a data-tour id, draws a spotlight ring around it,
// and shows a small card with a title + description + next/skip. Tours run on
// demand or auto-once per page (localStorage keyed by tour id).

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Sparkles } from 'lucide-react';

export interface TourStep {
  /** Must match a data-tour="<id>" attribute rendered on the page. */
  anchor: string;
  title: string;
  description: string;
  /** Optional placement hint. Default 'bottom'. */
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export interface Tour {
  id: string;
  steps: TourStep[];
  /** Show automatically once per page visit. Keyed by tour id in localStorage. */
  auto?: boolean;
}

interface TourContextValue {
  startTour: (tour: Tour) => void;
  endTour: () => void;
  isActive: boolean;
}

const TourContext = createContext<TourContextValue>({
  startTour: () => {},
  endTour: () => {},
  isActive: false,
});

export const useTour = () => useContext(TourContext);

const SEEN_PREFIX = 'jadai_tour_seen_';
const SPOTLIGHT_PADDING = 8;

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [tour, setTour] = useState<Tour | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [ready, setReady] = useState(false);
  const rafRef = useRef<number | null>(null);

  const step = tour?.steps[stepIndex];
  const placement = step?.placement || 'bottom';

  const measure = useCallback(() => {
    if (!step) return;
    const el = document.querySelector<HTMLElement>(`[data-tour="${CSS.escape(step.anchor)}"]`);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step]);

  // Measure on step change + on resize/scroll (keep the spotlight glued).
  useEffect(() => {
    if (!tour || !step) {
      setRect(null);
      return;
    }
    setReady(false);
    // Wait a tick so the target is painted (e.g. after a route render).
    const t = window.setTimeout(() => {
      measure();
      setReady(true);
    }, 60);
    return () => window.clearTimeout(t);
  }, [tour, step, measure]);

  useEffect(() => {
    if (!tour || !step) return;
    const onMove = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    };
    window.addEventListener('resize', onMove);
    window.addEventListener('scroll', onMove, true);
    return () => {
      window.removeEventListener('resize', onMove);
      window.removeEventListener('scroll', onMove, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [tour, step, measure]);

  const startTour = useCallback((t: Tour) => {
    setTour(t);
    setStepIndex(0);
  }, []);

  const endTour = useCallback(() => {
    if (tour) {
      try {
        localStorage.setItem(SEEN_PREFIX + tour.id, '1');
      } catch {}
    }
    setTour(null);
    setStepIndex(0);
  }, [tour]);

  const next = useCallback(() => {
    if (!tour) return;
    if (stepIndex >= tour.steps.length - 1) {
      endTour();
    } else {
      setStepIndex((i) => i + 1);
    }
  }, [tour, stepIndex, endTour]);

  const prev = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  // Compute the card position relative to the spotlight.
  const cardStyle: React.CSSProperties = (() => {
    if (!rect) return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
    const gap = SPOTLIGHT_PADDING + 14;
    switch (placement) {
      case 'top':
        return { left: rect.left + rect.width / 2, top: rect.top - gap, transform: 'translate(-50%, -100%)' };
      case 'left':
        return { left: rect.left - gap, top: rect.top + rect.height / 2, transform: 'translate(-100%, -50%)' };
      case 'right':
        return { left: rect.left + rect.width + gap, top: rect.top + rect.height / 2, transform: 'translate(0, -50%)' };
      case 'bottom':
      default:
        return { left: rect.left + rect.width / 2, top: rect.top + rect.height + gap, transform: 'translate(-50%, 0)' };
    }
  })();

  return (
    <TourContext.Provider value={{ startTour, endTour, isActive: Boolean(tour) }}>
      {children}
      <AnimatePresence>
        {tour && step && (
          <>
            {/* Dimmed backdrop */}
            <motion.div
              className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={endTour}
            />

            {/* Spotlight ring around the anchored element */}
            {ready && rect && (
              <motion.div
                className="fixed z-[9999] pointer-events-none rounded-xl"
                style={{
                  top: rect.top - SPOTLIGHT_PADDING,
                  left: rect.left - SPOTLIGHT_PADDING,
                  width: rect.width + SPOTLIGHT_PADDING * 2,
                  height: rect.height + SPOTLIGHT_PADDING * 2,
                  boxShadow: '0 0 0 2px #C9A84C, 0 0 30px rgba(201,168,76,0.5)',
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}

            {/* Tour card */}
            <motion.div
              className="fixed z-[10000] w-[min(340px,86vw)] rounded-2xl border border-[rgba(201,168,76,0.4)] bg-[#0a0908]/95 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur"
              style={cardStyle}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#e8c96a]" />
                  <span className="text-[11px] uppercase tracking-[0.18em] text-[#8a8580]">
                    Step {stepIndex + 1} of {tour.steps.length}
                  </span>
                </div>
                <button
                  onClick={endTour}
                  aria-label="Skip tour"
                  className="text-[#8a8580] hover:text-[#e8c96a] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h3 className="mt-2 text-[15px] font-semibold text-[#f3efe6]">{step.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-[#b6b1a9]">{step.description}</p>

              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={endTour}
                  className="text-[12px] text-[#8a8580] hover:text-[#b6b1a9] transition-colors"
                >
                  Skip
                </button>
                <div className="flex items-center gap-2">
                  {stepIndex > 0 && (
                    <button
                      onClick={prev}
                      className="text-[12px] text-[#8a8580] hover:text-[#b6b1a9] transition-colors"
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={next}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#C9A84C] px-3 py-1.5 text-[12px] font-medium text-[#050404] hover:bg-[#e8c96a] transition-colors"
                  >
                    {stepIndex >= tour.steps.length - 1 ? 'Done' : 'Next'}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </TourContext.Provider>
  );
}

/** Marks a tour as seen (so its auto-run won't fire again). */
export function markTourSeen(id: string) {
  try {
    localStorage.setItem(SEEN_PREFIX + id, '1');
  } catch {}
}

export function hasSeenTour(id: string): boolean {
  try {
    return localStorage.getItem(SEEN_PREFIX + id) === '1';
  } catch {
    return false;
  }
}

/** Runs a tour automatically once if it hasn't been seen. */
export function useAutoTour(tour: Tour, deps: unknown[] = []) {
  const { startTour, isActive } = useTour();
  useEffect(() => {
    if (!tour.auto || isActive) return;
    if (hasSeenTour(tour.id)) return;
    const t = window.setTimeout(() => startTour(tour), 900);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour, isActive, ...deps]);
}
