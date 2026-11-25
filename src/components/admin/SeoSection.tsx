'use client';

import React from 'react';
import type { SeoSettings } from '@/data/portfolio';
import { DEFAULT_SEO_SETTINGS } from '@/data/portfolio';
import {
  CARD_CLASS,
  SectionHeader,
  StringListEditor,
  TextAreaField,
  TextInput,
} from '@/components/admin/AdminFields';
import { ImagePickerCropper } from '@/components/admin/ImagePickerCropper';

interface SeoSectionProps {
  seo?: SeoSettings;
  onChange: (next: SeoSettings) => void;
  authHeaders?: Record<string, string>;
}

export function SeoSection({ seo, onChange, authHeaders = {} }: SeoSectionProps) {
  const value = seo ?? DEFAULT_SEO_SETTINGS;

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="10. Search & Discovery"
        title="SEO, OpenGraph & Metadata"
        description="Manage search engine title formatting, meta description snippet, social card preview image, and keyword tags."
      />

      {/* Google Search Snippet Preview */}
      <div className={`${CARD_CLASS} space-y-3`}>
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#666666] dark:text-[#9A9A96]">
          Search Result Snippet Preview
        </p>
        <div className="rounded-xl border border-[#EAEAEA] dark:border-[#222220] bg-white dark:bg-[#0E0E0D] p-5 space-y-1.5 max-w-2xl">
          <p className="text-[11.5px] font-mono text-[#666666] dark:text-[#9A9A96]">
            https://petrosgeto.vercel.app/
          </p>
          <p className="text-[18px] font-medium text-[#1A0DAB] dark:text-[#8AB4F8] leading-snug">
            {value.defaultTitle || DEFAULT_SEO_SETTINGS.defaultTitle}
          </p>
          <p className="text-[13px] text-[#4D5156] dark:text-[#BDC1C6] leading-relaxed">
            {value.defaultDescription || DEFAULT_SEO_SETTINGS.defaultDescription}
          </p>
        </div>
      </div>

      {/* Metadata Fields */}
      <div className={`${CARD_CLASS} space-y-5`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            id="seo-title"
            label="Default Page Title"
            hint={`${value.defaultTitle.length}/60 recommended`}
            maxLength={120}
            value={value.defaultTitle}
            onChange={(defaultTitle) => onChange({ ...value, defaultTitle })}
          />
          <TextInput
            id="seo-template"
            label="Title Template"
            hint="Use %s for route name"
            maxLength={80}
            value={value.titleTemplate}
            onChange={(titleTemplate) => onChange({ ...value, titleTemplate })}
          />
          <TextInput
            id="seo-twitter"
            label="Twitter / X Handle"
            maxLength={50}
            value={value.twitterCreator}
            onChange={(twitterCreator) => onChange({ ...value, twitterCreator })}
          />
        </div>

        <TextAreaField
          id="seo-description"
          label="Meta Description"
          hint={`${value.defaultDescription.length}/160 recommended`}
          maxLength={320}
          rows={3}
          value={value.defaultDescription}
          onChange={(defaultDescription) => onChange({ ...value, defaultDescription })}
        />

        <ImagePickerCropper
          id="seo-og-image"
          label="OpenGraph / Social Share Image"
          value={value.ogImage}
          aspectHint="wide"
          authHeaders={authHeaders}
          onChange={(ogImage) => onChange({ ...value, ogImage })}
        />

        <StringListEditor
          id="seo-keywords"
          label="SEO Keywords"
          hint="Max 30"
          items={value.keywords}
          onChange={(keywords) => onChange({ ...value, keywords })}
          placeholder="Add search keyword..."
        />
      </div>
    </div>
  );
}
