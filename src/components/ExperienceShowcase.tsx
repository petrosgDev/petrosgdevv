'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import type { ExperienceItem } from '@/data/portfolio';
import {
  computeExpandedExperienceIds,
  getActiveExperienceId,
} from '@/lib/portfolioLogic';

const EXPAND_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const MOBILE_MEDIA_QUERY = '(max-width: 767px)';

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
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const expandedRef = useRef<Set<string>>(new Set());
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    let mobile = mediaQuery.matches;
    setIsMobileView(mobile);

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
      const lastCard = cardRefs.current[items[items.length - 1].id];
      const lastCardVisible =
        lastCard !== null &&
        lastCard !== undefined &&
        lastCard.getBoundingClientRect().top < vh * 0.92;
      const isAtPageBottom =
        lastCardVisible &&
        vh + window.scrollY >= document.documentElement.scrollHeight - 28;

      const activationOffset = mobile ? Math.min(280, Math.round(vh * 0.34)) : 240;
      const nextActiveId = getActiveExperienceId(positions, activationOffset, isAtPageBottom);
      if (nextActiveId) {
        setActiveId((prev) => (prev === nextActiveId ? prev : nextActiveId));
      }

      if (!mobile) {
        return;
      }

      const nextExpanded = computeExpandedExperienceIds(
        positions,
        expandedRef.current,
        vh,
        isAtPageBottom
      );

      const prevSet = expandedRef.current;
      const changed =
        nextExpanded.length !== prevSet.size ||
        nextExpanded.some((id) => !prevSet.has(id));

      if (changed) {
        expandedRef.current = new Set(nextExpanded);
        setExpandedIds(nextExpanded);
      }
    };

    const onScroll = () => {
      if (rafId !== 0) return;
      rafId = window.requestAnimationFrame(updateScrollState);
    };

    const onMediaChange = (event: MediaQueryListEvent) => {
      mobile = event.matches;
      setIsMobileView(mobile);
      updateScrollState();
    };

    updateScrollState();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    mediaQuery.addEventListener('change', onMediaChange);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      mediaQuery.removeEventListener('change', onMediaChange);
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [items]);

  const handleSelectRole = (id: string) => {
    setActiveId(id);
    if (isMobileView && !expandedRef.current.has(id)) {
      const nextSet = new Set(expandedRef.current);
      nextSet.add(id);
      expandedRef.current = nextSet;
      setExpandedIds(Array.from(nextSet));
    }

    const el = cardRefs.current[id];
    if (el) {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  };

  const expandedSet = new Set(expandedIds);

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

      {/* Right Column: Tablet & Desktop stay fully expanded as before; Mobile animates reduced -> full detail on scroll */}
      <div className="grid gap-4 md:gap-5 lg:gap-7">
        {items.map((item) => {
          const isActive = activeId === item.id;
          const isExpanded = !isMobileView || expandedSet.has(item.id);

          return (
            <article
              key={item.id}
              id={`${idPrefix}-${item.id}`}
              ref={(node) => {
                cardRefs.current[item.id] = node;
              }}
              data-xp-card="true"
              data-active={isActive ? 'true' : 'false'}
              data-expanded={isExpanded ? 'true' : 'false'}
              className={`scroll-mt-24 lg:scroll-mt-28 rounded-2xl border-[1.5px] transition-all duration-300 ${
                !isMobileView
                  ? `p-5 sm:p-7 bg-white dark:bg-[#121211] ${
                      isActive
                        ? 'border-[#1A1A1A] dark:border-[#E5E5E0] shadow-[4px_4px_0_0_#1A1A1A] dark:shadow-[4px_4px_0_0_rgba(240,240,238,0.22)]'
                        : 'border-[#1A1A1A]/20 dark:border-white/15 shadow-[3px_3px_0_0_rgba(26,26,26,0.08)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.05)] hover:border-[#1A1A1A]/50 dark:hover:border-white/30'
                    }`
                  : isExpanded
                    ? `p-5 bg-white dark:bg-[#121211] ${
                        isActive
                          ? 'border-[#1A1A1A] dark:border-[#E5E5E0] shadow-[4px_4px_0_0_#1A1A1A] dark:shadow-[4px_4px_0_0_rgba(240,240,238,0.22)]'
                          : 'border-[#1A1A1A]/30 dark:border-white/20 shadow-[3px_3px_0_0_rgba(26,26,26,0.08)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.05)]'
                      }`
                    : 'px-5 py-4 bg-[#FAFAFA] dark:bg-[#10100F] border-[#1A1A1A]/15 dark:border-white/12 shadow-[2px_2px_0_0_rgba(26,26,26,0.04)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.03)]'
              }`}
            >
              {/* Date, Location & Optional External Organization Link */}
              <div className="flex flex-wrap items-start sm:items-baseline justify-between gap-x-3 gap-y-1">
                <p className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-x-2 gap-y-0.5 text-[13px] text-[#666666] dark:text-[#9A9A96]">
                  <span className="inline-flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`inline-block lg:hidden h-2 w-2 shrink-0 rounded-full border-[1.5px] transition-all duration-300 ${
                        (isMobileView ? isExpanded : isActive)
                          ? 'scale-110 border-[#1A1A1A] bg-[#1A1A1A] dark:border-[#F0F0EE] dark:bg-[#F0F0EE]'
                          : 'border-[#8C8C87] bg-transparent dark:border-[#6C6C68]'
                      }`}
                    />
                    <strong className="font-semibold text-[#1A1A1A] dark:text-[#F0F0EE] tabular-nums">
                      {item.period}
                    </strong>
                  </span>
                  <span aria-hidden="true" className="hidden sm:inline">
                    ·
                  </span>
                  <span>{item.location}</span>
                </p>

                <div className="flex items-center gap-3">
                  {item.organizationUrl && (!isMobileView || isExpanded) && (
                    <a
                      href={item.organizationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] underline underline-offset-4 decoration-[#1A1A1A]/40 dark:decoration-[#F0F0EE]/40 hover:opacity-65 transition-opacity whitespace-nowrap"
                    >
                      <span>{item.organizationUrlLabel ?? 'Official Site'}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  )}

                  {/* Mobile-Only Expansion Indicator */}
                  {isMobileView && (
                    <span
                      aria-hidden="true"
                      className="relative inline-flex md:hidden h-4 w-4 items-center justify-center text-[#777772] dark:text-[#8E8E88]"
                    >
                      <span className="block h-[1.5px] w-2.5 bg-current" />
                      <span
                        className={`absolute block h-2.5 w-[1.5px] bg-current transition-transform duration-300 ${
                          isExpanded ? 'scale-y-0 opacity-0' : 'scale-y-100 opacity-100'
                        }`}
                      />
                    </span>
                  )}
                </div>
              </div>

              {/* Card Role & Organization Heading */}
              <h3
                className={`mt-2 font-semibold tracking-[-0.015em] transition-colors duration-300 ${
                  !isMobileView || isExpanded
                    ? 'text-[16.5px] sm:text-[18px] text-[#1A1A1A] dark:text-[#F0F0EE]'
                    : 'text-[15.5px] text-[#353532] dark:text-[#CBCBC6]'
                }`}
              >
                {item.role}{' '}
                <span className="font-normal text-[#666666] dark:text-[#9A9A96]">
                  — {item.organization}
                </span>
              </h3>

              {/* Card Body — Full & Static on Tablet/Desktop; Scroll-Animated Reduced -> Full Detail on Mobile Only */}
              {!isMobileView ? (
                <div>
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
              ) : (
                <motion.div
                  initial={false}
                  animate={{
                    height: isExpanded ? 'auto' : 0,
                    opacity: isExpanded ? 1 : 0,
                  }}
                  transition={{
                    height: { duration: 0.48, ease: EXPAND_EASE },
                    opacity: {
                      duration: isExpanded ? 0.34 : 0.2,
                      delay: isExpanded ? 0.08 : 0,
                      ease: 'easeOut',
                    },
                  }}
                  aria-hidden={!isExpanded}
                  className="overflow-hidden"
                >
                  <div className="pt-2.5">
                    <motion.p
                      initial={false}
                      animate={{
                        y: isExpanded ? 0 : 10,
                        opacity: isExpanded ? 1 : 0,
                      }}
                      transition={{
                        duration: 0.38,
                        delay: isExpanded ? 0.08 : 0,
                        ease: EXPAND_EASE,
                      }}
                      className="max-w-[62ch] text-[14px] leading-[1.7] text-[#454542] dark:text-[#C8C8C4]"
                    >
                      {item.summary}
                    </motion.p>

                    <ul className="mt-4 grid gap-2.5">
                      {item.points.map((point, idx) => (
                        <motion.li
                          key={`${item.id}-${point.lead ?? point.text.slice(0, 24)}`}
                          initial={false}
                          animate={{
                            y: isExpanded ? 0 : 10,
                            opacity: isExpanded ? 1 : 0,
                          }}
                          transition={{
                            duration: 0.36,
                            delay: isExpanded ? 0.12 + idx * 0.045 : 0,
                            ease: EXPAND_EASE,
                          }}
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
                        </motion.li>
                      ))}
                    </ul>

                    {/* Crisp Rectangular Stack Chips */}
                    <motion.div
                      initial={false}
                      animate={{
                        y: isExpanded ? 0 : 8,
                        opacity: isExpanded ? 1 : 0,
                      }}
                      transition={{
                        duration: 0.34,
                        delay: isExpanded ? 0.22 : 0,
                        ease: EXPAND_EASE,
                      }}
                      className="mt-5 flex flex-wrap gap-2"
                    >
                      {item.stack.map((tech) => (
                        <span
                          key={tech}
                          className="inline-flex items-center rounded-md border border-[#E2E2DE] dark:border-[#2B2B28] bg-[#FAFAFA] dark:bg-[#191918] px-2.5 py-1 text-[11.5px] font-medium text-[#3A3A37] dark:text-[#D4D4D0]"
                        >
                          {tech}
                        </span>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              )}
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
