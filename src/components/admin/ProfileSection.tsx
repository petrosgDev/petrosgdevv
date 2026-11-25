'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import type { HeroMetric, SiteProfile } from '@/data/portfolio';
import {
  CARD_CLASS,
  moveArrayItem,
  ReorderControls,
  SectionHeader,
  TextAreaField,
  TextInput,
} from '@/components/admin/AdminFields';
import { ImagePickerCropper } from '@/components/admin/ImagePickerCropper';

interface ProfileSectionProps {
  profile: SiteProfile;
  onChange: (next: SiteProfile) => void;
  authHeaders?: Record<string, string>;
}

export function ProfileSection({
  profile,
  onChange,
  authHeaders = {},
}: ProfileSectionProps) {
  const update = <K extends keyof SiteProfile>(key: K, value: SiteProfile[K]) => {
    onChange({ ...profile, [key]: value });
  };

  const metrics: HeroMetric[] = [...profile.heroMetrics];

  const updateMetric = (index: number, patch: Partial<HeroMetric>) => {
    const next = metrics.map((m, i) => (i === index ? { ...m, ...patch } : m));
    update('heroMetrics', next);
  };

  const addMetric = () => {
    if (metrics.length >= 8) return;
    update('heroMetrics', [...metrics, { value: '01', label: 'New Metric' }]);
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="01. Identity & Hero"
        title="Profile & Hero Copy"
        description="Update your header wordmark, portrait, hero headline, introduction, availability message, and bottom metric bar."
      />

      {/* Core Identity & Live Portrait Picker */}
      <div className={`${CARD_CLASS} space-y-6`}>
        <ImagePickerCropper
          id="profile-portrait"
          label="Portrait Image (Upload, Pick, Crop or URL)"
          value={profile.portraitSrc}
          aspectHint="square"
          authHeaders={authHeaders}
          onChange={(v) => update('portraitSrc', v)}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextInput
            id="profile-brand"
            label="Brand Wordmark"
            hint="Max 60"
            maxLength={60}
            value={profile.brand}
            onChange={(v) => update('brand', v)}
            placeholder="PETROS G DEV"
          />
          <TextInput
            id="profile-fullname"
            label="Full Name"
            hint="Max 100"
            maxLength={100}
            value={profile.fullName}
            onChange={(v) => update('fullName', v)}
            placeholder="Petros Geto"
          />
          <TextInput
            id="profile-role"
            label="Role / Title"
            hint="Max 120"
            maxLength={120}
            value={profile.role}
            onChange={(v) => update('role', v)}
            placeholder="Software Engineer & AI Developer"
          />
          <TextInput
            id="profile-location"
            label="Location"
            hint="Max 120"
            maxLength={120}
            value={profile.location}
            onChange={(v) => update('location', v)}
            placeholder="Addis Ababa, Ethiopia"
          />
          <TextInput
            id="profile-greeting"
            label="Hero Headline"
            hint="Max 80"
            maxLength={80}
            value={profile.heroGreeting}
            onChange={(v) => update('heroGreeting', v)}
            placeholder="SOFTWARE ENGINEER"
          />
          <TextInput
            id="profile-year"
            label="Copyright Year"
            type="number"
            value={String(profile.copyrightYear)}
            onChange={(v) => {
              const parsed = Number.parseInt(v, 10);
              if (!Number.isNaN(parsed)) {
                update('copyrightYear', parsed);
              }
            }}
            placeholder="2026"
          />
        </div>
      </div>

      {/* Editorial Bio & Philosophy */}
      <div className={`${CARD_CLASS} space-y-5`}>
        <TextAreaField
          id="profile-intro"
          label="Hero & About Introduction"
          hint={`${profile.heroIntro.length}/800`}
          maxLength={800}
          rows={4}
          value={profile.heroIntro}
          onChange={(v) => update('heroIntro', v)}
        />
        <TextAreaField
          id="profile-philosophy"
          label="Short Footer Philosophy"
          hint={`${profile.shortPhilosophy.length}/400`}
          maxLength={400}
          rows={2}
          value={profile.shortPhilosophy}
          onChange={(v) => update('shortPhilosophy', v)}
        />
        <TextAreaField
          id="profile-availability"
          label="Availability & Collaboration Note"
          hint={`${profile.availabilityNote.length}/300`}
          maxLength={300}
          rows={2}
          value={profile.availabilityNote}
          onChange={(v) => update('availabilityNote', v)}
        />
      </div>

      {/* Hero Metrics Strip */}
      <div className={`${CARD_CLASS} space-y-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-[22px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
              Hero Metrics Row
            </h3>
            <p className="text-[12.5px] text-[#666666] dark:text-[#9A9A96]">
              Shown along the bottom hairline of the Home hero (1–8 items).
            </p>
          </div>
          <button
            type="button"
            onClick={addMetric}
            disabled={metrics.length >= 8}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] px-4 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-85 disabled:opacity-45 transition-opacity cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add Metric</span>
          </button>
        </div>

        <div className="space-y-3">
          {metrics.map((metric, idx) => (
            <div
              key={`metric-${idx}`}
              className="rounded-xl border border-[#EAEAEA] dark:border-[#222220] bg-white dark:bg-[#0E0E0D] p-4 flex flex-col sm:flex-row sm:items-end gap-3"
            >
              <div className="grid flex-1 grid-cols-1 sm:grid-cols-3 gap-3">
                <TextInput
                  id={`metric-value-${idx}`}
                  label="Value"
                  maxLength={32}
                  value={metric.value}
                  onChange={(v) => updateMetric(idx, { value: v })}
                  placeholder="09"
                />
                <div className="sm:col-span-2">
                  <TextInput
                    id={`metric-label-${idx}`}
                    label="Label"
                    maxLength={80}
                    value={metric.label}
                    onChange={(v) => updateMetric(idx, { label: v })}
                    placeholder="Selected Projects"
                  />
                </div>
              </div>
              <ReorderControls
                index={idx}
                total={metrics.length}
                itemLabel={`metric ${idx + 1}`}
                onMoveUp={() => update('heroMetrics', moveArrayItem(metrics, idx, idx - 1))}
                onMoveDown={() => update('heroMetrics', moveArrayItem(metrics, idx, idx + 1))}
                onDelete={() => update('heroMetrics', metrics.filter((_, i) => i !== idx))}
                disableDelete={metrics.length <= 1}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
