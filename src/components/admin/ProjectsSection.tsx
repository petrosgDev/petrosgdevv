'use client';

import React, { useState } from 'react';
import { Copy, ExternalLink, Plus, Star, Trash2 } from 'lucide-react';
import type { ProjectCategory, ProjectImage, ProjectItem } from '@/data/portfolio';
import { ALLOWED_PROJECT_CATEGORIES, sanitizeSlug } from '@/lib/portfolioSchema';
import {
  CARD_CLASS,
  Field,
  INPUT_CLASS,
  moveArrayItem,
  ReorderControls,
  SectionHeader,
  StringListEditor,
  TextAreaField,
  TextInput,
} from '@/components/admin/AdminFields';
import { ImagePickerCropper } from '@/components/admin/ImagePickerCropper';

interface ProjectsSectionProps {
  projects: ProjectItem[];
  onChange: (next: ProjectItem[]) => void;
  authHeaders?: Record<string, string>;
}

export function ProjectsSection({
  projects,
  onChange,
  authHeaders = {},
}: ProjectsSectionProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [search, setSearch] = useState('');

  const safeIdx = Math.min(selectedIndex, Math.max(0, projects.length - 1));
  const active = projects[safeIdx];

  const updateProject = (idx: number, patch: Partial<ProjectItem>) => {
    onChange(projects.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  };

  const addProject = () => {
    if (projects.length >= 40) return;
    const num = projects.length + 1;
    const newSlug = `new-project-${Date.now().toString(36)}`;
    const newItem: ProjectItem = {
      id: newSlug,
      slug: newSlug,
      title: `New Project ${num}`,
      subtitle: 'Short subtitle describing the product',
      category: 'Web Applications',
      originalTag: 'Web Application',
      year: String(new Date().getFullYear()),
      status: 'Live Deployment',
      featured: false,
      featuredSpan: 'standard',
      role: 'Full-Stack Developer',
      summary: 'Concise summary shown on project cards.',
      overview: 'Detailed overview of the architecture and goals.',
      problemStatement: 'Describe the core challenge this system solves.',
      objectives: ['Deliver fast, reliable core workflow'],
      contribution: 'End-to-end architecture, implementation, and deployment.',
      technologies: ['Next.js', 'TypeScript'],
      keyFeatures: ['Responsive UI'],
      architecture: ['App Router SSR & client hydration'],
      challengesAndSolutions: [
        {
          challenge: 'Maintaining consistent state across views',
          solution: 'Structured shared client context and schema validation',
        },
      ],
      heroImage: {
        src: '/images/project-aman-pay.png',
        alt: 'New Project preview',
        caption: 'Primary project preview',
        aspect: 'wide',
      },
      gallery: [
        {
          src: '/images/project-aman-pay.png',
          alt: 'New Project gallery preview',
          caption: 'Main view',
          aspect: 'wide',
        },
      ],
    };
    onChange([...projects, newItem]);
    setSelectedIndex(projects.length);
  };

  const duplicateProject = (idx: number) => {
    if (projects.length >= 40) return;
    const src = projects[idx];
    const copySlug = `${src.slug}-copy-${Date.now().toString(36).slice(-4)}`;
    const clone: ProjectItem = {
      ...JSON.parse(JSON.stringify(src)),
      id: copySlug,
      slug: copySlug,
      title: `${src.title} (Copy)`,
      featured: false,
    };
    const next = [...projects];
    next.splice(idx + 1, 0, clone);
    onChange(next);
    setSelectedIndex(idx + 1);
  };

  const filteredList = projects
    .map((p, idx) => ({ p, idx }))
    .filter(({ p }) => {
      const q = search.trim().toLowerCase();
      return (
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="02. Selected Works"
        title="Projects & Case Studies"
        description="Edit every project title, slug, category, text block, live/GitHub links, hero preview image, and case-study gallery."
        action={
          <button
            type="button"
            onClick={addProject}
            disabled={projects.length >= 40}
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] px-5 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-85 disabled:opacity-45 transition-opacity cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Project ({projects.length}/40)</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Project Selector List */}
        <div className={`${CARD_CLASS} xl:col-span-4 space-y-3`}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter projects..."
            className={INPUT_CLASS}
          />

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredList.map(({ p, idx }) => {
              const selected = idx === safeIdx;
              return (
                <button
                  key={`${p.id}-${idx}`}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className={`w-full rounded-xl border p-3 text-left transition-all cursor-pointer ${
                    selected
                      ? 'border-[#1A1A1A] dark:border-[#F0F0EE] bg-[#1A1A1A] dark:bg-[#F0F0EE] text-white dark:text-[#0A0A0A]'
                      : 'border-[#EAEAEA] dark:border-[#222220] bg-white dark:bg-[#0E0E0D] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase ${
                        selected
                          ? 'text-white/75 dark:text-[#0A0A0A]/75'
                          : 'text-[#666666] dark:text-[#9A9A96]'
                      }`}
                    >
                      {String(idx + 1).padStart(2, '0')} · {p.category}
                    </span>
                    {p.featured ? (
                      <Star
                        className={`h-3 w-3 fill-current ${
                          selected ? 'text-amber-300 dark:text-amber-600' : 'text-amber-500'
                        }`}
                      />
                    ) : null}
                  </div>
                  <p className="mt-1 font-display text-[17px] font-bold uppercase tracking-tight truncate">
                    {p.title || 'Untitled Project'}
                  </p>
                  <p
                    className={`text-[11px] font-mono truncate ${
                      selected
                        ? 'text-white/70 dark:text-[#0A0A0A]/70'
                        : 'text-[#666666] dark:text-[#9A9A96]'
                    }`}
                  >
                    /work/{p.slug}/
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Project Full Editor */}
        {active ? (
          <div className="xl:col-span-8 space-y-6">
            {/* Project Action Header */}
            <div className={`${CARD_CLASS} flex flex-wrap items-center justify-between gap-3`}>
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#666666] dark:text-[#9A9A96]">
                  Editing Project {String(safeIdx + 1).padStart(2, '0')}
                </p>
                <h3 className="font-display text-[24px] font-extrabold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
                  {active.title}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => duplicateProject(safeIdx)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-3 text-[11.5px] font-medium hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] cursor-pointer"
                >
                  <Copy className="h-3 w-3" />
                  <span>Duplicate</span>
                </button>

                <ReorderControls
                  index={safeIdx}
                  total={projects.length}
                  itemLabel={active.title}
                  onMoveUp={() => {
                    onChange(moveArrayItem(projects, safeIdx, safeIdx - 1));
                    setSelectedIndex(Math.max(0, safeIdx - 1));
                  }}
                  onMoveDown={() => {
                    onChange(moveArrayItem(projects, safeIdx, safeIdx + 1));
                    setSelectedIndex(Math.min(projects.length - 1, safeIdx + 1));
                  }}
                  onDelete={() => {
                    onChange(projects.filter((_, i) => i !== safeIdx));
                    setSelectedIndex(Math.max(0, safeIdx - 1));
                  }}
                  disableDelete={projects.length <= 1}
                />
              </div>
            </div>

            {/* Identity & Metadata */}
            <div className={`${CARD_CLASS} space-y-5`}>
              <h4 className="font-display text-[19px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
                Identity, Category &amp; Links
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextInput
                  id="proj-title"
                  label="Project Title"
                  maxLength={120}
                  value={active.title}
                  onChange={(title) => updateProject(safeIdx, { title })}
                />
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="proj-slug"
                      className="text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE]"
                    >
                      URL Slug
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        updateProject(safeIdx, { slug: sanitizeSlug(active.title) })
                      }
                      className="text-[11px] font-mono underline text-[#666666] dark:text-[#9A9A96] cursor-pointer"
                    >
                      Sync from title
                    </button>
                  </div>
                  <input
                    id="proj-slug"
                    type="text"
                    value={active.slug}
                    onChange={(e) =>
                      updateProject(safeIdx, { slug: sanitizeSlug(e.target.value) })
                    }
                    className={INPUT_CLASS}
                  />
                </div>

                <div className="sm:col-span-2">
                  <TextInput
                    id="proj-subtitle"
                    label="Subtitle"
                    maxLength={220}
                    value={active.subtitle}
                    onChange={(subtitle) => updateProject(safeIdx, { subtitle })}
                  />
                </div>

                <Field id="proj-category" label="Category">
                  <select
                    id="proj-category"
                    value={active.category}
                    onChange={(e) =>
                      updateProject(safeIdx, {
                        category: e.target.value as ProjectCategory,
                      })
                    }
                    className={INPUT_CLASS}
                  >
                    {ALLOWED_PROJECT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </Field>

                <TextInput
                  id="proj-tag"
                  label="Original Tag"
                  maxLength={80}
                  value={active.originalTag}
                  onChange={(originalTag) => updateProject(safeIdx, { originalTag })}
                />
                <TextInput
                  id="proj-year"
                  label="Year"
                  maxLength={16}
                  value={active.year}
                  onChange={(year) => updateProject(safeIdx, { year })}
                />
                <TextInput
                  id="proj-status"
                  label="Status"
                  maxLength={60}
                  value={active.status}
                  onChange={(status) => updateProject(safeIdx, { status })}
                />
                <TextInput
                  id="proj-role"
                  label="Role"
                  maxLength={100}
                  value={active.role}
                  onChange={(role) => updateProject(safeIdx, { role })}
                />

                <div className="flex items-center gap-4 pt-5">
                  <label className="inline-flex items-center gap-2 text-[12.5px] font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={active.featured}
                      onChange={(e) =>
                        updateProject(safeIdx, { featured: e.target.checked })
                      }
                      className="h-4 w-4 rounded accent-[#1A1A1A] dark:accent-[#F0F0EE]"
                    />
                    <span>Featured on Home</span>
                  </label>

                  <select
                    aria-label="Featured grid span"
                    value={active.featuredSpan}
                    onChange={(e) =>
                      updateProject(safeIdx, {
                        featuredSpan: e.target.value as 'wide' | 'standard',
                      })
                    }
                    className="h-9 rounded-xl border border-black/[0.1] dark:border-white/[0.12] bg-white dark:bg-[#0E0E0D] px-3 text-[12px]"
                  >
                    <option value="wide">Wide Span</option>
                    <option value="standard">Standard Span</option>
                  </select>
                </div>

                {/* Live & GitHub Links */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="proj-live"
                      className="text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE]"
                    >
                      Live Site URL
                    </label>
                    {active.liveUrl ? (
                      <a
                        href={active.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-[#666666] hover:underline"
                      >
                        <span>Open</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    ) : null}
                  </div>
                  <input
                    id="proj-live"
                    type="url"
                    value={active.liveUrl ?? ''}
                    onChange={(e) =>
                      updateProject(safeIdx, {
                        liveUrl: e.target.value.trim() ? e.target.value : undefined,
                      })
                    }
                    placeholder="https://example.vercel.app/"
                    className={INPUT_CLASS}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="proj-github"
                      className="text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE]"
                    >
                      GitHub Repository URL
                    </label>
                    {active.githubUrl ? (
                      <a
                        href={active.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-[#666666] hover:underline"
                      >
                        <span>Open</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    ) : null}
                  </div>
                  <input
                    id="proj-github"
                    type="url"
                    value={active.githubUrl ?? ''}
                    onChange={(e) =>
                      updateProject(safeIdx, {
                        githubUrl: e.target.value.trim() ? e.target.value : undefined,
                      })
                    }
                    placeholder="https://github.com/petrosgDev/..."
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            </div>

            {/* Hero Image & Gallery */}
            <div className={`${CARD_CLASS} space-y-5`}>
              <div className="flex items-center justify-between">
                <h4 className="font-display text-[19px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
                  Hero Preview &amp; Gallery Images
                </h4>
              </div>

              <ImagePickerCropper
                id={`proj-hero-${safeIdx}`}
                label="Hero Image"
                value={active.heroImage.src}
                aspectHint={active.heroImage.aspect}
                authHeaders={authHeaders}
                onChange={(src) =>
                  updateProject(safeIdx, {
                    heroImage: { ...active.heroImage, src },
                  })
                }
                showMetadata={{
                  alt: active.heroImage.alt,
                  caption: active.heroImage.caption,
                  aspect: active.heroImage.aspect,
                  onChangeMeta: (patch) =>
                    updateProject(safeIdx, {
                      heroImage: { ...active.heroImage, ...patch },
                    }),
                }}
              />

              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE]">
                    Case Study Gallery ({active.gallery.length}/10)
                  </span>
                  <button
                    type="button"
                    disabled={active.gallery.length >= 10}
                    onClick={() =>
                      updateProject(safeIdx, {
                        gallery: [
                          ...active.gallery,
                          { ...active.heroImage },
                        ],
                      })
                    }
                    className="inline-flex h-8 items-center gap-1 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-3 text-[11.5px] font-medium hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] cursor-pointer disabled:opacity-45"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Gallery Image</span>
                  </button>
                </div>

                {active.gallery.map((gImg, gIdx) => (
                  <div key={`gal-${safeIdx}-${gIdx}`} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
                        Gallery Image #{gIdx + 1}
                      </span>
                      <ReorderControls
                        index={gIdx}
                        total={active.gallery.length}
                        itemLabel={`gallery image ${gIdx + 1}`}
                        onMoveUp={() =>
                          updateProject(safeIdx, {
                            gallery: moveArrayItem(active.gallery, gIdx, gIdx - 1),
                          })
                        }
                        onMoveDown={() =>
                          updateProject(safeIdx, {
                            gallery: moveArrayItem(active.gallery, gIdx, gIdx + 1),
                          })
                        }
                        onDelete={() =>
                          updateProject(safeIdx, {
                            gallery: active.gallery.filter((_, i) => i !== gIdx),
                          })
                        }
                        disableDelete={active.gallery.length <= 1}
                      />
                    </div>
                    <ImagePickerCropper
                      id={`proj-gal-${safeIdx}-${gIdx}`}
                      label="Gallery Image Path / URL"
                      value={gImg.src}
                      aspectHint={gImg.aspect}
                      authHeaders={authHeaders}
                      onChange={(src) =>
                        updateProject(safeIdx, {
                          gallery: active.gallery.map((item, i) =>
                            i === gIdx ? { ...item, src } : item
                          ),
                        })
                      }
                      showMetadata={{
                        alt: gImg.alt,
                        caption: gImg.caption,
                        aspect: gImg.aspect,
                        onChangeMeta: (patch: Partial<ProjectImage>) =>
                          updateProject(safeIdx, {
                            gallery: active.gallery.map((item, i) =>
                              i === gIdx ? { ...item, ...patch } : item
                            ),
                          }),
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Case Study Copy & Arrays */}
            <div className={`${CARD_CLASS} space-y-5`}>
              <h4 className="font-display text-[19px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
                Case Study Copy &amp; Architecture
              </h4>

              <TextAreaField
                id="proj-summary"
                label="Card Summary"
                hint={`${active.summary.length}/600`}
                maxLength={600}
                rows={2}
                value={active.summary}
                onChange={(summary) => updateProject(safeIdx, { summary })}
              />
              <TextAreaField
                id="proj-overview"
                label="Case Study Overview"
                hint={`${active.overview.length}/1600`}
                maxLength={1600}
                rows={4}
                value={active.overview}
                onChange={(overview) => updateProject(safeIdx, { overview })}
              />
              <TextAreaField
                id="proj-problem"
                label="Problem Statement"
                hint={`${active.problemStatement.length}/1000`}
                maxLength={1000}
                rows={3}
                value={active.problemStatement}
                onChange={(problemStatement) =>
                  updateProject(safeIdx, { problemStatement })
                }
              />
              <TextAreaField
                id="proj-contribution"
                label="Engineering Contribution"
                hint={`${active.contribution.length}/1000`}
                maxLength={1000}
                rows={3}
                value={active.contribution}
                onChange={(contribution) => updateProject(safeIdx, { contribution })}
              />

              <StringListEditor
                id={`proj-tech-${safeIdx}`}
                label="Technologies"
                hint="Max 24"
                items={active.technologies}
                onChange={(technologies) => updateProject(safeIdx, { technologies })}
                placeholder="Add technology (e.g. Next.js)"
              />

              <StringListEditor
                id={`proj-obj-${safeIdx}`}
                label="Objectives"
                hint="Max 12"
                items={active.objectives}
                multiline
                onChange={(objectives) => updateProject(safeIdx, { objectives })}
                placeholder="Add project objective..."
              />

              <StringListEditor
                id={`proj-features-${safeIdx}`}
                label="Key Features"
                hint="Max 15"
                items={active.keyFeatures}
                multiline
                onChange={(keyFeatures) => updateProject(safeIdx, { keyFeatures })}
                placeholder="Add key feature..."
              />

              <StringListEditor
                id={`proj-arch-${safeIdx}`}
                label="Architecture Highlights"
                hint="Max 15"
                items={active.architecture ?? []}
                multiline
                onChange={(architecture) => updateProject(safeIdx, { architecture })}
                placeholder="Add architecture layer or pattern..."
              />

              {/* Challenges & Solutions */}
              <div className="space-y-3 pt-2 border-t border-[#EAEAEA] dark:border-[#222220]">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE]">
                    Challenges &amp; Solutions ({active.challengesAndSolutions?.length ?? 0}/12)
                  </span>
                  <button
                    type="button"
                    disabled={(active.challengesAndSolutions?.length ?? 0) >= 12}
                    onClick={() =>
                      updateProject(safeIdx, {
                        challengesAndSolutions: [
                          ...(active.challengesAndSolutions ?? []),
                          { challenge: '', solution: '' },
                        ],
                      })
                    }
                    className="inline-flex h-8 items-center gap-1 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-3 text-[11.5px] font-medium cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Pair</span>
                  </button>
                </div>

                {(active.challengesAndSolutions ?? []).map((cs, cIdx) => (
                  <div
                    key={`cs-${safeIdx}-${cIdx}`}
                    className="rounded-xl border border-[#EAEAEA] dark:border-[#222220] bg-white dark:bg-[#0E0E0D] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
                        Challenge #{cIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateProject(safeIdx, {
                            challengesAndSolutions: (
                              active.challengesAndSolutions ?? []
                            ).filter((_, i) => i !== cIdx),
                          })
                        }
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-red-500/25 text-red-700 dark:text-red-400 cursor-pointer"
                        aria-label="Delete challenge pair"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <TextAreaField
                      id={`cs-c-${safeIdx}-${cIdx}`}
                      label="Challenge"
                      rows={2}
                      maxLength={600}
                      value={cs.challenge}
                      onChange={(challenge) =>
                        updateProject(safeIdx, {
                          challengesAndSolutions: (
                            active.challengesAndSolutions ?? []
                          ).map((item, i) =>
                            i === cIdx ? { ...item, challenge } : item
                          ),
                        })
                      }
                    />
                    <TextAreaField
                      id={`cs-s-${safeIdx}-${cIdx}`}
                      label="Solution"
                      rows={2}
                      maxLength={600}
                      value={cs.solution}
                      onChange={(solution) =>
                        updateProject(safeIdx, {
                          challengesAndSolutions: (
                            active.challengesAndSolutions ?? []
                          ).map((item, i) =>
                            i === cIdx ? { ...item, solution } : item
                          ),
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
