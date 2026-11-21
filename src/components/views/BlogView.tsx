'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  Eye,
  Newspaper,
  RefreshCw,
  Search,
  Send,
  X,
} from 'lucide-react';
import {
  TELEGRAM_CHANNEL_URL,
  type TelegramChannelInfo,
  type TelegramFeedPayload,
  type TelegramPost,
} from '@/lib/telegramParser';
import { Reveal } from '@/components/Reveal';

function formatDispatchDate(isoDate: string | null): string {
  if (!isoDate) return 'Recent';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return 'Recent';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
}

function formatDispatchTime(isoDate: string | null): string {
  if (!isoDate) return '';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsed);
}

export function BlogView() {
  const [channel, setChannel] = useState<TelegramChannelInfo | null>(null);
  const [posts, setPosts] = useState<TelegramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextBefore, setNextBefore] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [activePost, setActivePost] = useState<TelegramPost | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [avatarFailed, setAvatarFailed] = useState(false);

  const loadFeed = useCallback(async (opts?: { isRefresh?: boolean; before?: number | null }) => {
    const isRefresh = Boolean(opts?.isRefresh);
    const before = opts?.before ?? null;

    if (before) {
      setLoadingMore(true);
    } else if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const endpoint = before ? `/api/telegram/?before=${before}` : '/api/telegram/';
      const response = await fetch(endpoint, { cache: 'no-store' });
      const data = (await response.json()) as TelegramFeedPayload & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || `Feed request failed (${response.status})`);
      }

      setChannel(data.channel);
      setHasMore(Boolean(data.hasMore));
      setNextBefore(data.nextBefore ?? null);

      if (before) {
        setPosts((prev) => {
          const existing = new Set(prev.map((item) => item.id));
          const merged = [...prev];
          for (const item of data.posts) {
            if (!existing.has(item.id)) {
              existing.add(item.id);
              merged.push(item);
            }
          }
          return merged.sort((a, b) => b.postNumber - a.postNumber);
        });
      } else {
        setPosts(data.posts);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to fetch posts from Telegram right now.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  useEffect(() => {
    if (!activePost) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActivePost(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activePost]);

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((post) => {
      const haystack = [post.title, post.body, ...post.tags].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [posts, query]);

  const channelName = channel?.title || 'Abyssinia Tech';
  const channelHandle = channel?.username || '@abysiniyatech';
  const channelUrl = channel?.url || TELEGRAM_CHANNEL_URL;

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 md:px-10 md:py-16">
      {/* Editorial Header */}
      <header className="pb-10 border-b border-[#EAEAEA] dark:border-[#222220]">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8 space-y-2.5">
            <p className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
              Blog · Live from Telegram
            </p>
            <h1 className="font-display text-[2.4rem] sm:text-[3.1rem] font-extrabold uppercase leading-[0.98] tracking-[-0.01em] text-[#1A1A1A] dark:text-[#F0F0EE]">
              {channelName}
            </h1>
            <p className="max-w-[58ch] text-[13.5px] leading-[1.8] text-[#666666] dark:text-[#9A9A96]">
              {channel?.description ||
                'Engineering notes, tech industry dispatches, and software updates synced directly from my Telegram channel.'}
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-wrap lg:justify-end gap-2.5">
            <button
              type="button"
              onClick={() => void loadFeed({ isRefresh: true })}
              disabled={loading || refreshing}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-4 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] disabled:opacity-55 transition-colors whitespace-nowrap cursor-pointer"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span>{refreshing ? 'Syncing…' : 'Refresh Feed'}</span>
            </button>

            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] px-5 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-85 transition-opacity whitespace-nowrap"
            >
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Join {channelHandle}</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Quiet Channel Meta & Search Row */}
        <div className="mt-8 pt-6 border-t border-[#EAEAEA] dark:border-[#222220] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {channel?.avatarUrl && !avatarFailed ? (
              <img
                src={channel.avatarUrl}
                alt={`${channelName} channel avatar`}
                referrerPolicy="no-referrer"
                onError={() => setAvatarFailed(true)}
                className="h-9 w-9 rounded-full object-cover border border-black/[0.08] dark:border-white/[0.12] shrink-0"
              />
            ) : (
              <div
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-[#F5F5F4] dark:bg-[#17191C] text-[#1A1A1A] dark:text-[#F0F0EE] shrink-0"
              >
                <Newspaper className="h-4 w-4" />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-[#666666] dark:text-[#9A9A96]">
              <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:underline underline-offset-4"
              >
                {channelHandle}
              </a>
              {channel?.subscribers && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{channel.subscribers} subscribers</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {posts.length} {posts.length === 1 ? 'post' : 'posts'} loaded
              </span>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#666666] dark:text-[#9A9A96]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search dispatches…"
              aria-label="Search blog posts"
              className="h-9 w-full rounded-full border border-black/[0.1] dark:border-white/[0.12] bg-transparent pl-9 pr-4 text-[12.5px] text-[#1A1A1A] dark:text-[#F0F0EE] placeholder:text-[#666666]/70 dark:placeholder:text-[#9A9A96]/70 focus:border-[#1A1A1A] dark:focus:border-[#F0F0EE] focus:outline-none transition-colors"
            />
          </div>
        </div>
      </header>

      {/* Main Feed Area */}
      <section aria-label="Telegram blog dispatches" className="pt-12">
        {loading ? (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2" aria-busy="true">
            {[0, 1].map((idx) => (
              <div
                key={idx}
                className="animate-pulse space-y-4 border-b border-[#EAEAEA] dark:border-[#222220] pb-8"
              >
                <div className="aspect-[16/9] w-full rounded-xl bg-[#F2F2F0] dark:bg-[#171716]" />
                <div className="h-3 w-40 rounded bg-[#EAEAEA] dark:bg-[#222220]" />
                <div className="h-6 w-4/5 rounded bg-[#EAEAEA] dark:bg-[#222220]" />
                <div className="space-y-2">
                  <div className="h-3.5 w-full rounded bg-[#F2F2F0] dark:bg-[#1B1B1A]" />
                  <div className="h-3.5 w-5/6 rounded bg-[#F2F2F0] dark:bg-[#1B1B1A]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-[#FAFAFA] dark:bg-[#111110] p-8 space-y-4 max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 text-[12px] font-mono text-[#1A1A1A] dark:text-[#F0F0EE]">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <span>Feed Temporarily Unavailable</span>
            </div>
            <p className="text-[13.5px] leading-relaxed text-[#666666] dark:text-[#9A9A96]">
              {error}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => void loadFeed({ isRefresh: true })}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] px-4 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-85 transition-opacity cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Try Again</span>
              </button>
              <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-4 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors"
              >
                <span>Open on Telegram</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-16 text-center space-y-3 border-b border-[#EAEAEA] dark:border-[#222220]">
            <p className="text-[14px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE]">
              {query.trim()
                ? `No posts matching “${query.trim()}”.`
                : 'No posts published on the channel yet.'}
            </p>
            <p className="text-[13px] text-[#666666] dark:text-[#9A9A96]">
              {query.trim()
                ? 'Try another keyword or clear your search filter.'
                : `New dispatches posted to ${channelHandle} will appear here automatically.`}
            </p>
            {query.trim() && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="mt-2 inline-flex h-9 items-center rounded-full border border-black/[0.12] dark:border-white/[0.14] px-4 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors cursor-pointer"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-10 gap-y-14 lg:grid-cols-12">
            {filteredPosts.map((post, index) => {
              const isLeadPost = index === 0 && !query.trim();
              const colSpan =
                filteredPosts.length === 1 || isLeadPost ? 'lg:col-span-12' : 'lg:col-span-6';
              const heroPhoto = post.images[0] && !failedImages[post.id] ? post.images[0] : null;

              return (
                <Reveal key={post.id} delay={Math.min(index, 4) * 0.04} className={colSpan}>
                  <article
                    className={`group pb-10 border-b border-[#EAEAEA] dark:border-[#222220] ${
                      isLeadPost && heroPhoto
                        ? 'grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center'
                        : 'flex flex-col gap-5'
                    }`}
                  >
                    {heroPhoto && (
                      <div
                        className={
                          isLeadPost
                            ? 'lg:col-span-7 overflow-hidden rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-[#F5F5F4] dark:bg-[#141413]'
                            : 'overflow-hidden rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-[#F5F5F4] dark:bg-[#141413]'
                        }
                      >
                        <button
                          type="button"
                          onClick={() => setActivePost(post)}
                          aria-label={`Read full post: ${post.title}`}
                          className="block w-full overflow-hidden text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white/60"
                        >
                          <img
                            src={heroPhoto}
                            alt={post.title}
                            referrerPolicy="no-referrer"
                            onError={() =>
                              setFailedImages((prev) => ({ ...prev, [post.id]: true }))
                            }
                            className="aspect-[16/9] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                          />
                        </button>
                      </div>
                    )}

                    <div
                      className={
                        isLeadPost && heroPhoto
                          ? 'lg:col-span-5 flex flex-col justify-center space-y-4'
                          : 'flex flex-col space-y-3.5'
                      }
                    >
                      {/* Unboxed editorial metadata */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] font-mono text-[#666666] dark:text-[#9A9A96] tabular-nums">
                        <span>#{post.postNumber}</span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={post.publishedAt ?? undefined}>
                          {formatDispatchDate(post.publishedAt)}
                        </time>
                        {post.views && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="inline-flex items-center gap-1">
                              <Eye className="h-3 w-3 opacity-70" aria-hidden="true" />
                              {post.views}
                            </span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span>{post.readTimeMinutes} min read</span>
                      </div>

                      <h2
                        className={`font-display font-bold uppercase tracking-tight leading-[1.08] text-[#1A1A1A] dark:text-[#F0F0EE] [text-wrap:balance] ${
                          isLeadPost ? 'text-[26px] sm:text-[32px]' : 'text-[22px] sm:text-[26px]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setActivePost(post)}
                          className="text-left hover:opacity-70 transition-opacity cursor-pointer"
                        >
                          {post.title}
                        </button>
                      </h2>

                      {post.paragraphs.length > 0 && (
                        <p className="text-[13.5px] leading-[1.8] text-[#4A4A48] dark:text-[#B5B5B0] max-w-[60ch]">
                          {isLeadPost ? post.paragraphs[0] : post.excerpt}
                        </p>
                      )}

                      {post.tags.length > 0 && (
                        <p className="text-[11.5px] font-mono text-[#666666] dark:text-[#9A9A96]">
                          {post.tags.map((tag) => `#${tag}`).join(' · ')}
                        </p>
                      )}

                      <div className="pt-1 flex flex-wrap items-center gap-4 text-[12px]">
                        <button
                          type="button"
                          onClick={() => setActivePost(post)}
                          className="font-medium text-[#1A1A1A] dark:text-[#F0F0EE] underline underline-offset-4 hover:opacity-65 transition-opacity cursor-pointer"
                        >
                          Read Dispatch
                        </button>
                        <a
                          href={post.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#666666] dark:text-[#9A9A96] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] transition-colors"
                        >
                          <span>View on Telegram</span>
                          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {hasMore && nextBefore && !loading && !error && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => void loadFeed({ before: nextBefore })}
              disabled={loadingMore}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-6 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] disabled:opacity-55 transition-colors cursor-pointer"
            >
              <span>{loadingMore ? 'Loading older posts…' : 'Load Older Posts'}</span>
            </button>
          </div>
        )}
      </section>

      {/* Full Dispatch Reader Modal */}
      {activePost && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="dispatch-modal-title"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 sm:p-6"
          onClick={() => setActivePost(null)}
        >
          <div
            className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#111110] p-6 sm:p-8 shadow-2xl space-y-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] font-mono text-[#666666] dark:text-[#9A9A96] tabular-nums">
                <span>{channelHandle}</span>
                <span aria-hidden="true">·</span>
                <span>Post #{activePost.postNumber}</span>
                <span aria-hidden="true">·</span>
                <span>{formatDispatchDate(activePost.publishedAt)}</span>
                {formatDispatchTime(activePost.publishedAt) && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{formatDispatchTime(activePost.publishedAt)}</span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setActivePost(null)}
                aria-label="Close post reader"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.1] dark:border-white/[0.12] text-[#1A1A1A] dark:text-[#F0F0EE] hover:bg-[#F5F5F4] dark:hover:bg-[#1E1E1C] transition-colors shrink-0 cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <h2
              id="dispatch-modal-title"
              className="font-display text-[26px] sm:text-[32px] font-bold uppercase leading-[1.06] tracking-tight text-[#1A1A1A] dark:text-[#F0F0EE]"
            >
              {activePost.title}
            </h2>

            {activePost.images.length > 0 && !failedImages[activePost.id] && (
              <div className="space-y-3">
                {activePost.images.map((src, idx) => (
                  <img
                    key={src}
                    src={src}
                    alt={`${activePost.title} — media ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setFailedImages((prev) => ({ ...prev, [activePost.id]: true }))
                    }
                    className="w-full rounded-xl border border-black/[0.06] dark:border-white/[0.08] object-cover"
                  />
                ))}
              </div>
            )}

            <div className="space-y-4 text-[14px] leading-[1.85] text-[#2A2A2A] dark:text-[#D4D4D0]">
              {activePost.paragraphs.length > 0 ? (
                activePost.paragraphs.map((paragraph, idx) => <p key={idx}>{paragraph}</p>)
              ) : (
                <p>{activePost.body}</p>
              )}
            </div>

            {activePost.links.length > 0 && (
              <div className="pt-4 border-t border-[#EAEAEA] dark:border-[#222220] space-y-2">
                <p className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
                  Referenced Links
                </p>
                <ul className="space-y-1.5">
                  {activePost.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] underline underline-offset-4 hover:opacity-70 transition-opacity break-all"
                      >
                        <span>{link.label}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4 border-t border-[#EAEAEA] dark:border-[#222220] flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11.5px] font-mono text-[#666666] dark:text-[#9A9A96] tabular-nums">
                {activePost.views ? `${activePost.views} views on Telegram` : 'Synced from Telegram'}
              </span>
              <a
                href={activePost.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] px-4 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-85 transition-opacity whitespace-nowrap"
              >
                <span>Open Original Post</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
