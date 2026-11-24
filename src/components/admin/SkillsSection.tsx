'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import type { SkillCategory } from '@/data/portfolio';
import {
  CARD_CLASS,
  moveArrayItem,
  ReorderControls,
  SectionHeader,
  StringListEditor,
  TextAreaField,
  TextInput,
} from '@/components/admin/AdminFields';

interface SkillsSectionProps {
  categories: SkillCategory[];
  onChange: (next: SkillCategory[]) => void;
}

export function SkillsSection({ categories, onChange }: SkillsSectionProps) {
  const reindex = (list: SkillCategory[]): SkillCategory[] =>
    list.map((cat, idx) => ({
      ...cat,
      index: String(idx + 1).padStart(2, '0'),
    }));

  const addCategory = () => {
    if (categories.length >= 20) return;
    const nextIdx = categories.length + 1;
    onChange(
      reindex([
        ...categories,
        {
          id: `category-${Date.now()}`,
          index: String(nextIdx).padStart(2, '0'),
          name: 'New Capability Area',
          description: 'Describe how you use these technologies in production.',
          items: ['TypeScript'],
        },
      ])
    );
  };

  const updateCategory = (index: number, patch: Partial<SkillCategory>) => {
    onChange(categories.map((cat, i) => (i === index ? { ...cat, ...patch } : cat)));
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="03. Capabilities"
        title="Skills & Technology Stack"
        description="Organize your verified technologies into categories displayed on both the Home and About pages."
        action={
          <button
            type="button"
            onClick={addCategory}
            disabled={categories.length >= 20}
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] px-5 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-85 disabled:opacity-45 transition-opacity cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add Category</span>
          </button>
        }
      />

      <div className="space-y-5">
        {categories.map((cat, idx) => (
          <div key={cat.id || idx} className={`${CARD_CLASS} space-y-4`}>
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#EAEAEA] dark:border-[#222220]">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-mono text-[11px] text-[#666666] dark:text-[#9A9A96]">
                  {cat.index}
                </span>
                <h3 className="font-display text-[20px] font-bold uppercase truncate text-[#1A1A1A] dark:text-[#F0F0EE]">
                  {cat.name || 'Untitled Category'}
                </h3>
              </div>
              <ReorderControls
                index={idx}
                total={categories.length}
                itemLabel={cat.name || `category ${idx + 1}`}
                onMoveUp={() => onChange(reindex(moveArrayItem(categories, idx, idx - 1)))}
                onMoveDown={() => onChange(reindex(moveArrayItem(categories, idx, idx + 1)))}
                onDelete={() => onChange(reindex(categories.filter((_, i) => i !== idx)))}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput
                id={`skill-name-${idx}`}
                label="Category Name"
                maxLength={80}
                value={cat.name}
                onChange={(v) => updateCategory(idx, { name: v })}
              />
              <TextInput
                id={`skill-index-${idx}`}
                label="Index Label"
                maxLength={12}
                value={cat.index}
                onChange={(v) => updateCategory(idx, { index: v })}
              />
            </div>

            <TextAreaField
              id={`skill-desc-${idx}`}
              label="Category Description"
              rows={2}
              maxLength={300}
              value={cat.description}
              onChange={(v) => updateCategory(idx, { description: v })}
            />

            <StringListEditor
              id={`skill-items-${idx}`}
              label="Technologies / Tools"
              items={cat.items}
              onChange={(items) => updateCategory(idx, { items })}
              placeholder="e.g. Next.js, PostgreSQL, Docker"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
