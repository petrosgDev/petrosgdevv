'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import type { ExperienceItem } from '@/data/portfolio';
import { getActiveExperienceId } from '@/lib/portfolioLogic';

interface ExperienceShowcaseProps {
  items: readonly ExperienceItem[];
  eyebrow?: string;
  heading?: string;
  idPrefix?: string;
  showAboutLink?: boolean;
}

export function ExperienceShowcase({
  items,
  eyebrow = '04. Experience',
  heading = "Where I've Been",
  idPrefix = 'exp',
  showAboutLink = false,
}: ExperienceShowcaseProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '');
  const [openMobileId, setOpenMobileId] = useState<string>(items[0]?.id ?? '');
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    let rafId = 0;

    const updateActive = () => {
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

      const lastCard = cardRefs.current[items[items.length - 1].id];
      const lastCardVisible =
        lastCard !== null &&
        lastCard !== undefined &&
        lastCard.getBoundingClientRect().top < window.innerHeight * 0.75;
      const isAtPageBottom =
        lastCardVisible &&
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24;

      const nextId = getActiveExperienceId(positions, 240, isAtPageBottom);
      if (nextId) {
        setActiveId(nextId);
      }
    };

    const onScroll = () => {
      if (rafId !== 0) return;
      rafId = window.requestAnimationFrame(updateActive);
    };

    updateActive();
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
    setOpenMobileId(id);
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
      {/* Left Column: Sticky Section Heading & Scroll-Spy Role Index */}
      <aside className="lg:sticky lg:top-[104px]">
        <div className="space-y-2.5">
          <div className="flex items-center gap-4">
            <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#666666] dark:text-[#9A9A96] whitespace-nowrap">
              {eyebrow}
            </p>
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-[#E5E5E2] dark:bg-[#262624]"
            />
          </div>

          <h2 className="font-display text-[28px] sm:text-[34px] font-bold uppercase tracking-tight leading-[1.04] text-[#1A1A1A] dark:text-[#F0F0EE]">
            {heading}
          </h2>
        </div>

        {/* Interactive Desktop Sticky Role Index */}
        <ol
          aria-label="Experience roles"
          className="mt-7 hidden lg:grid gap-1"
        >
          {items.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleSelectRole(item.id)}
                  data-xp-item="true"
                  data-active={isActive ? 'true' : 'false'}
                  aria-current={isActive ? 'true' : undefined}
                  className={`group grid w-full grid-cols-[18px_minmax(0,1fr)] items-baseline gap-3 rounded-xl px-3.5 py-2.5 text-left transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white/60 ${
                    isActive
                      ? 'bg-[#EFEFED] dark:bg-[#1B1B19] text-[#1A1A1A] dark:text-[#F0F0EE]'
                      : 'text-[#6E6E6A] dark:text-[#8E8E8A] hover:bg-black/[0.035] dark:hover:bg-white/[0.04] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE]'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`mt-1 h-[9px] w-[9px] rounded-full border-[1.5px] transition-all duration-200 ${
                      isActive
                        ? 'scale-125 border-[#1A1A1A] bg-[#1A1A1A] dark:border-[#F0F0EE] dark:bg-[#F0F0EE]'
                        : 'border-[#8C8C87] bg-transparent dark:border-[#6C6C68] group-hover:border-[#1A1A1A] dark:group-hover:border-[#F0F0EE]'
                    }`}
                  />
                  <span className="min-w-0">
                    <span
                      className={`block truncate text-[14.5px] tracking-[-0.01em] transition-colors ${
                        isActive
                          ? 'font-semibold text-[#1A1A1A] dark:text-[#F0F0EE]'
                          : 'font-medium'
                      }`}
                    >
                      {item.organization}
                    </span>
                    <span className="mt-0.5 block truncate text-[12px] text-[#666666] dark:text-[#9A9A96]">
                      {item.role} · {item.shortYear}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {showAboutLink && (
          <div className="mt-6 hidden lg:block pl-3.5">
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] underline underline-offset-4 hover:opacity-65 transition-opacity whitespace-nowrap"
            >
              <span>Full background &amp; skills</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        )}
      </aside>

      {/* Right Column: Scrollable Framed Experience Cards */}
      <div className="grid gap-5 lg:gap-7">
        {items.map((item) => {
          const isActive = activeId === item.id;
          const isMobileOpen = openMobileId === item.id;
          const panelId = `${idPrefix}-panel-${item.id}`;

          return (
            <article
              key={item.id}
              id={`${idPrefix}-${item.id}`}
              ref={(node) => {
                cardRefs.current[item.id] = node;
              }}
              data-xp-card="true"
              data-active={isActive ? 'true' : 'false'}
              className={`scroll-mt-28 rounded-2xl border-[1.5px] bg-white dark:bg-[#121211] p-5 sm:p-7 transition-all duration-200 ${
                isActive
                  ? 'border-[#1A1A1A] dark:border-[#E5E5E0] shadow-[4px_4px_0_0_#1A1A1A] dark:shadow-[4px_4px_0_0_rgba(240,240,238,0.22)]'
                  : 'border-[#1A1A1A]/20 dark:border-white/15 shadow-[3px_3px_0_0_rgba(26,26,26,0.08)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.05)] hover:border-[#1A1A1A]/50 dark:hover:border-white/30'
              }`}
            >
              {/* Date & Location Header */}
              <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[13px] text-[#666666] dark:text-[#9A9A96]">
                <strong className="font-semibold text-[#1A1A1A] dark:text-[#F0F0EE] tabular-nums">
                  {item.period}
                </strong>
                <span aria-hidden="true">·</span>
                <span>{item.location}</span>
              </p>

              {/* Desktop Title */}
              <h3 className="mt-2 hidden lg:block text-[18px] font-semibold tracking-[-0.015em] text-[#1A1A1A] dark:text-[#F0F0EE]">
                {item.role}{' '}
                <span className="font-normal text-[#666666] dark:text-[#9A9A96]">
                  — {item.organization}
                </span>
              </h3>

              {/* Mobile Collapsible Accordion Trigger */}
              <h3 className="mt-1.5 lg:hidden">
                <button
                  type="button"
                  onClick={() =>
                    setOpenMobileId((prev) => (prev === item.id ? '' : item.id))
                  }
                  aria-expanded={isMobileOpen}
                  aria-controls={panelId}
                  className="flex min-h-[44px] w-full items-center justify-between gap-3 text-left text-[16px] font-semibold tracking-[-0.015em] text-[#1A1A1A] dark:text-[#F0F0EE] cursor-pointer"
                >
                  <span>
                    {item.role}{' '}
                    <span className="font-normal text-[#666666] dark:text-[#9A9A96]">
                      — {item.organization}
                    </span>
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`h-4 w-4 shrink-0 text-[#666666] dark:text-[#9A9A96] transition-transform duration-200 ${
                      isMobileOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </h3>

              {/* Card Body (Always visible on desktop lg+; collapsible on mobile) */}
              <div
                id={panelId}
                className={`${isMobileOpen ? 'block' : 'hidden'} lg:block`}
              >
                <p className="mt-2.5 max-w-[62ch] text-[14px] leading-[1.7] text-[#454542] dark:text-[#C8C8C4]">
                  {item.summary}
                </p>

                <ul className="mt-4 grid gap-2.5">
                  {item.points.map((point) => (
                    <li
                      key={`${item.id}-${point.lead ?? point.text.slice(0, 24)}`}
                      className="relative pl-5 text-[13.5px] leading-[1.7] text-[#52524E] dark:text-[#B5B5B0]"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-[0.58em] h-[7px] w-[7px] rounded-[1.5px] border border-[#1A1A1A] bg-[#1A1A1A] dark:border-[#F0F0EE] dark:bg-[#F0F0EE]"
                      />
                      {point.lead && (
                        <strong className="font-semibold text-[#1A1A1A] dark:text-[#F0F0EE]">
                          {point.lead}{' '}
                        </strong>
                      )}
                      <span>{point.text}</span>
                    </li>
                  ))}
                </ul>

                {/* Crisp Rectangular Stack Chips */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {item.stack.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center rounded-md border border-[#E2E2DE] dark:border-[#2B2B28] bg-[#FAFAFA] dark:bg-[#191918] px-2.5 py-1 text-[11.5px] font-medium text-[#3A3A37] dark:text-[#D4D4D0]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          );
        })}

        {showAboutLink && (
          <div className="pt-1 lg:hidden">
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] underline underline-offset-4 hover:opacity-65 transition-opacity whitespace-nowrap"
            >
              <span>Full background &amp; skills</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
