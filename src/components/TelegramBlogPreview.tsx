'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Eye } from 'lucide-react';
import {
  TELEGRAM_CHANNEL_URL,
  type TelegramFeedPayload,
  type TelegramPost,
} from '@/lib/telegramParser';
import { Reveal } from '@/components/Reveal';

function formatShortDate(iso: string | null): string {
  if (!iso) return 'Latest';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return 'Latest';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
}

export function TelegramBlogPreview() {
  const [channelTitle, setChannelTitle] = useState('Abyssinia Tech');
  const [posts, setPosts] = useState<TelegramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let active = true;
    fetch('/api/telegram/')
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as TelegramFeedPayload;
      })
      .then((data) => {
        if (!active || !data) return;
        if (data.channel?.title) {
          setChannelTitle(data.channel.title);
        }
        setPosts(data.posts.slice(0, 3));
      })
      .catch(() => {
        // Silent fallback — Blog link remains available
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="border-t border-[#EAEAEA] dark:border-[#222220] bg-[#FAFAFA] dark:bg-[#111110]">
      <div className="mx-auto max-w-[1200px] px-6 py-16 md:px-10 md:py-24">
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-10 border-b border-[#EAEAEA] dark:border-[#222220]">
            <div className="space-y-1.5">
              <p className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
                05. Blog · {channelTitle}
              </p>
              <h2 className="font-display text-[28px] sm:text-[34px] font-bold uppercase tracking-tight text-[#1A1A1A] dark:text-[#F0F0EE]">
                Latest from Telegram
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-5">
              <a
                href={TELEGRAM_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[12px] text-[#666666] dark:text-[#9A9A96] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] transition-colors whitespace-nowrap"
              >
                <span>@abysiniyatech</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] underline underline-offset-4 hover:opacity-65 transition-opacity whitespace-nowrap"
              >
                <span>Open Blog</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Reveal>

        {loading ? (
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 animate-pulse">
            <div className="h-44 rounded-xl bg-[#EFEFED] dark:bg-[#1A1A18]" />
            <div className="space-y-3 py-2">
              <div className="h-3 w-32 rounded bg-[#E6E6E4] dark:bg-[#222220]" />
              <div className="h-6 w-3/4 rounded bg-[#E6E6E4] dark:bg-[#222220]" />
              <div className="h-3.5 w-full rounded bg-[#EFEFED] dark:bg-[#1C1C1A]" />
              <div className="h-3.5 w-5/6 rounded bg-[#EFEFED] dark:bg-[#1C1C1A]" />
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-[13.5px] text-[#666666] dark:text-[#9A9A96]">
              Follow live engineering and tech dispatches directly from @abysiniyatech on Telegram.
            </p>
            <Link
              href="/blog"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-4 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors whitespace-nowrap"
            >
              <span>Visit Blog</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-10">
            {posts.map((post) => {
              const photo = post.images[0] && !failedImages[post.id] ? post.images[0] : null;
              return (
                <article
                  key={post.id}
                  className="grid grid-cols-1 gap-7 lg:grid-cols-12 lg:items-center pb-8 last:pb-0 border-b last:border-b-0 border-[#EAEAEA] dark:border-[#222220]"
                >
                  {photo && (
                    <Link
                      href="/blog"
                      className="lg:col-span-5 overflow-hidden rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-[#F2F2F0] dark:bg-[#161615] block"
                    >
                      <img
                        src={photo}
                        alt={post.title}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedImages((prev) => ({ ...prev, [post.id]: true }))
                        }
                        className="aspect-[16/9] w-full object-cover hover:scale-[1.02] transition-transform duration-500"
                      />
                    </Link>
                  )}

                  <div className={photo ? 'lg:col-span-7 space-y-3' : 'lg:col-span-12 space-y-3'}>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] font-mono text-[#666666] dark:text-[#9A9A96] tabular-nums">
                      <span>#{post.postNumber}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatShortDate(post.publishedAt)}</span>
                      {post.views && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1">
                            <Eye className="h-3 w-3 opacity-70" aria-hidden="true" />
                            {post.views}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="font-display text-[24px] sm:text-[28px] font-bold uppercase tracking-tight leading-[1.08] text-[#1A1A1A] dark:text-[#F0F0EE]">
                      <Link href="/blog" className="hover:opacity-70 transition-opacity">
                        {post.title}
                      </Link>
                    </h3>

                    {post.excerpt && (
                      <p className="text-[13.5px] leading-[1.8] text-[#666666] dark:text-[#9A9A96] max-w-[64ch]">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="pt-1 flex flex-wrap items-center gap-5 text-[12px]">
                      <Link
                        href="/blog"
                        className="inline-flex items-center gap-1.5 font-medium text-[#1A1A1A] dark:text-[#F0F0EE] underline underline-offset-4 hover:opacity-65 transition-opacity"
                      >
                        <span>Read in Blog</span>
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                      <a
                        href={post.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#666666] dark:text-[#9A9A96] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] transition-colors"
                      >
                        <span>Telegram Post</span>
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
