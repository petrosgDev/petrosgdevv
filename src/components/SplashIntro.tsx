'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { shouldSkipSplash } from '@/lib/portfolioLogic';

const SPLASH_SESSION_KEY = 'petros-splash-seen';
const ARCHITECTURAL_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];
const REVEAL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Hand-crafted geometric Bauhaus/Swiss "P" centered in viewBox="0 0 156 200"
const P_OUTER_PATH =
  'M 26 180 L 26 20 L 78 20 A 52 52 0 0 1 78 124 L 58 124 L 58 180 Z';
const P_COUNTER_PATH =
  'M 58 46 L 78 46 A 26 26 0 0 1 78 98 L 58 98 Z';
const P_COMBINED_PATH = `${P_OUTER_PATH} ${P_COUNTER_PATH}`;

type SplashPhase = 'idle' | 'entering' | 'exiting' | 'done';

export function SplashIntro() {
  const [phase, setPhase] = useState<SplashPhase>('idle');
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) {
      window.clearTimeout(id);
    }
    timersRef.current = [];
  }, []);

  const markFinished = useCallback(() => {
    clearTimers();
    try {
      window.sessionStorage.setItem(SPLASH_SESSION_KEY, '1');
    } catch {
      // Ignore storage access restrictions
    }
    document.documentElement.removeAttribute('data-splash');
    document.body.style.overflow = '';
    setPhase('done');
  }, [clearTimers]);

  const triggerExit = useCallback(() => {
    clearTimers();
    try {
      window.sessionStorage.setItem(SPLASH_SESSION_KEY, '1');
    } catch {
      // Ignore storage access restrictions
    }
    setPhase((current) => (current === 'done' || current === 'exiting' ? current : 'exiting'));
    const doneTimer = window.setTimeout(() => {
      document.documentElement.removeAttribute('data-splash');
      document.body.style.overflow = '';
      setPhase('done');
    }, 680);
    timersRef.current.push(doneTimer);
  }, [clearTimers]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let sessionSeen = false;
    try {
      sessionSeen = window.sessionStorage.getItem(SPLASH_SESSION_KEY) === '1';
    } catch {
      sessionSeen = false;
    }

    const skip = shouldSkipSplash({
      search: window.location.search,
      sessionSeen,
      prefersReducedMotion,
    });

    if (skip) {
      document.documentElement.removeAttribute('data-splash');
      setPhase('done');
      return;
    }

    document.body.style.overflow = 'hidden';
    setPhase('entering');

    const clearCoverTimer = window.setTimeout(() => {
      document.documentElement.removeAttribute('data-splash');
    }, 16);

    const exitTimer = window.setTimeout(() => {
      triggerExit();
    }, 1360);

    timersRef.current.push(clearCoverTimer, exitTimer);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        markFinished();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimers();
      document.body.style.overflow = '';
      document.documentElement.removeAttribute('data-splash');
    };
  }, [clearTimers, markFinished, triggerExit]);

  if (phase === 'idle' || phase === 'done') {
    return null;
  }

  const isExiting = phase === 'exiting';

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Petros Geto monogram intro"
      data-testid="splash-intro"
      data-phase={phase}
      initial={{ y: '0%' }}
      animate={{ y: isExiting ? '-100%' : '0%' }}
      transition={{ duration: 0.64, delay: isExiting ? 0.06 : 0, ease: ARCHITECTURAL_EASE }}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[#090908] overflow-hidden select-none will-change-transform"
    >
      {/* Screen-reader / keyboard accessible instant dismiss without adding visual clutter */}
      <button
        type="button"
        onClick={markFinished}
        className="sr-only focus:not-sr-only focus:fixed focus:top-5 focus:right-5 focus:z-20 focus:rounded focus:border focus:border-white/30 focus:bg-[#090908] focus:px-3 focus:py-1.5 focus:font-mono focus:text-[11px] focus:uppercase focus:tracking-[0.2em] focus:text-white"
      >
        Skip intro
      </button>

      {/* Pure Sculptural Monogram "P" */}
      <motion.div
        initial={{ scale: 0.94, opacity: 1, y: 0 }}
        animate={{
          scale: isExiting ? 1.12 : 1,
          opacity: isExiting ? 0 : 1,
          y: isExiting ? -22 : 0,
        }}
        transition={{
          scale: { duration: isExiting ? 0.42 : 0.85, ease: REVEAL_EASE },
          opacity: { duration: 0.3, ease: 'easeOut' },
          y: { duration: 0.42, ease: ARCHITECTURAL_EASE },
        }}
        className="relative flex items-center justify-center will-change-transform"
      >
        <svg
          viewBox="0 0 156 200"
          className="h-[132px] w-[104px] sm:h-[172px] sm:w-[134px] overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <clipPath id="petros-p-monogram-clip">
              <path d={P_COMBINED_PATH} clipRule="evenodd" />
            </clipPath>
          </defs>

          {/* Stage 2: Solid Ivory Architectural Ink Sweep Inside the "P" Silhouette */}
          <g clipPath="url(#petros-p-monogram-clip)">
            <motion.rect
              x="0"
              width="156"
              height="200"
              fill="#F5F5F2"
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.52, delay: 0.46, ease: ARCHITECTURAL_EASE }}
            />
          </g>

          {/* Stage 1: Precision Draftsman Hairline Contour Trace */}
          <motion.path
            d={P_OUTER_PATH}
            fill="none"
            stroke="#F5F5F2"
            strokeWidth="1.75"
            strokeLinecap="square"
            strokeLinejoin="miter"
            initial={{ pathLength: 0, opacity: 0.95 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: { duration: 0.6, delay: 0.04, ease: ARCHITECTURAL_EASE },
              opacity: { duration: 0.2 },
            }}
          />

          <motion.path
            d={P_COUNTER_PATH}
            fill="none"
            stroke="#F5F5F2"
            strokeWidth="1.5"
            strokeLinecap="square"
            strokeLinejoin="miter"
            initial={{ pathLength: 0, opacity: 0.9 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: { duration: 0.42, delay: 0.24, ease: ARCHITECTURAL_EASE },
              opacity: { duration: 0.2, delay: 0.24 },
            }}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}
