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
  const rowRefs = useRef<Record<string, HTMLElement | null>>({});

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
    if (items.length === 0) return;

    let rafId = 0;

    const updateScrollState = () => {
      rafId = 0;
      const positions = items
        .map((item) => {
          const el = rowRefs.current[item.id];
          if (!el) return null;
          return { id: item.id, top: el.getBoundingClientRect().top };
        })
        .filter((entry): entry is { id: string; top: number } => entry !== null);

      if (positions.length === 0) return;

      const vh = window.innerHeight;
      const mobile = window.innerWidth < 768;
      const lastRow = rowRefs.current[items[items.length - 1].id];
      const lastVisible =
        lastRow !== null &&
        lastRow !== undefined &&
        lastRow.getBoundingClientRect().top < vh * 0.92;
      const isAtPageBottom =
        lastVisible &&
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
    const el = rowRefs.current[id];
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
      className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] lg:gap-14"
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
        <ol aria-label="Experience roles" className="mt-7 hidden lg:grid gap-1">
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
                  className={`group grid w-full grid-cols-[24px_minmax(0,1fr)] items-baseline gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white/60 ${
                    isActive
                      ? 'bg-[#F5F5F4] dark:bg-[#17191C] text-[#1A1A1A] dark:text-[#F0F0EE]'
                      : 'text-[#666666] dark:text-[#9A9A96] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE]'
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

      {/* Right Column: Clean Boxless Editorial Rows */}
      <div className="divide-y divide-[#EAEAEA] dark:divide-[#1E1E1C]">
        {items.map((item, idx) => {
          const isActive = activeId === item.id;
          const conciseStack = item.stack.slice(0, 6);

          return (
            <article
              key={item.id}
              id={`${idPrefix}-${item.id}`}
              ref={(node) => {
                rowRefs.current[item.id] = node;
              }}
              data-xp-card="true"
              data-active={isActive ? 'true' : 'false'}
              className="scroll-mt-24 lg:scroll-mt-28 py-6 first:pt-0 last:pb-0"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <span className="pt-1 font-mono text-[11px] text-[#888884] dark:text-[#686864] tabular-nums select-none">
                  {idx + 1}
                </span>

                <div className="min-w-0 flex-1 space-y-2.5">
                  <div>
                    <h3 className="text-[16px] sm:text-[18px] leading-snug tracking-[-0.01em]">
                      <span className="font-semibold text-[#1A1A1A] dark:text-[#F5F5F3]">
                        {item.role}
                      </span>
                      <span
                        aria-hidden="true"
                        className="mx-2 font-normal text-[#888884] dark:text-[#555552]"
                      >
                        /
                      </span>
                      <span className="font-normal text-[#666666] dark:text-[#A3A39E]">
                        {item.organization}
                      </span>
                    </h3>

                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-mono text-[#666666] dark:text-[#9A9A96]">
                      <span>{item.location}</span>
                      <span aria-hidden="true" className="opacity-45">
                        ·
                      </span>
                      <span className="tabular-nums">{item.period}</span>
                      {item.organizationUrl ? (
                        <>
                          <span aria-hidden="true" className="opacity-45">
                            ·
                          </span>
                          <a
                            href={item.organizationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#1A1A1A] dark:text-[#F0F0EE] underline underline-offset-4 decoration-black/25 dark:decoration-white/25 hover:opacity-70 transition-opacity"
                          >
                            <span>{item.organizationUrlLabel ?? 'Official Site'}</span>
                            <ArrowUpRight className="h-3 w-3 opacity-70" aria-hidden="true" />
                          </a>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <p className="max-w-[62ch] text-[13.5px] leading-[1.7] text-[#3A3A37] dark:text-[#C8C8C4]">
                    {item.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#666666] dark:text-[#8E8E8A]">
                    {conciseStack.map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
