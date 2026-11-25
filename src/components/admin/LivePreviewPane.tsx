'use client';

import React, { useState } from 'react';
import { ArrowRight, ArrowUpRight, Github, Home, Mail, Moon, Newspaper, Sun } from 'lucide-react';
import type { PortfolioBundle } from '@/data/portfolio';
import { DEFAULT_THEME_TOKENS } from '@/lib/themeSystem';

interface LivePreviewPaneProps {
  draft: PortfolioBundle;
}

export function LivePreviewPane({ draft }: LivePreviewPaneProps) {
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');
  const [previewView, setPreviewView] = useState<'hero' | 'project' | 'footer'>('hero');

  const theme = (draft.THEME_TOKENS ?? DEFAULT_THEME_TOKENS)[previewMode];
  const profile = draft.SITE_PROFILE;
  const featured = draft.PROJECTS.find((p) => p.featured) ?? draft.PROJECTS[0];

  return (
    <aside className="rounded-2xl border border-[#EAEAEA] dark:border-[#222220] bg-[#FAFAFA] dark:bg-[#0E0E0D] overflow-hidden flex flex-col sticky top-20">
      {/* Preview Controls */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[#EAEAEA] dark:border-[#222220] bg-white dark:bg-[#111110]">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#666666] dark:text-[#9A9A96]">
            Live Preview
          </p>
          <p className="text-[12px] font-semibold text-[#1A1A1A] dark:text-[#F0F0EE]">
            {previewMode === 'light' ? 'Light Surface' : 'Dark Surface'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {(['hero', 'project', 'footer'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setPreviewView(tab)}
              className={`rounded-full px-2.5 py-1 text-[10.5px] font-mono capitalize transition-colors cursor-pointer ${
                previewView === tab
                  ? 'bg-[#1A1A1A] dark:bg-[#F0F0EE] text-white dark:text-[#0A0A0A]'
                  : 'border border-black/[0.1] dark:border-white/[0.12] text-[#666666] dark:text-[#9A9A96]'
              }`}
            >
              {tab}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPreviewMode((m) => (m === 'light' ? 'dark' : 'light'))}
            aria-label="Toggle preview color mode"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-black/[0.1] dark:border-white/[0.12] text-[#1A1A1A] dark:text-[#F0F0EE] cursor-pointer ml-1"
          >
            {previewMode === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Simulated Portfolio Canvas */}
      <div
        style={{ backgroundColor: theme.pageBg, color: theme.bodyText }}
        className="p-4 space-y-4 transition-colors"
      >
        {/* Simulated Header & Floating Pill Dock */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b" style={{ borderColor: theme.borderColor }}>
          <span
            style={{ color: theme.headerWordmark }}
            className="font-sans text-[10px] font-semibold tracking-[0.16em] truncate"
          >
            {profile.brand}
          </span>

          <div
            style={{
              backgroundColor: theme.navBarBg,
              borderColor: theme.navBarBorder,
            }}
            className="flex items-center gap-1 rounded-full border p-1"
          >
            <span
              style={{
                backgroundColor: theme.navActivePillBg,
                color: theme.navActiveText,
              }}
              className="flex h-6 w-6 items-center justify-center rounded-full shadow-xs"
            >
              <Home className="h-3 w-3" />
            </span>
            <span
              style={{ color: theme.navInactiveText }}
              className="flex h-6 w-6 items-center justify-center rounded-full"
            >
              <Newspaper className="h-3 w-3" />
            </span>
            <span
              style={{ color: theme.navInactiveText }}
              className="flex h-6 w-6 items-center justify-center rounded-full"
            >
              <Mail className="h-3 w-3" />
            </span>
          </div>

          <span
            style={{
              backgroundColor: theme.navBarBg,
              borderColor: theme.navBarBorder,
              color: theme.navInactiveText,
            }}
            className="flex h-6 w-6 items-center justify-center rounded-full border"
          >
            <Github className="h-3 w-3" />
          </span>
        </div>

        {/* Hero Preview */}
        {previewView === 'hero' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <div
                style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
                className="h-20 w-20 shrink-0 rounded-xl border overflow-hidden flex items-center justify-center p-1"
              >
                {profile.portraitSrc ? (
                  <img
                    src={profile.portraitSrc}
                    alt={profile.fullName}
                    className="h-full w-full object-contain"
                  />
                ) : null}
              </div>
              <div className="min-w-0 space-y-1">
                <p style={{ color: theme.mutedText }} className="font-mono text-[9.5px] uppercase tracking-[0.18em]">
                  {profile.fullName}
                </p>
                <h4
                  style={{ color: theme.headingText }}
                  className="font-display text-[22px] font-extrabold uppercase leading-[0.98]"
                >
                  {profile.heroGreeting}
                </h4>
                <p style={{ color: theme.mutedText }} className="text-[11px] truncate">
                  {profile.location} ·{' '}
                  <span style={{ color: theme.linkText }} className="underline">
                    {profile.githubHandle}
                  </span>
                </p>
              </div>
            </div>

            <p style={{ color: theme.bodyText }} className="text-[11.5px] leading-relaxed line-clamp-3">
              {profile.heroIntro}
            </p>

            <div className="flex flex-wrap gap-2">
              <span
                style={{
                  backgroundColor: theme.primaryBtnBg,
                  color: theme.primaryBtnText,
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[11px] font-medium"
              >
                <span>Explore My Work</span>
                <ArrowRight className="h-3 w-3" />
              </span>
              <span
                style={{
                  borderColor: theme.secondaryBtnBorder,
                  color: theme.headingText,
                }}
                className="inline-flex h-8 items-center gap-1 rounded-full border px-3.5 text-[11px] font-medium"
              >
                <span>Get in Touch</span>
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>

            <div
              style={{ borderColor: theme.borderColor, backgroundColor: theme.sectionBg }}
              className="grid grid-cols-2 gap-2 rounded-xl border p-3"
            >
              {profile.heroMetrics.slice(0, 4).map((m) => (
                <div key={m.label}>
                  <p style={{ color: theme.headingText }} className="font-display text-[17px] font-bold">
                    {m.value}
                  </p>
                  <p style={{ color: theme.mutedText }} className="text-[10px] truncate">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Featured Project Preview */}
        {previewView === 'project' && featured ? (
          <div className="space-y-3">
            <div
              style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
              className="aspect-[16/10] rounded-xl border overflow-hidden p-3 flex items-center justify-center"
            >
              <img
                src={featured.heroImage.src}
                alt={featured.heroImage.alt}
                className="max-h-full max-w-full object-contain rounded"
              />
            </div>
            <div className="space-y-1">
              <p style={{ color: theme.mutedText }} className="font-mono text-[10px]">
                {featured.category} · {featured.year} · {featured.status}
              </p>
              <h4
                style={{ color: theme.headingText }}
                className="font-display text-[20px] font-bold uppercase"
              >
                {featured.title}
              </h4>
              <p style={{ color: theme.mutedText }} className="text-[11.5px] line-clamp-2">
                {featured.summary}
              </p>
              <p style={{ color: theme.linkText }} className="text-[11px] underline pt-1">
                Case Study →
              </p>
            </div>
          </div>
        ) : null}

        {/* Closing CTA & Footer Preview */}
        {previewView === 'footer' ? (
          <div className="space-y-3">
            <div
              style={{ backgroundColor: theme.ctaBg }}
              className="rounded-xl p-4 space-y-2"
            >
              <p style={{ color: theme.ctaText }} className="font-mono text-[10px]">
                06. Collaboration
              </p>
              <h4
                style={{ color: theme.ctaHeading }}
                className="font-display text-[20px] font-bold uppercase leading-tight"
              >
                Have a product or problem worth building?
              </h4>
              <p style={{ color: theme.ctaText }} className="text-[11px] line-clamp-2">
                {profile.availabilityNote}
              </p>
            </div>

            <div
              style={{
                backgroundColor: theme.footerBg,
                borderColor: theme.footerBorder,
              }}
              className="rounded-xl border p-4 space-y-2"
            >
              <p style={{ color: theme.footerHeading }} className="text-[11px] font-semibold tracking-[0.14em]">
                {profile.brand}
              </p>
              <p style={{ color: theme.footerText }} className="text-[11px]">
                {profile.shortPhilosophy}
              </p>
              <div
                style={{ borderColor: theme.footerBorder, color: theme.footerText }}
                className="pt-2 border-t text-[10px] flex justify-between"
              >
                <span>© {profile.copyrightYear} {profile.fullName}</span>
                <span>@{draft.BLOG_SETTINGS?.telegramChannel || 'abysiniyatech'}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
