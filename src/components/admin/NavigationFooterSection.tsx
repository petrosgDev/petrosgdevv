'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import type { NavigationLink, ProjectCategory, SiteProfile } from '@/data/portfolio';
import {
  CARD_CLASS,
  moveArrayItem,
  ReorderControls,
  SectionHeader,
  TextAreaField,
  TextInput,
} from '@/components/admin/AdminFields';

interface NavigationFooterSectionProps {
  navigationLinks: NavigationLink[];
  projectCategories: readonly ('All' | ProjectCategory)[];
  profile: SiteProfile;
  onChangeNavigation: (next: NavigationLink[]) => void;
  onChangeProfile: (next: SiteProfile) => void;
}

export function NavigationFooterSection({
  navigationLinks,
  projectCategories,
  profile,
  onChangeNavigation,
  onChangeProfile,
}: NavigationFooterSectionProps) {
  const addNavLink = () => {
    if (navigationLinks.length >= 10) return;
    onChangeNavigation([...navigationLinks, { label: 'New Link', path: '/' }]);
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="07. Navigation & Footer"
        title="Navigation Links & Footer Copy"
        description="Edit footer navigation routes, copyright year, and closing footer statement."
      />

      {/* Navigation Links */}
      <div className={`${CARD_CLASS} space-y-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-[22px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
              Footer Navigation Links ({navigationLinks.length}/10)
            </h3>
            <p className="text-[12.5px] text-[#666666] dark:text-[#9A9A96]">
              Links displayed under the Navigation column in the site Footer.
            </p>
          </div>
          <button
            type="button"
            onClick={addNavLink}
            disabled={navigationLinks.length >= 10}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] px-4 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-85 disabled:opacity-45 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Route</span>
          </button>
        </div>

        <div className="space-y-3">
          {navigationLinks.map((nav, idx) => (
            <div
              key={`nav-${idx}`}
              className="rounded-xl border border-[#EAEAEA] dark:border-[#222220] bg-white dark:bg-[#0E0E0D] p-4 flex flex-col sm:flex-row sm:items-end gap-3"
            >
              <div className="grid flex-1 grid-cols-1 sm:grid-cols-2 gap-3">
                <TextInput
                  id={`nav-label-${idx}`}
                  label="Link Label"
                  maxLength={40}
                  value={nav.label}
                  onChange={(label) =>
                    onChangeNavigation(
                      navigationLinks.map((item, i) =>
                        i === idx ? { ...item, label } : item
                      )
                    )
                  }
                />
                <TextInput
                  id={`nav-path-${idx}`}
                  label="Path or URL"
                  value={nav.path}
                  onChange={(path) =>
                    onChangeNavigation(
                      navigationLinks.map((item, i) =>
                        i === idx ? { ...item, path } : item
                      )
                    )
                  }
                  placeholder="/work"
                />
              </div>
              <ReorderControls
                index={idx}
                total={navigationLinks.length}
                itemLabel={nav.label}
                onMoveUp={() =>
                  onChangeNavigation(moveArrayItem(navigationLinks, idx, idx - 1))
                }
                onMoveDown={() =>
                  onChangeNavigation(moveArrayItem(navigationLinks, idx, idx + 1))
                }
                onDelete={() =>
                  onChangeNavigation(navigationLinks.filter((_, i) => i !== idx))
                }
                disableDelete={navigationLinks.length <= 1}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer Metadata & Categories */}
      <div className={`${CARD_CLASS} space-y-5`}>
        <h3 className="font-display text-[22px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
          Footer Statement &amp; Copyright
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <TextAreaField
              id="nav-footer-phil"
              label="Footer Short Philosophy"
              hint={`${profile.shortPhilosophy.length}/400`}
              maxLength={400}
              rows={2}
              value={profile.shortPhilosophy}
              onChange={(shortPhilosophy) =>
                onChangeProfile({ ...profile, shortPhilosophy })
              }
            />
          </div>
          <TextInput
            id="nav-copy-year"
            label="Copyright Year"
            type="number"
            value={String(profile.copyrightYear)}
            onChange={(val) => {
              const parsed = Number.parseInt(val, 10);
              if (!Number.isNaN(parsed)) {
                onChangeProfile({ ...profile, copyrightYear: parsed });
              }
            }}
          />
        </div>

        <div className="pt-3 border-t border-[#EAEAEA] dark:border-[#222220] space-y-2">
          <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-[#666666] dark:text-[#9A9A96]">
            Active Work Gallery Filter Tabs
          </p>
          <div className="flex flex-wrap gap-2">
            {projectCategories.map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-black/[0.1] dark:border-white/[0.12] px-3 py-1 text-[11.5px] font-mono text-[#1A1A1A] dark:text-[#F0F0EE]"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
