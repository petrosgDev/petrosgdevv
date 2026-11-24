'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import type { PhilosophyPillar, TechnicalInterest } from '@/data/portfolio';
import {
  CARD_CLASS,
  moveArrayItem,
  ReorderControls,
  SectionHeader,
  TextAreaField,
  TextInput,
} from '@/components/admin/AdminFields';

interface AboutSectionProps {
  pillars: PhilosophyPillar[];
  interests: TechnicalInterest[];
  onChangePillars: (next: PhilosophyPillar[]) => void;
  onChangeInterests: (next: TechnicalInterest[]) => void;
}

export function AboutSection({
  pillars,
  interests,
  onChangePillars,
  onChangeInterests,
}: AboutSectionProps) {
  const reindexPillars = (list: PhilosophyPillar[]) =>
    list.map((p, idx) => ({ ...p, index: String(idx + 1).padStart(2, '0') }));

  return (
    <div className="space-y-10">
      <SectionHeader
        eyebrow="05. Narrative & Focus"
        title="About Page Content"
        description="Edit your Development Philosophy pillars and Technical Interests displayed on /about."
      />

      {/* Philosophy Pillars */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-[24px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
              Development Philosophy Pillars
            </h3>
            <p className="text-[12.5px] text-[#666666] dark:text-[#9A9A96]">
              Principles showing how you approach software architecture and craft.
            </p>
          </div>
          <button
            type="button"
            disabled={pillars.length >= 12}
            onClick={() =>
              onChangePillars(
                reindexPillars([
                  ...pillars,
                  {
                    index: String(pillars.length + 1).padStart(2, '0'),
                    title: 'New Engineering Principle',
                    description: 'Describe how this principle guides your engineering work.',
                  },
                ])
              )
            }
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] px-4 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-85 disabled:opacity-45 transition-opacity cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add Pillar</span>
          </button>
        </div>

        <div className="space-y-4">
          {pillars.map((pillar, idx) => (
            <div key={`pillar-${idx}`} className={`${CARD_CLASS} space-y-4`}>
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] text-[#666666] dark:text-[#9A9A96]">
                  Pillar {pillar.index}
                </span>
                <ReorderControls
                  index={idx}
                  total={pillars.length}
                  itemLabel={pillar.title || `pillar ${idx + 1}`}
                  onMoveUp={() =>
                    onChangePillars(reindexPillars(moveArrayItem(pillars, idx, idx - 1)))
                  }
                  onMoveDown={() =>
                    onChangePillars(reindexPillars(moveArrayItem(pillars, idx, idx + 1)))
                  }
                  onDelete={() =>
                    onChangePillars(reindexPillars(pillars.filter((_, i) => i !== idx)))
                  }
                />
              </div>

              <TextInput
                id={`pillar-title-${idx}`}
                label="Title"
                maxLength={120}
                value={pillar.title}
                onChange={(v) =>
                  onChangePillars(
                    pillars.map((p, i) => (i === idx ? { ...p, title: v } : p))
                  )
                }
              />
              <TextAreaField
                id={`pillar-desc-${idx}`}
                label="Description"
                rows={3}
                maxLength={500}
                value={pillar.description}
                onChange={(v) =>
                  onChangePillars(
                    pillars.map((p, i) => (i === idx ? { ...p, description: v } : p))
                  )
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* Technical Interests */}
      <div className="space-y-4 pt-6 border-t border-[#EAEAEA] dark:border-[#222220]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-[24px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
              Technical Interests
            </h3>
            <p className="text-[12.5px] text-[#666666] dark:text-[#9A9A96]">
              Areas of active engineering focus and exploration.
            </p>
          </div>
          <button
            type="button"
            disabled={interests.length >= 16}
            onClick={() =>
              onChangeInterests([
                ...interests,
                {
                  title: 'New Focus Area',
                  description: 'Explain what excites you about this domain.',
                },
              ])
            }
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] px-4 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-85 disabled:opacity-45 transition-opacity cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add Interest</span>
          </button>
        </div>

        <div className="space-y-4">
          {interests.map((interest, idx) => (
            <div key={`interest-${idx}`} className={`${CARD_CLASS} space-y-4`}>
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] text-[#666666] dark:text-[#9A9A96]">
                  Focus 0{idx + 1}
                </span>
                <ReorderControls
                  index={idx}
                  total={interests.length}
                  itemLabel={interest.title || `interest ${idx + 1}`}
                  onMoveUp={() => onChangeInterests(moveArrayItem(interests, idx, idx - 1))}
                  onMoveDown={() => onChangeInterests(moveArrayItem(interests, idx, idx + 1))}
                  onDelete={() =>
                    onChangeInterests(interests.filter((_, i) => i !== idx))
                  }
                />
              </div>

              <TextInput
                id={`interest-title-${idx}`}
                label="Title"
                maxLength={120}
                value={interest.title}
                onChange={(v) =>
                  onChangeInterests(
                    interests.map((item, i) => (i === idx ? { ...item, title: v } : item))
                  )
                }
              />
              <TextAreaField
                id={`interest-desc-${idx}`}
                label="Description"
                rows={3}
                maxLength={500}
                value={interest.description}
                onChange={(v) =>
                  onChangeInterests(
                    interests.map((item, i) =>
                      i === idx ? { ...item, description: v } : item
                    )
                  )
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
