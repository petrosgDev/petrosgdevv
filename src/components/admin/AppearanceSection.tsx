'use client';

import React, { useState } from 'react';
import { Check, Moon, RotateCcw, Sun } from 'lucide-react';
import {
  DEFAULT_DARK_TOKENS,
  DEFAULT_LIGHT_TOKENS,
  DEFAULT_THEME_TOKENS,
  sanitizeHexColor,
  THEME_PRESETS,
  type ThemePaletteTokens,
  type ThemeTokensConfig,
} from '@/lib/themeSystem';
import { CARD_CLASS, SectionHeader } from '@/components/admin/AdminFields';

interface AppearanceSectionProps {
  tokens: ThemeTokensConfig;
  onChange: (next: ThemeTokensConfig) => void;
}

interface TokenFieldSpec {
  key: keyof ThemePaletteTokens;
  label: string;
  hint: string;
}

const TOKEN_GROUPS: Array<{
  title: string;
  description: string;
  fields: TokenFieldSpec[];
}> = [
  {
    title: 'Canvas, Surfaces & Borders',
    description: 'Page canvas, alternating editorial bands, matte cards, and 1px hairlines.',
    fields: [
      { key: 'pageBg', label: 'Page Background', hint: 'Main body & canvas' },
      { key: 'sectionBg', label: 'Section Surface', hint: 'About, Skills & Blog bands' },
      { key: 'cardBg', label: 'Card & Frame Matte', hint: 'Image frames & pills' },
      { key: 'borderColor', label: 'Hairline Borders', hint: 'Section & card dividers' },
    ],
  },
  {
    title: 'Headers, Navigation Bars & Social Rail',
    description: 'Top brand wordmark, floating navigation dock, active icon pill, and right rail.',
    fields: [
      { key: 'headerWordmark', label: 'Header Wordmark', hint: 'Top-left brand title' },
      { key: 'headerFadeBg', label: 'Top Header Fade', hint: 'Sticky scroll gradient' },
      { key: 'navBarBg', label: 'Nav Dock & Drawer', hint: 'Floating pill & mobile dock' },
      { key: 'navBarBorder', label: 'Nav Dock Border', hint: 'Floating capsule hairline' },
      { key: 'navActivePillBg', label: 'Active Nav Pill', hint: 'Selected icon circle' },
      { key: 'navActiveText', label: 'Active Nav Icon', hint: 'Selected route icon' },
      { key: 'navInactiveText', label: 'Inactive Nav & Icons', hint: 'Default nav & top icons' },
      { key: 'socialRailBg', label: 'Social Rail Dock', hint: 'Floating right capsule' },
      { key: 'socialRailText', label: 'Social Rail Icons', hint: 'GitHub / LinkedIn icons' },
    ],
  },
  {
    title: 'Typography & Inline Links',
    description: 'Display headings, body copy, muted monospace metadata, and underlined links.',
    fields: [
      { key: 'headingText', label: 'Display Headings', hint: 'H1, H2, H3 titles' },
      { key: 'bodyText', label: 'Body Copy', hint: 'Paragraphs & emphasis' },
      { key: 'mutedText', label: 'Muted & Mono Meta', hint: 'Eyebrows, dates, labels' },
      { key: 'linkText', label: 'Inline Links', hint: 'Underlined text links' },
    ],
  },
  {
    title: 'Buttons & Focus Accents',
    description: 'Primary filled CTA pills, secondary outline borders, and focus/selection tint.',
    fields: [
      { key: 'primaryBtnBg', label: 'Primary Button Fill', hint: 'Explore Work / Contact' },
      { key: 'primaryBtnText', label: 'Primary Button Text', hint: 'Label inside solid pills' },
      { key: 'secondaryBtnBorder', label: 'Outline Button Border', hint: 'Secondary pill stroke' },
      { key: 'accentColor', label: 'Focus & Selection Accent', hint: 'Keyboard ring & highlight' },
    ],
  },
  {
    title: 'Closing CTA & Footer Bar',
    description: 'Bottom collaboration showcase band and global footer region.',
    fields: [
      { key: 'ctaBg', label: 'Closing CTA Background', hint: 'Collaboration band' },
      { key: 'ctaHeading', label: 'Closing CTA Headline', hint: 'Large CTA title' },
      { key: 'ctaText', label: 'Closing CTA Copy', hint: 'Availability description' },
      { key: 'footerBg', label: 'Footer Background', hint: 'Bottom footer canvas' },
      { key: 'footerHeading', label: 'Footer Links & Headers', hint: 'Nav & Connect columns' },
      { key: 'footerText', label: 'Footer Meta Text', hint: 'Copyright & philosophy' },
      { key: 'footerBorder', label: 'Footer Hairlines', hint: 'Footer divider strokes' },
    ],
  },
];

export function AppearanceSection({ tokens, onChange }: AppearanceSectionProps) {
  const [editingMode, setEditingMode] = useState<'light' | 'dark'>('light');

  const activePalette = tokens[editingMode];
  const defaultPalette = editingMode === 'light' ? DEFAULT_LIGHT_TOKENS : DEFAULT_DARK_TOKENS;

  const updateToken = (key: keyof ThemePaletteTokens, nextHex: string) => {
    onChange({
      ...tokens,
      [editingMode]: {
        ...activePalette,
        [key]: nextHex,
      },
    });
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="08. UI Colors & Theme"
        title="Appearance & Color System"
        description="Control every color across headers, navigation bars, floating docks, headings, body text, buttons, CTA bands, and the footer for both Light and Dark themes."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...tokens,
                  [editingMode]: { ...defaultPalette },
                })
              }
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-3.5 text-[12px] font-medium hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset {editingMode === 'light' ? 'Light' : 'Dark'}</span>
            </button>
            <button
              type="button"
              onClick={() =>
                onChange({
                  light: { ...DEFAULT_THEME_TOKENS.light },
                  dark: { ...DEFAULT_THEME_TOKENS.dark },
                })
              }
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-red-500/30 px-3.5 text-[12px] font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset All</span>
            </button>
          </div>
        }
      />

      {/* Curated Presets */}
      <div className={`${CARD_CLASS} space-y-4`}>
        <div>
          <h3 className="font-display text-[20px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
            Theme Presets
          </h3>
          <p className="text-[12.5px] text-[#666666] dark:text-[#9A9A96]">
            Apply a complete Light &amp; Dark editorial palette in one click, or customize individual tokens below.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {THEME_PRESETS.map((preset) => {
            const isSelected =
              JSON.stringify(tokens) === JSON.stringify(preset.tokens);
            const swatches = [
              preset.tokens.light.pageBg,
              preset.tokens.light.navBarBg,
              preset.tokens.light.headingText,
              preset.tokens.light.linkText,
              preset.tokens.dark.pageBg,
              preset.tokens.dark.primaryBtnBg,
            ];
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() =>
                  onChange(JSON.parse(JSON.stringify(preset.tokens)) as ThemeTokensConfig)
                }
                className={`rounded-xl border p-4 text-left transition-all cursor-pointer space-y-2.5 ${
                  isSelected
                    ? 'border-[#1A1A1A] dark:border-[#F0F0EE] bg-white dark:bg-[#0E0E0D] ring-1 ring-[#1A1A1A] dark:ring-[#F0F0EE]'
                    : 'border-[#EAEAEA] dark:border-[#222220] bg-white dark:bg-[#0E0E0D] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold text-[#1A1A1A] dark:text-[#F0F0EE]">
                    {preset.name}
                  </span>
                  {isSelected ? <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> : null}
                </div>
                <p className="text-[11.5px] text-[#666666] dark:text-[#9A9A96]">
                  {preset.description}
                </p>
                <div className="flex items-center gap-1.5 pt-1">
                  {swatches.map((hex, sIdx) => (
                    <span
                      key={`${preset.id}-${sIdx}`}
                      style={{ backgroundColor: hex }}
                      className="h-4 w-6 rounded border border-black/15 dark:border-white/20"
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-2 border-b border-[#EAEAEA] dark:border-[#222220] pb-4">
        <button
          type="button"
          onClick={() => setEditingMode('light')}
          className={`inline-flex h-10 items-center gap-2 rounded-full px-5 text-[12.5px] font-medium transition-colors cursor-pointer ${
            editingMode === 'light'
              ? 'bg-[#1A1A1A] dark:bg-[#F0F0EE] text-white dark:text-[#0A0A0A]'
              : 'border border-black/[0.12] dark:border-white/[0.14] text-[#666666] dark:text-[#9A9A96]'
          }`}
        >
          <Sun className="h-4 w-4" />
          <span>Light Theme Palette</span>
        </button>
        <button
          type="button"
          onClick={() => setEditingMode('dark')}
          className={`inline-flex h-10 items-center gap-2 rounded-full px-5 text-[12.5px] font-medium transition-colors cursor-pointer ${
            editingMode === 'dark'
              ? 'bg-[#1A1A1A] dark:bg-[#F0F0EE] text-white dark:text-[#0A0A0A]'
              : 'border border-black/[0.12] dark:border-white/[0.14] text-[#666666] dark:text-[#9A9A96]'
          }`}
        >
          <Moon className="h-4 w-4" />
          <span>Dark Theme Palette</span>
        </button>
      </div>

      {/* Granular Token Groups */}
      <div className="space-y-6">
        {TOKEN_GROUPS.map((group) => (
          <div key={group.title} className={`${CARD_CLASS} space-y-4`}>
            <div>
              <h3 className="font-display text-[20px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
                {group.title}
              </h3>
              <p className="text-[12.5px] text-[#666666] dark:text-[#9A9A96]">
                {group.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.fields.map((field) => {
                const currentHex = activePalette[field.key];
                const isModified = currentHex !== defaultPalette[field.key];
                return (
                  <div
                    key={`${editingMode}-${field.key}`}
                    className="rounded-xl border border-[#EAEAEA] dark:border-[#222220] bg-white dark:bg-[#0E0E0D] p-3.5 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <label
                          htmlFor={`color-${editingMode}-${field.key}`}
                          className="block text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE]"
                        >
                          {field.label}
                        </label>
                        <span className="text-[10.5px] text-[#666666] dark:text-[#9A9A96]">
                          {field.hint}
                        </span>
                      </div>
                      {isModified ? (
                        <button
                          type="button"
                          onClick={() => updateToken(field.key, defaultPalette[field.key])}
                          title="Reset this token to default"
                          className="text-[10px] font-mono underline text-[#666666] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] cursor-pointer"
                        >
                          Reset
                        </button>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        id={`color-${editingMode}-${field.key}`}
                        type="color"
                        value={sanitizeHexColor(currentHex, defaultPalette[field.key])}
                        onChange={(e) =>
                          updateToken(field.key, e.target.value.toUpperCase())
                        }
                        className="h-9 w-11 shrink-0 cursor-pointer rounded-lg border border-black/[0.12] dark:border-white/[0.15] bg-transparent p-0.5"
                      />
                      <input
                        type="text"
                        aria-label={`${field.label} hex code`}
                        value={currentHex}
                        maxLength={7}
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (/^#[0-9A-Fa-f]{0,6}$/.test(raw)) {
                            updateToken(field.key, raw.toUpperCase());
                          }
                        }}
                        onBlur={() =>
                          updateToken(
                            field.key,
                            sanitizeHexColor(currentHex, defaultPalette[field.key])
                          )
                        }
                        className="h-9 w-full rounded-lg border border-black/[0.1] dark:border-white/[0.12] bg-[#FAFAFA] dark:bg-[#141413] px-2.5 font-mono text-[12px] text-[#1A1A1A] dark:text-[#F0F0EE]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
