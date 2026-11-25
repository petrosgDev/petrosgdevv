'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { ExperienceItem } from '@/data/portfolio';
import {
  CARD_CLASS,
  moveArrayItem,
  ReorderControls,
  SectionHeader,
  StringListEditor,
  TextAreaField,
  TextInput,
} from '@/components/admin/AdminFields';

interface ExperienceSectionProps {
  items: ExperienceItem[];
  onChange: (next: ExperienceItem[]) => void;
}

export function ExperienceSection({ items, onChange }: ExperienceSectionProps) {
  const addEntry = () => {
    if (items.length >= 25) return;
    onChange([
      ...items,
      {
        id: `exp-${Date.now().toString(36)}`,
        organization: 'New Organization',
        role: 'Software Engineer',
        period: '2026 — Present',
        shortYear: '2026',
        location: 'Addis Ababa, Ethiopia',
        summary: 'Describe your role, focus, and measurable engineering outcomes.',
        points: [{ lead: 'Core Delivery', text: 'Shipped full-stack features cleanly.' }],
        stack: ['TypeScript', 'Next.js'],
      },
    ]);
  };

  const updateItem = (idx: number, patch: Partial<ExperienceItem>) => {
    onChange(items.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="04. Career & Training"
        title="Experience Timeline"
        description="Edit organizations, roles, dates, clickable organization URLs, highlight bullet points, and technology stacks."
        action={
          <button
            type="button"
            onClick={addEntry}
            disabled={items.length >= 25}
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] px-5 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-85 disabled:opacity-45 transition-opacity cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Experience ({items.length}/25)</span>
          </button>
        }
      />

      <div className="space-y-6">
        {items.map((exp, idx) => (
          <div key={`${exp.id}-${idx}`} className={`${CARD_CLASS} space-y-5`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
                  {String(idx + 1).padStart(2, '0')} · {exp.shortYear || exp.period}
                </span>
                <h3 className="font-display text-[22px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
                  {exp.role} — {exp.organization}
                </h3>
              </div>

              <ReorderControls
                index={idx}
                total={items.length}
                itemLabel={exp.organization}
                onMoveUp={() => onChange(moveArrayItem(items, idx, idx - 1))}
                onMoveDown={() => onChange(moveArrayItem(items, idx, idx + 1))}
                onDelete={() => onChange(items.filter((_, i) => i !== idx))}
                disableDelete={items.length <= 1}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <TextInput
                id={`exp-org-${idx}`}
                label="Organization"
                maxLength={140}
                value={exp.organization}
                onChange={(organization) => updateItem(idx, { organization })}
              />
              <TextInput
                id={`exp-role-${idx}`}
                label="Role / Title"
                maxLength={140}
                value={exp.role}
                onChange={(role) => updateItem(idx, { role })}
              />
              <TextInput
                id={`exp-location-${idx}`}
                label="Location"
                maxLength={120}
                value={exp.location}
                onChange={(location) => updateItem(idx, { location })}
              />
              <TextInput
                id={`exp-period-${idx}`}
                label="Period Label"
                maxLength={60}
                value={exp.period}
                onChange={(period) => updateItem(idx, { period })}
              />
              <TextInput
                id={`exp-year-${idx}`}
                label="Short Year Badge"
                maxLength={32}
                value={exp.shortYear}
                onChange={(shortYear) => updateItem(idx, { shortYear })}
              />
              <TextInput
                id={`exp-url-${idx}`}
                label="Organization URL (Optional)"
                type="url"
                maxLength={400}
                value={exp.organizationUrl ?? ''}
                onChange={(val) =>
                  updateItem(idx, {
                    organizationUrl: val.trim() ? val : undefined,
                  })
                }
                placeholder="https://..."
              />
              <TextInput
                id={`exp-url-label-${idx}`}
                label="Organization Link Label"
                maxLength={80}
                value={exp.organizationUrlLabel ?? ''}
                onChange={(val) =>
                  updateItem(idx, {
                    organizationUrlLabel: val.trim() ? val : undefined,
                  })
                }
                placeholder="Official website"
              />
            </div>

            <TextAreaField
              id={`exp-summary-${idx}`}
              label="Summary"
              rows={2}
              maxLength={600}
              value={exp.summary}
              onChange={(summary) => updateItem(idx, { summary })}
            />

            {/* Highlight Points */}
            <div className="space-y-3 pt-2 border-t border-[#EAEAEA] dark:border-[#222220]">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE]">
                  Bullet Highlights ({exp.points.length}/12)
                </span>
                <button
                  type="button"
                  disabled={exp.points.length >= 12}
                  onClick={() =>
                    updateItem(idx, {
                      points: [...exp.points, { lead: '', text: '' }],
                    })
                  }
                  className="inline-flex h-8 items-center gap-1 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-3 text-[11.5px] font-medium cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Bullet</span>
                </button>
              </div>

              {exp.points.map((pt, pIdx) => (
                <div
                  key={`pt-${idx}-${pIdx}`}
                  className="rounded-xl border border-[#EAEAEA] dark:border-[#222220] bg-white dark:bg-[#0E0E0D] p-3.5 grid grid-cols-1 sm:grid-cols-12 gap-3 items-start"
                >
                  <div className="sm:col-span-4">
                    <TextInput
                      id={`exp-pt-lead-${idx}-${pIdx}`}
                      label="Bold Lead (Optional)"
                      maxLength={100}
                      value={pt.lead ?? ''}
                      onChange={(lead) =>
                        updateItem(idx, {
                          points: exp.points.map((item, i) =>
                            i === pIdx ? { ...item, lead: lead || undefined } : item
                          ),
                        })
                      }
                      placeholder="e.g. Architecture"
                    />
                  </div>
                  <div className="sm:col-span-7">
                    <TextInput
                      id={`exp-pt-text-${idx}-${pIdx}`}
                      label="Description"
                      maxLength={450}
                      value={pt.text}
                      onChange={(text) =>
                        updateItem(idx, {
                          points: exp.points.map((item, i) =>
                            i === pIdx ? { ...item, text } : item
                          ),
                        })
                      }
                      placeholder="Delivered..."
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end pt-6">
                    <button
                      type="button"
                      onClick={() =>
                        updateItem(idx, {
                          points: exp.points.filter((_, i) => i !== pIdx),
                        })
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-500/25 text-red-700 dark:text-red-400 cursor-pointer"
                      aria-label="Remove bullet"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <StringListEditor
              id={`exp-stack-${idx}`}
              label="Technology Stack"
              hint="Max 20"
              items={exp.stack}
              onChange={(stack) => updateItem(idx, { stack })}
              placeholder="Add technology..."
            />
          </div>
        ))}
      </div>
    </div>
  );
}
