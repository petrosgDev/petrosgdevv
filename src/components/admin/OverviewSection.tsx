'use client';

import React, { useRef, useState } from 'react';
import {
  ArrowRight,
  Download,
  RotateCcw,
  Upload,
} from 'lucide-react';
import type { PortfolioBundle } from '@/data/portfolio';
import type { AdminSectionKey } from '@/lib/portfolioSchema';
import { CARD_CLASS, SectionHeader } from '@/components/admin/AdminFields';

interface OverviewSectionProps {
  draft: PortfolioBundle;
  updatedAt: string | null;
  isCustomized: boolean;
  dirtySections: AdminSectionKey[];
  resetting: boolean;
  onNavigate: (tab: AdminSectionKey) => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onResetDefaults: () => Promise<void>;
}

export function OverviewSection({
  draft,
  updatedAt,
  isCustomized,
  dirtySections,
  resetting,
  onNavigate,
  onExportJson,
  onImportJson,
  onResetDefaults,
}: OverviewSectionProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const totalSkills = draft.SKILL_CATEGORIES.reduce(
    (sum, cat) => sum + cat.items.length,
    0
  );
  const featuredCount = draft.PROJECTS.filter((p) => p.featured).length;

  const formattedUpdated = updatedAt
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(updatedAt))
    : 'Default seed';

  const sectionCards: Array<{
    key: AdminSectionKey;
    index: string;
    title: string;
    summary: string;
    count: string;
  }> = [
    {
      key: 'profile',
      index: '01',
      title: 'Profile & Hero',
      summary: 'Wordmark, name, role, portrait, hero copy, and metric strip.',
      count: `${draft.SITE_PROFILE.heroMetrics.length} metrics`,
    },
    {
      key: 'projects',
      index: '02',
      title: 'Projects & Case Studies',
      summary: 'Add, reorder, feature, or edit every project case study and URL.',
      count: `${draft.PROJECTS.length} projects (${featuredCount} featured)`,
    },
    {
      key: 'skills',
      index: '03',
      title: 'Skills & Stack',
      summary: 'Manage capability categories, descriptions, and verified tools.',
      count: `${draft.SKILL_CATEGORIES.length} groups · ${totalSkills} skills`,
    },
    {
      key: 'experience',
      index: '04',
      title: 'Experience & Education',
      summary: 'Timeline entries, certifications, bullet highlights, and stack tags.',
      count: `${draft.EXPERIENCES.length} entries`,
    },
    {
      key: 'about',
      index: '05',
      title: 'About & Philosophy',
      summary: 'Engineering philosophy pillars and technical interest areas.',
      count: `${draft.PHILOSOPHY_PILLARS.length} pillars · ${draft.TECHNICAL_INTERESTS.length} focus areas`,
    },
    {
      key: 'contact',
      index: '06',
      title: 'Contact, Socials & Blog',
      summary: 'Direct email, phone, social channels, and Telegram blog source.',
      count: `${draft.SOCIAL_LINKS.length} channels · @${draft.BLOG_SETTINGS?.telegramChannel || 'abysiniyatech'}`,
    },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="00. Studio Overview"
        title="Portfolio Control Center"
        description="Every section of your live portfolio is editable below. Save changes to publish immediately to Firestore across all pages."
      />

      {/* Live Metrics Strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className={CARD_CLASS}>
          <p className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
            Projects
          </p>
          <p className="mt-2 font-display text-[32px] font-extrabold leading-none text-[#1A1A1A] dark:text-[#F0F0EE] tabular-nums">
            {String(draft.PROJECTS.length).padStart(2, '0')}
          </p>
          <p className="mt-1 text-[11.5px] text-[#666666] dark:text-[#9A9A96]">
            {featuredCount} featured on Home
          </p>
        </div>

        <div className={CARD_CLASS}>
          <p className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
            Verified Skills
          </p>
          <p className="mt-2 font-display text-[32px] font-extrabold leading-none text-[#1A1A1A] dark:text-[#F0F0EE] tabular-nums">
            {String(totalSkills).padStart(2, '0')}
          </p>
          <p className="mt-1 text-[11.5px] text-[#666666] dark:text-[#9A9A96]">
            Across {draft.SKILL_CATEGORIES.length} categories
          </p>
        </div>

        <div className={CARD_CLASS}>
          <p className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
            Experience
          </p>
          <p className="mt-2 font-display text-[32px] font-extrabold leading-none text-[#1A1A1A] dark:text-[#F0F0EE] tabular-nums">
            {String(draft.EXPERIENCES.length).padStart(2, '0')}
          </p>
          <p className="mt-1 text-[11.5px] text-[#666666] dark:text-[#9A9A96]">
            Roles &amp; education items
          </p>
        </div>

        <div className={CARD_CLASS}>
          <p className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
            Publish State
          </p>
          <p className="mt-2 font-display text-[24px] font-extrabold uppercase leading-tight text-[#1A1A1A] dark:text-[#F0F0EE]">
            {isCustomized ? 'Cloud Synced' : 'Default Seed'}
          </p>
          <p className="mt-1 text-[11.5px] text-[#666666] dark:text-[#9A9A96] truncate">
            {formattedUpdated}
          </p>
        </div>
      </div>

      {/* Quick-Jump Section Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sectionCards.map((card) => {
          const isDirty = dirtySections.includes(card.key);
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => onNavigate(card.key)}
              className="group text-left rounded-2xl border border-[#EAEAEA] dark:border-[#222220] bg-white dark:bg-[#111110] p-5 hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors cursor-pointer flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-[#666666] dark:text-[#9A9A96]">
                    {card.index}
                  </span>
                  {isDirty ? (
                    <span className="font-mono text-[10.5px] text-[#1A1A1A] dark:text-[#F0F0EE]">
                      • Unsaved
                    </span>
                  ) : null}
                </div>
                <h3 className="font-display text-[22px] font-bold uppercase tracking-tight text-[#1A1A1A] dark:text-[#F0F0EE]">
                  {card.title}
                </h3>
                <p className="text-[12.5px] leading-relaxed text-[#666666] dark:text-[#9A9A96]">
                  {card.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-[#EAEAEA] dark:border-[#222220] flex items-center justify-between gap-2 text-[11.5px] font-mono text-[#666666] dark:text-[#9A9A96]">
                <span className="truncate">{card.count}</span>
                <ArrowRight
                  className="h-3.5 w-3.5 shrink-0 text-[#1A1A1A] dark:text-[#F0F0EE] transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Backup, Restore & Reset */}
      <div className={`${CARD_CLASS} space-y-5`}>
        <div className="space-y-1">
          <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#666666] dark:text-[#9A9A96]">
            Backup &amp; Recovery
          </p>
          <h3 className="font-display text-[22px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
            JSON Snapshot &amp; Reset
          </h3>
          <p className="text-[12.5px] leading-relaxed text-[#666666] dark:text-[#9A9A96] max-w-[64ch]">
            Download a JSON backup of your portfolio before major edits, import a previously saved
            snapshot into your draft, or restore the original built-in portfolio defaults.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onExportJson}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-4 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Export JSON Backup</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onImportJson(file);
              }
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-4 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Import JSON</span>
          </button>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              disabled={resetting}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-red-500/30 px-4 text-[12px] font-medium text-red-700 dark:text-red-400 hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reset to Defaults</span>
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 rounded-full border border-red-500/35 bg-red-50/70 dark:bg-red-950/25 px-3 py-1.5">
              <span className="text-[11.5px] font-medium text-red-800 dark:text-red-300 px-1">
                Restore built-in defaults?
              </span>
              <button
                type="button"
                disabled={resetting}
                onClick={async () => {
                  await onResetDefaults();
                  setConfirmReset(false);
                }}
                className="inline-flex h-7 items-center rounded-full bg-red-700 px-3 text-[11px] font-medium text-white hover:bg-red-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                {resetting ? 'Resetting…' : 'Confirm Reset'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="inline-flex h-7 items-center rounded-full px-2.5 text-[11px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:underline cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
