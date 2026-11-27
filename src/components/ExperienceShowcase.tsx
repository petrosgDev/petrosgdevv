'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { ExperienceItem } from '@/data/portfolio';
import { getActiveExperienceId } from '@/lib/portfolioLogic';

interface ExperienceShowcaseProps {
  items: readonly ExperienceItem[];
  eyebrow?: string;
  heading?: string;
  idPrefix?: string;
}

export function ExperienceShowcase({
  items,
  eyebrow = '04. Experience',
  heading = "Where I've Been",
  idPrefix = 'exp',
}: ExperienceShowcaseProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '');
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  // Keep activeId synchronized when the experiences list updates dynamically
  useEffect(() => {
    if (items.length === 0) {
      setActiveId('');
      return;
    }
    setActiveId((prev) =>
      items.some((item) => item.id === prev) ? prev : items[0].id
    );
  }, [items]);

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    let rafId = 0;

    const updateScrollState = () => {
      rafId = 0;
      const positions = items
        .map((item) => {
          const el = cardRefs.current[item.id];
          if (!el) return null;
          return { id: item.id, top: el.getBoundingClientRect().top };
        })
        .filter((entry): entry is { id: string; top: number } => entry !== null);

      if (positions.length === 0) {
        return;
      }

      const vh = window.innerHeight;
      const mobile = window.innerWidth < 768;
      const lastCard = cardRefs.current[items[items.length - 1].id];
      const lastCardVisible =
        lastCard !== null &&
        lastCard !== undefined &&
        lastCard.getBoundingClientRect().top < vh * 0.92;
      const isAtPageBottom =
        lastCardVisible &&
        vh + window.scrollY >= document.documentElement.scrollHeight - 28;

      const activationOffset = mobile ? Math.min(260, Math.round(vh * 0.34)) : 240;
      const nextActiveId = getActiveExperienceId(positions, activationOffset, isAtPageBottom);
      if (nextActiveId) {
        setActiveId((prev) => (prev === nextActiveId ? prev : nextActiveId));
      }
    };

    const onScroll = () => {
      if (rafId !== 0) return;
      rafId = window.requestAnimationFrame(updateScrollState);
    };

    updateScrollState();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [items]);

  const handleSelectRole = (id: string) => {
    setActiveId(id);
    const el = cardRefs.current[id];
    if (el) {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <div
      data-testid="experience-showcase"
      className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.58fr)] lg:gap-14"
    >
      {/* Left Column: Sticky Editorial Index */}
      <aside className="lg:sticky lg:top-[104px]">
        <div className="space-y-2.5">
          <div className="flex items-center gap-3">
            <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#666666] dark:text-[#9A9A96] whitespace-nowrap">
              {eyebrow}
            </p>
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-[#EAEAEA] dark:bg-[#222220]"
            />
            <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[#666666] dark:text-[#9A9A96] tabular-nums">
              {String(items.length).padStart(2, '0')} Roles
            </span>
          </div>

          <h2 className="font-display text-[28px] sm:text-[34px] font-bold uppercase tracking-tight leading-[1.04] text-[#1A1A1A] dark:text-[#F0F0EE]">
            {heading}
          </h2>
        </div>

        {/* Desktop Sticky Timeline Index */}
        <ol
          aria-label="Experience roles"
          className="mt-7 hidden lg:grid gap-1 border-l border-[#EAEAEA] dark:border-[#222220]"
        >
          {items.map((item, idx) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleSelectRole(item.id)}
                  data-xp-item="true"
                  data-active={isActive ? 'true' : 'false'}
                  aria-current={isActive ? 'true' : undefined}
                  className={`group relative -ml-px grid w-full grid-cols-[24px_minmax(0,1fr)] items-baseline gap-2.5 border-l-2 py-2.5 pl-4 pr-3 text-left transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white/60 ${
                    isActive
                      ? 'border-[#1A1A1A] dark:border-[#F0F0EE] bg-[#F7F7F5] dark:bg-[#141413] text-[#1A1A1A] dark:text-[#F0F0EE]'
                      : 'border-transparent text-[#666666] dark:text-[#9A9A96] hover:border-black/25 dark:hover:border-white/25 hover:bg-black/[0.02] dark:hover:bg-white/[0.025] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE]'
                  }`}
                >
                  <span className="font-mono text-[11px] tabular-nums opacity-60">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block truncate text-[13.5px] tracking-[-0.01em] ${
                        isActive
                          ? 'font-semibold text-[#1A1A1A] dark:text-[#F0F0EE]'
                          : 'font-medium'
                      }`}
                    >
                      {item.organization}
                    </span>
                    <span className="mt-0.5 block truncate text-[11.5px] text-[#666666] dark:text-[#9A9A96]">
                      {item.role} · {item.shortYear}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </aside>

      {/* Right Column: Unified Architectural Timeline Cards (zero hydration layout jump across all viewports) */}
      <div className="grid gap-5 md:gap-6">
        {items.map((item, idx) => {
          const isActive = activeId === item.id;

          return (
            <article
              key={item.id}
              id={`${idPrefix}-${item.id}`}
              ref={(node) => {
                cardRefs.current[item.id] = node;
              }}
              data-xp-card="true"
              data-active={isActive ? 'true' : 'false'}
              className={`scroll-mt-24 lg:scroll-mt-28 rounded-2xl border p-5 sm:p-7 transition-colors duration-200 ${
                isActive
                  ? 'border-[#1A1A1A]/35 dark:border-white/25 bg-white dark:bg-[#131312] shadow-sm'
                  : 'border-[#EAEAEA] dark:border-[#222220] bg-[#FAFAFA]/75 dark:bg-[#0E0E0D] hover:border-black/20 dark:hover:border-white/20'
              }`}
            >
              {/* Top Metadata Strip: Index, Period Pill, Location & External Link */}
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#666666] dark:text-[#9A9A96]">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] opacity-65 tabular-nums">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-[#E2E2DE] dark:border-[#2B2B28] bg-[#F7F7F5] dark:bg-[#161615] px-2.5 py-0.5 font-mono text-[11px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] tabular-nums">
                    {item.period}
                  </span>
                  <span aria-hidden="true" className="opacity-40">
                    ·
                  </span>
                  <span>{item.location}</span>
                </div>

                {item.organizationUrl ? (
                  <a
                    href={item.organizationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-[#E2E2DE] dark:border-[#2B2B28] px-3 py-1 text-[11.5px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors whitespace-nowrap"
                  >
                    <span>{item.organizationUrlLabel ?? 'Official Site'}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-70" aria-hidden="true" />
                  </a>
                ) : null}
              </div>

              {/* Role Title & Organization */}
              <div className="mt-3.5 space-y-1">
                <h3 className="font-display text-[20px] sm:text-[22px] font-bold uppercase tracking-tight leading-tight text-[#1A1A1A] dark:text-[#F0F0EE]">
                  {item.role}
                </h3>
                <p className="text-[13.5px] font-medium text-[#666666] dark:text-[#9A9A96]">
                  {item.organization}
                </p>
              </div>

              {/* Executive Summary */}
              <p className="mt-3 max-w-[64ch] text-[13.5px] sm:text-[14px] leading-[1.75] text-[#2A2A2A] dark:text-[#D4D4D0]">
                {item.summary}
              </p>

              {/* Key Engineering Contributions */}
              <ul className="mt-4 grid gap-2.5 border-t border-[#EAEAEA] dark:border-[#222220] pt-4">
                {item.points.map((point) => (
                  <li
                    key={`${item.id}-${point.lead ?? point.text.slice(0, 24)}`}
                    className="relative pl-4 text-[13px] sm:text-[13.5px] leading-[1.68] text-[#52524E] dark:text-[#B5B5B0]"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-[0.62em] h-1.5 w-1.5 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE]"
                    />
                    {point.lead ? (
                      <strong className="font-semibold text-[#1A1A1A] dark:text-[#F0F0EE]">
                        {point.lead}{' '}
                      </strong>
                    ) : null}
                    <span>{point.text}</span>
                  </li>
                ))}
              </ul>

              {/* Stack Tags */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {item.stack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center rounded-md border border-[#E5E5E3] dark:border-[#262624] bg-[#F7F7F5] dark:bg-[#161615] px-2.5 py-0.5 font-mono text-[11px] text-[#3A3A37] dark:text-[#D4D4D0]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
