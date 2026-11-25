'use client';

import React, { useState } from 'react';
import { ExternalLink, Plus, RefreshCw, Send } from 'lucide-react';
import type { BlogSettings, SiteProfile, SocialLink } from '@/data/portfolio';
import { DEFAULT_BLOG_SETTINGS } from '@/data/portfolio';
import type { TelegramFeedPayload } from '@/lib/telegramParser';
import {
  CARD_CLASS,
  moveArrayItem,
  ReorderControls,
  SectionHeader,
  TextAreaField,
  TextInput,
} from '@/components/admin/AdminFields';

interface ContactBlogSectionProps {
  profile: SiteProfile;
  socialLinks: SocialLink[];
  blogSettings?: BlogSettings;
  onChangeProfile: (next: SiteProfile) => void;
  onChangeSocialLinks: (next: SocialLink[]) => void;
  onChangeBlogSettings: (next: BlogSettings) => void;
}

export function ContactBlogSection({
  profile,
  socialLinks,
  blogSettings,
  onChangeProfile,
  onChangeSocialLinks,
  onChangeBlogSettings,
}: ContactBlogSectionProps) {
  const blog = blogSettings ?? DEFAULT_BLOG_SETTINGS;
  const [testingFeed, setTestingFeed] = useState(false);
  const [feedPreview, setFeedPreview] = useState<TelegramFeedPayload | null>(null);
  const [feedError, setFeedError] = useState<string | null>(null);

  const testTelegramFeed = async () => {
    setTestingFeed(true);
    setFeedError(null);
    try {
      const res = await fetch('/api/telegram/', { cache: 'no-store' });
      const json = (await res.json()) as TelegramFeedPayload & { error?: string };
      if (!res.ok) {
        setFeedError(json.error || 'Failed to sync Telegram channel.');
        return;
      }
      setFeedPreview(json);
    } catch {
      setFeedError('Unable to reach /api/telegram/ right now.');
    } finally {
      setTestingFeed(false);
    }
  };

  const addSocialLink = () => {
    if (socialLinks.length >= 16) return;
    onChangeSocialLinks([
      ...socialLinks,
      {
        id: `social-${Date.now().toString(36)}`,
        label: 'New Channel',
        handle: '@handle',
        href: 'https://example.com',
        external: true,
      },
    ]);
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="06. Contact & Blog"
        title="Direct Channels, Social Links & Telegram Blog"
        description="Update email, phone, social handles, footer/contact channels, and the live Telegram blog source."
      />

      {/* Primary Contact & Profile Socials */}
      <div className={`${CARD_CLASS} space-y-5`}>
        <div>
          <h3 className="font-display text-[22px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
            Direct Contact &amp; Primary Handles
          </h3>
          <p className="text-[12.5px] text-[#666666] dark:text-[#9A9A96]">
            Used in the Hero section, Navbar buttons, Floating Social Rail, and Contact Form.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            id="cb-email"
            label="Direct Email Address"
            type="email"
            maxLength={160}
            value={profile.email}
            onChange={(email) => onChangeProfile({ ...profile, email })}
          />
          <TextInput
            id="cb-phone"
            label="Phone Display"
            maxLength={40}
            value={profile.phoneDisplay}
            onChange={(phoneDisplay) => onChangeProfile({ ...profile, phoneDisplay })}
          />
          <TextInput
            id="cb-gh-handle"
            label="GitHub Handle"
            maxLength={80}
            value={profile.githubHandle}
            onChange={(githubHandle) => onChangeProfile({ ...profile, githubHandle })}
          />
          <TextInput
            id="cb-gh-url"
            label="GitHub URL"
            type="url"
            value={profile.githubUrl}
            onChange={(githubUrl) => onChangeProfile({ ...profile, githubUrl })}
          />
          <TextInput
            id="cb-li-handle"
            label="LinkedIn Handle"
            maxLength={80}
            value={profile.linkedinHandle}
            onChange={(linkedinHandle) => onChangeProfile({ ...profile, linkedinHandle })}
          />
          <TextInput
            id="cb-li-url"
            label="LinkedIn URL"
            type="url"
            value={profile.linkedinUrl}
            onChange={(linkedinUrl) => onChangeProfile({ ...profile, linkedinUrl })}
          />
          <TextInput
            id="cb-tg-handle"
            label="Telegram Handle"
            maxLength={80}
            value={profile.telegramHandle}
            onChange={(telegramHandle) => onChangeProfile({ ...profile, telegramHandle })}
          />
          <TextInput
            id="cb-tg-url"
            label="Telegram Direct URL"
            type="url"
            value={profile.telegramUrl}
            onChange={(telegramUrl) => onChangeProfile({ ...profile, telegramUrl })}
          />
          <div className="sm:col-span-2">
            <TextInput
              id="cb-wa-url"
              label="WhatsApp URL"
              type="url"
              value={profile.whatsappUrl}
              onChange={(whatsappUrl) => onChangeProfile({ ...profile, whatsappUrl })}
            />
          </div>
        </div>
      </div>

      {/* Blog Settings & Live Sync Preview */}
      <div className={`${CARD_CLASS} space-y-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-[22px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
              Live Telegram Blog Configuration
            </h3>
            <p className="text-[12.5px] text-[#666666] dark:text-[#9A9A96]">
              Controls the public Telegram channel synced to /blog and the subtitle shown on the Blog header.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`https://t.me/${blog.telegramChannel.replace(/^@+/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-3.5 text-[12px] font-medium hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE]"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Open Channel</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
            <button
              type="button"
              onClick={() => void testTelegramFeed()}
              disabled={testingFeed}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] px-4 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-85 disabled:opacity-45 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${testingFeed ? 'animate-spin' : ''}`} />
              <span>{testingFeed ? 'Testing…' : 'Fetch Published Feed'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <TextInput
            id="blog-channel"
            label="Telegram Channel Username"
            hint="5–32 letters/numbers/underscores (publish changes first to test new channel)"
            value={blog.telegramChannel}
            onChange={(telegramChannel) =>
              onChangeBlogSettings({ ...blog, telegramChannel })
            }
            placeholder="abysiniyatech"
          />
          <TextAreaField
            id="blog-subtitle"
            label="Blog Editorial Subtitle"
            hint={`${blog.subtitle.length}/300`}
            maxLength={300}
            rows={2}
            value={blog.subtitle}
            onChange={(subtitle) => onChangeBlogSettings({ ...blog, subtitle })}
          />
        </div>

        {feedError ? (
          <p className="text-[12px] font-mono text-red-600 dark:text-red-400">{feedError}</p>
        ) : null}

        {feedPreview ? (
          <div className="rounded-xl border border-[#EAEAEA] dark:border-[#222220] bg-white dark:bg-[#0E0E0D] p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                {feedPreview.channel.avatarUrl ? (
                  <img
                    src={feedPreview.channel.avatarUrl}
                    alt={feedPreview.channel.title}
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : null}
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold truncate">
                    {feedPreview.channel.title} ({feedPreview.channel.username})
                  </p>
                  <p className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
                    {feedPreview.channel.subscribers || 'Live'} · {feedPreview.posts.length} posts fetched
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2 border-t border-[#EAEAEA] dark:border-[#222220] pt-2.5">
              {feedPreview.posts.slice(0, 3).map((post) => (
                <div
                  key={post.id}
                  className="flex items-baseline justify-between gap-3 text-[12px]"
                >
                  <span className="truncate font-medium">
                    #{post.postNumber} · {post.title}
                  </span>
                  <span className="shrink-0 font-mono text-[10.5px] text-[#666666] dark:text-[#9A9A96]">
                    {post.views ? `${post.views} views` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Social Links List */}
      <div className={`${CARD_CLASS} space-y-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-[22px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
              Footer &amp; Contact Channel Directory ({socialLinks.length}/16)
            </h3>
            <p className="text-[12.5px] text-[#666666] dark:text-[#9A9A96]">
              Links listed in the Footer Connect grid and Contact directory.
            </p>
          </div>
          <button
            type="button"
            onClick={addSocialLink}
            disabled={socialLinks.length >= 16}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] px-4 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-85 disabled:opacity-45 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Channel</span>
          </button>
        </div>

        <div className="space-y-3">
          {socialLinks.map((link, idx) => (
            <div
              key={`${link.id}-${idx}`}
              className="rounded-xl border border-[#EAEAEA] dark:border-[#222220] bg-white dark:bg-[#0E0E0D] p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
                  Channel #{idx + 1} ({link.id})
                </span>
                <ReorderControls
                  index={idx}
                  total={socialLinks.length}
                  itemLabel={link.label}
                  onMoveUp={() =>
                    onChangeSocialLinks(moveArrayItem(socialLinks, idx, idx - 1))
                  }
                  onMoveDown={() =>
                    onChangeSocialLinks(moveArrayItem(socialLinks, idx, idx + 1))
                  }
                  onDelete={() =>
                    onChangeSocialLinks(socialLinks.filter((_, i) => i !== idx))
                  }
                  disableDelete={socialLinks.length <= 1}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-3">
                  <TextInput
                    id={`soc-label-${idx}`}
                    label="Label"
                    maxLength={60}
                    value={link.label}
                    onChange={(label) =>
                      onChangeSocialLinks(
                        socialLinks.map((s, i) => (i === idx ? { ...s, label } : s))
                      )
                    }
                  />
                </div>
                <div className="sm:col-span-3">
                  <TextInput
                    id={`soc-handle-${idx}`}
                    label="Handle / Display"
                    maxLength={120}
                    value={link.handle}
                    onChange={(handle) =>
                      onChangeSocialLinks(
                        socialLinks.map((s, i) => (i === idx ? { ...s, handle } : s))
                      )
                    }
                  />
                </div>
                <div className="sm:col-span-4">
                  <TextInput
                    id={`soc-href-${idx}`}
                    label="Target URL"
                    value={link.href}
                    onChange={(href) =>
                      onChangeSocialLinks(
                        socialLinks.map((s, i) => (i === idx ? { ...s, href } : s))
                      )
                    }
                  />
                </div>
                <div className="sm:col-span-2 pb-2">
                  <label className="inline-flex items-center gap-2 text-[12px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={link.external}
                      onChange={(e) =>
                        onChangeSocialLinks(
                          socialLinks.map((s, i) =>
                            i === idx ? { ...s, external: e.target.checked } : s
                          )
                        )
                      }
                      className="h-4 w-4 rounded accent-[#1A1A1A] dark:accent-[#F0F0EE]"
                    />
                    <span>External</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
