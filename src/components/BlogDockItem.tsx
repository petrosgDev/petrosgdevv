'use client';

import type { MouseEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Eye, Newspaper, Send } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { TelegramFeedPayload, TelegramPost } from '@/lib/telegramParser';
import { TELEGRAM_CHANNEL_URL } from '@/lib/telegramParser';

interface BlogDockItemProps {
  active: boolean;
  variant: 'desktop' | 'mobile';
  layoutId: string;
  onNavigate?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

interface CachedTelegramSummary {
  channelTitle: string;
  username: string;
  latestPost: TelegramPost | null;
  totalLoaded: number;
}

let cachedSummary: CachedTelegramSummary | null = null;
let inflightSummaryPromise: Promise<CachedTelegramSummary | null> | null = null;

const VISITED_STORAGE_KEY = 'petros-blog-visited-post';

async function loadLatestTelegramSummary(): Promise<CachedTelegramSummary | null> {
  if (cachedSummary) {
    return cachedSummary;
  }
  if (inflightSummaryPromise) {
    return inflightSummaryPromise;
  }

  inflightSummaryPromise = fetch('/api/telegram/')
    .then(async (res) => {
      if (!res.ok) return null;
      const data = (await res.json()) as TelegramFeedPayload;
      const summary: CachedTelegramSummary = {
        channelTitle: data.channel?.title || 'Abyssinia Tech',
        username: data.channel?.username || '@abysiniyatech',
        latestPost: data.posts?.[0] ?? null,
        totalLoaded: data.posts?.length ?? 0,
      };
      cachedSummary = summary;
      return summary;
    })
    .catch(() => null)
    .finally(() => {
      inflightSummaryPromise = null;
    });

  return inflightSummaryPromise;
}

function formatShortDate(iso: string | null): string {
  if (!iso) return 'Latest';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return 'Latest';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(parsed);
}

export function BlogDockItem({
  active,
  variant,
  layoutId,
  onNavigate,
}: BlogDockItemProps) {
  const prefersReducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [peekOpen, setPeekOpen] = useState(false);
  const [summary, setSummary] = useState<CachedTelegramSummary | null>(cachedSummary);
  const [hasUnread, setHasUnread] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    loadLatestTelegramSummary().then((result) => {
      if (!mounted || !result) return;
      setSummary(result);
      if (result.latestPost && typeof window !== 'undefined') {
        try {
          const seenId = window.sessionStorage.getItem(VISITED_STORAGE_KEY);
          setHasUnread(!active && seenId !== result.latestPost.id);
        } catch {
          setHasUnread(!active);
        }
      }
    });
    return () => {
      mounted = false;
    };
  }, [active]);

  useEffect(() => {
    if (active && summary?.latestPost && typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem(VISITED_STORAGE_KEY, summary.latestPost.id);
      } catch {
        // Ignore storage errors
      }
      setHasUnread(false);
    }
  }, [active, summary]);

  useEffect(() => {
    if (!peekOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPeekOpen(false);
        setHovered(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [peekOpen]);

  useEffect(() => {
    return () => clearCloseTimer();
  }, [clearCloseTimer]);

  const handleOpenPeek = () => {
    clearCloseTimer();
    setHovered(true);
    if (variant === 'desktop') {
      setPeekOpen(true);
    }
  };

  const handleScheduleClosePeek = () => {
    clearCloseTimer();
    setHovered(false);
    if (variant === 'desktop') {
      closeTimerRef.current = window.setTimeout(() => {
        setPeekOpen(false);
      }, 150);
    }
  };

  const latestPost = summary?.latestPost ?? null;
  const thumbUrl = !thumbFailed && latestPost?.images?.[0] ? latestPost.images[0] : null;
  const channelTitle = summary?.channelTitle || 'Abyssinia Tech';
  const channelUsername = summary?.username || '@abysiniyatech';
  const showLiveDot = Boolean(latestPost);

  const iconMotionProps = prefersReducedMotion
    ? {}
    : {
        animate: hovered
          ? { y: -1.5, rotate: -8, scale: 1.14 }
          : active
            ? { y: 0, rotate: 0, scale: 1.04 }
            : { y: 0, rotate: 0, scale: 1 },
        whileTap: { scale: 0.86, rotate: 6 },
        transition: { type: 'spring' as const, stiffness: 460, damping: 22 },
      };

  const handleLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    setPeekOpen(false);
    setHovered(false);
    if (latestPost && typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem(VISITED_STORAGE_KEY, latestPost.id);
      } catch {
        // Ignore storage errors
      }
      setHasUnread(false);
    }
    onNavigate?.(event);
  };

  if (variant === 'mobile') {
    return (
      <Link
        href="/blog"
        onClick={handleLinkClick}
        aria-label={latestPost ? `Blog — Latest: ${latestPost.title}` : 'Blog'}
        aria-current={active ? 'page' : undefined}
        className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 ${
          active
            ? 'text-[#111110] dark:text-[#F5F5F3]'
            : 'text-[#686864] dark:text-[#A3A6AB]'
        }`}
      >
        {active && (
          <motion.span
            layoutId={layoutId}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 420, damping: 34 }
            }
            className="absolute inset-0 rounded-full bg-white dark:bg-[#2B2E33] shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.45)] ring-1 ring-black/[0.06] dark:ring-white/[0.08]"
          />
        )}

        <motion.span
          className="relative z-10 inline-flex items-center justify-center"
          whileTap={prefersReducedMotion ? undefined : { scale: 0.84, rotate: -10 }}
          animate={
            prefersReducedMotion
              ? undefined
              : active
                ? { scale: [1, 1.12, 1.02], rotate: [0, -6, 0] }
                : { scale: 1, rotate: 0 }
          }
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <Newspaper className="h-[17px] w-[17px]" aria-hidden="true" />
        </motion.span>

        {showLiveDot && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-[7px] right-[7px] z-20 flex h-2 w-2 items-center justify-center"
          >
            {hasUnread && !prefersReducedMotion && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex h-1.5 w-1.5 rounded-full ring-[1.5px] ${
                active
                  ? 'bg-emerald-500 ring-white dark:ring-[#2B2E33]'
                  : 'bg-emerald-500 ring-[#F5F5F4] dark:ring-[#17191C]'
              }`}
            />
          </span>
        )}
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleOpenPeek}
      onMouseLeave={handleScheduleClosePeek}
    >
      <Link
        href="/blog"
        onClick={handleLinkClick}
        onFocus={handleOpenPeek}
        onBlur={(e) => {
          if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node | null)) {
            handleScheduleClosePeek();
          }
        }}
        aria-label={`Blog — ${channelTitle}`}
        aria-current={active ? 'page' : undefined}
        aria-expanded={peekOpen}
        className={`group relative flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white/60 ${
          active
            ? 'text-[#111110] dark:text-[#F5F5F3]'
            : 'text-[#686864] dark:text-[#A3A6AB] hover:text-[#111110] dark:hover:text-[#F5F5F3]'
        }`}
      >
        {/* Subtle interactive hover halo */}
        {!active && (
          <motion.span
            aria-hidden="true"
            initial={false}
            animate={{
              opacity: hovered ? 1 : 0,
              scale: hovered ? 1 : 0.82,
            }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 460, damping: 28 }
            }
            className="pointer-events-none absolute inset-0 rounded-full bg-black/[0.06] dark:bg-white/[0.09] ring-1 ring-black/[0.06] dark:ring-white/[0.09]"
          />
        )}

        {active && (
          <motion.span
            layoutId={layoutId}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 420, damping: 34 }
            }
            className="absolute inset-0 rounded-full bg-white dark:bg-[#2B2E33] shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.45)] ring-1 ring-black/[0.06] dark:ring-white/[0.08]"
          />
        )}

        <motion.span
          className="relative z-10 inline-flex items-center justify-center"
          {...iconMotionProps}
        >
          <Newspaper className="h-[17px] w-[17px]" aria-hidden="true" />
        </motion.span>

        {/* Live Telegram pulse dot */}
        {showLiveDot && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-[7px] right-[7px] z-20 flex h-2 w-2 items-center justify-center"
          >
            {hasUnread && !prefersReducedMotion && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex h-1.5 w-1.5 rounded-full ring-[1.5px] transition-transform duration-200 ${
                hovered ? 'scale-110' : 'scale-100'
              } ${
                active
                  ? 'bg-emerald-500 ring-white dark:ring-[#2B2E33]'
                  : 'bg-emerald-500 ring-[#F5F5F4] dark:ring-[#17191C]'
              }`}
            />
          </span>
        )}
      </Link>

      {/* Interactive Live Telegram Peek Popover */}
      <AnimatePresence>
        {peekOpen && (
          <motion.div
            role="region"
            aria-label="Latest Blog dispatch preview"
            onMouseEnter={handleOpenPeek}
            onMouseLeave={handleScheduleClosePeek}
            initial={
              prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 6, scale: 0.96 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.97 }
            }
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3"
          >
            <div className="w-[296px] overflow-hidden rounded-2xl border border-black/[0.09] dark:border-white/[0.12] bg-white/96 dark:bg-[#14161A]/96 p-3.5 shadow-[0_18px_48px_rgba(0,0,0,0.14)] dark:shadow-[0_22px_56px_rgba(0,0,0,0.68)] backdrop-blur-2xl">
              {/* Header: Live channel metadata */}
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-black/[0.06] dark:border-white/[0.08]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="relative flex h-2 w-2 shrink-0 items-center justify-center">
                    {!prefersReducedMotion && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-65" />
                    )}
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  <span className="truncate text-[11px] font-semibold tracking-wide text-[#1A1A1A] dark:text-[#F0F0EE]">
                    {channelTitle}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#6E6E6A] dark:text-[#8E9299] shrink-0">
                  {channelUsername}
                </span>
              </div>

              {/* Latest dispatch preview */}
              {latestPost ? (
                <Link
                  href="/blog"
                  onClick={handleLinkClick}
                  className="group/peek mt-2.5 flex items-start gap-3 rounded-xl p-1.5 -mx-1.5 transition-colors hover:bg-black/[0.035] dark:hover:bg-white/[0.05]"
                >
                  {thumbUrl && (
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-black/[0.06] dark:border-white/[0.08] bg-[#F3F3F1] dark:bg-[#1E2024]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbUrl}
                        alt={latestPost.title}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={() => setThumbFailed(true)}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover/peek:scale-105"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[12.5px] font-semibold leading-snug text-[#1A1A1A] dark:text-[#F0F0EE] group-hover/peek:underline decoration-black/25 dark:decoration-white/30 underline-offset-2">
                      {latestPost.title}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 font-mono text-[10px] text-[#6E6E6A] dark:text-[#8E9299]">
                      <span>#{latestPost.postNumber}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatShortDate(latestPost.publishedAt)}</span>
                      {latestPost.views && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-0.5">
                            <Eye className="h-2.5 w-2.5" aria-hidden="true" />
                            {latestPost.views}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </Link>
              ) : (
                <Link
                  href="/blog"
                  onClick={handleLinkClick}
                  className="mt-2.5 block rounded-xl p-1.5 -mx-1.5 transition-colors hover:bg-black/[0.035] dark:hover:bg-white/[0.05]"
                >
                  <p className="text-[12.5px] font-semibold text-[#1A1A1A] dark:text-[#F0F0EE]">
                    Live Telegram Dispatches
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#666662] dark:text-[#9A9DA3]">
                    Engineering notes & tech updates synced from {channelUsername}.
                  </p>
                </Link>
              )}

              {/* Interactive quick-action footer */}
              <div className="mt-2.5 flex items-center justify-between pt-2.5 border-t border-black/[0.06] dark:border-white/[0.08]">
                <Link
                  href="/blog"
                  onClick={handleLinkClick}
                  className="group/open inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#1A1A1A] dark:text-[#F0F0EE] hover:opacity-75 transition-opacity"
                >
                  <span>Open Blog</span>
                  <ArrowRight
                    className="h-3 w-3 transition-transform duration-200 group-hover/open:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>

                <a
                  href={latestPost?.permalink || TELEGRAM_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setPeekOpen(false)}
                  className="inline-flex items-center gap-1 font-mono text-[10.5px] text-[#5B5B57] dark:text-[#9A9DA3] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] transition-colors"
                >
                  <Send className="h-2.5 w-2.5" aria-hidden="true" />
                  <span>Telegram</span>
                  <ArrowUpRight className="h-2.5 w-2.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
