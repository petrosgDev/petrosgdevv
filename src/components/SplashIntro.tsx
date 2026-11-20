'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { shouldSkipSplash } from '@/lib/portfolioLogic';

const SPLASH_SESSION_KEY = 'petros-splash-seen';
const ARCHITECTURAL_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];
const REVEAL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

type SplashPhase = 'idle' | 'entering' | 'splitting' | 'done';

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

  const triggerSplitExit = useCallback(() => {
    clearTimers();
    try {
      window.sessionStorage.setItem(SPLASH_SESSION_KEY, '1');
    } catch {
      // Ignore storage access restrictions
    }
    setPhase((current) => (current === 'done' || current === 'splitting' ? current : 'splitting'));
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

    // Lock body scroll briefly while the architectural curtain animates
    document.body.style.overflow = 'hidden';
    setPhase('entering');

    // Clear pre-paint cover flag immediately on next frame once React curtain takes over
    const clearCoverTimer = window.setTimeout(() => {
      document.documentElement.removeAttribute('data-splash');
    }, 16);

    // Hold cleanly so both PETROS GETO and SOFTWARE ENGINEER read effortlessly before splitting
    const splitTimer = window.setTimeout(() => {
      triggerSplitExit();
    }, 1520);

    timersRef.current.push(clearCoverTimer, splitTimer);

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
  }, [clearTimers, markFinished, triggerSplitExit]);

  if (phase === 'idle' || phase === 'done') {
    return null;
  }

  const isSplitting = phase === 'splitting';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Petros Geto — Software Engineer intro"
      data-testid="splash-intro"
      data-phase={phase}
      className="fixed inset-0 z-[120] overflow-hidden select-none"
    >
      {/* Upper Shutter Blade */}
      <motion.div
        initial={{ y: '0%' }}
        animate={{ y: isSplitting ? '-100%' : '0%' }}
        transition={{ duration: 0.68, ease: ARCHITECTURAL_EASE }}
        className="absolute inset-x-0 top-0 h-1/2 bg-[#0A0A09] text-[#F5F5F2] overflow-hidden will-change-transform"
      >
        {/* Subtle Architectural Grid Hairlines */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 mx-auto max-w-[1200px] grid grid-cols-4 border-x border-white/[0.06]"
        >
          <div className="border-r border-white/[0.06]" />
          <div className="border-r border-white/[0.06]" />
          <div className="border-r border-white/[0.06]" />
          <div />
        </div>

        {/* Top Corner Monograph Registration Marks */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: isSplitting ? 0 : 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.04, ease: REVEAL_EASE }}
          className="relative z-10 mx-auto flex max-w-[1200px] items-center justify-between px-6 pt-7 md:px-10 font-mono text-[10.5px] uppercase tracking-[0.22em] text-white/60"
        >
          <span>PETROS G DEV</span>
          <span className="tabular-nums">09°01′N · 38°44′E</span>
        </motion.div>

        {/* Primary Name Rising Directly From The Center Seam */}
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1200px] px-6 md:px-10 pb-3 sm:pb-4 overflow-hidden">
          <motion.div
            initial={{ y: '108%' }}
            animate={{ y: isSplitting ? '-12%' : '0%', opacity: isSplitting ? 0.35 : 1 }}
            transition={{
              y: { duration: 0.56, delay: isSplitting ? 0 : 0.06, ease: REVEAL_EASE },
              opacity: { duration: 0.24 },
            }}
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1"
          >
            <h1 className="font-display text-[clamp(3.4rem,11.5vw,8.6rem)] font-extrabold uppercase leading-[0.82] tracking-[-0.02em] text-[#F5F5F2]">
              PETROS{' '}
              <span className="text-[#9A9A94]">GETO</span>
            </h1>
            <span className="hidden md:inline-block font-mono text-[11px] uppercase tracking-[0.24em] text-white/55 tabular-nums pb-1">
              EDITION — 2026
            </span>
          </motion.div>
        </div>

        {/* Bottom Hairline Edge of Upper Shutter */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px bg-white/20"
        />
      </motion.div>

      {/* Lower Shutter Blade */}
      <motion.div
        initial={{ y: '0%' }}
        animate={{ y: isSplitting ? '100%' : '0%' }}
        transition={{ duration: 0.68, ease: ARCHITECTURAL_EASE }}
        className="absolute inset-x-0 bottom-0 h-1/2 bg-[#0A0A09] text-[#F5F5F2] overflow-hidden will-change-transform"
      >
        {/* Subtle Architectural Grid Hairlines */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 mx-auto max-w-[1200px] grid grid-cols-4 border-x border-white/[0.06]"
        >
          <div className="border-r border-white/[0.06]" />
          <div className="border-r border-white/[0.06]" />
          <div className="border-r border-white/[0.06]" />
          <div />
        </div>

        {/* Top Hairline Edge of Lower Shutter */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-white/20"
        />

        {/* Discipline Line Descending Cleanly From The Center Seam */}
        <div className="mx-auto max-w-[1200px] px-6 md:px-10 pt-4 sm:pt-5 overflow-hidden">
          <motion.div
            initial={{ y: '-115%', opacity: 0 }}
            animate={{ y: isSplitting ? '16%' : '0%', opacity: isSplitting ? 0.25 : 1 }}
            transition={{
              y: { duration: 0.52, delay: isSplitting ? 0 : 0.18, ease: REVEAL_EASE },
              opacity: { duration: 0.28, delay: isSplitting ? 0 : 0.18 },
            }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          >
            <motion.p
              initial={{ letterSpacing: '0.2em' }}
              animate={{ letterSpacing: '0.32em' }}
              transition={{ duration: 0.68, delay: 0.2, ease: REVEAL_EASE }}
              className="font-mono text-[12px] sm:text-[14px] font-medium uppercase text-[#F5F5F2]"
            >
              SOFTWARE ENGINEER
            </motion.p>
            <p className="font-mono text-[10.5px] sm:text-[11px] uppercase tracking-[0.2em] text-white/60">
              FULL-STACK · SYSTEMS · ADDIS ABABA
            </p>
          </motion.div>
        </div>

        {/* Bottom Registration Bar & Quiet Skip Control */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isSplitting ? 0 : 1 }}
          transition={{ duration: 0.3, delay: 0.12 }}
          className="absolute inset-x-0 bottom-0 mx-auto flex max-w-[1200px] items-center justify-between px-6 pb-7 md:px-10"
        >
          <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-white/50">
            SELECTED WORKS &amp; ARCHITECTURE
          </span>

          <button
            type="button"
            onClick={markFinished}
            aria-label="Skip intro animation"
            className="rounded border border-white/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white/75 hover:border-white/50 hover:text-white transition-colors cursor-pointer"
          >
            Skip
          </button>
        </motion.div>
      </motion.div>

      {/* Razor-Thin Center Seam Wipe Line (Draws Across Before The Split) */}
      <motion.div
        aria-hidden="true"
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{
          scaleX: 1,
          opacity: isSplitting ? 0 : 1,
        }}
        transition={{
          scaleX: { duration: 0.48, delay: 0.02, ease: REVEAL_EASE },
          opacity: { duration: 0.14 },
        }}
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-px origin-left bg-white/85"
      />
    </div>
  );
}
