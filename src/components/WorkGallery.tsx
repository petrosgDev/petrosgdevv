'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { usePortfolio } from '@/components/PortfolioContext';
import {
  filterProjects,
  getCategoryCounts,
  type CategoryFilter,
} from '@/lib/portfolioLogic';
import { EditorialImage } from '@/components/EditorialImage';
import { ProjectCard } from '@/components/ProjectCard';
import { Reveal } from '@/components/Reveal';

export function WorkGallery() {
  const { data } = usePortfolio();
  const { PROJECT_CATEGORIES, PROJECTS } = data;
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categoryCounts = useMemo(() => getCategoryCounts(PROJECTS), [PROJECTS]);
  const filteredProjects = useMemo(
    () => filterProjects(PROJECTS, activeCategory, searchQuery),
    [PROJECTS, activeCategory, searchQuery]
  );

  const spotlightProject = PROJECTS[0];
  const isFiltering = activeCategory !== 'All' || searchQuery.trim().length > 0;

  const resetFilters = () => {
    setActiveCategory('All');
    setSearchQuery('');
  };

  return (
    <>
      {/* Featured Project Spotlight */}
      {!isFiltering && spotlightProject && (
        <section
          aria-label="Featured project spotlight"
          className="py-12 border-b border-[#EAEAEA] dark:border-[#222220]"
        >
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
            <Link
              href={`/work/${spotlightProject.slug}`}
              aria-label={`Open ${spotlightProject.title} case study`}
              className="group lg:col-span-7 flex items-center justify-center rounded-xl border border-black/[0.07] dark:border-white/[0.08] bg-[#F6F6F5] dark:bg-[#141413] p-4 sm:p-6 overflow-hidden aspect-[16/10] transition-all duration-300 hover:border-black/15 dark:hover:border-white/20 hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
            >
              <EditorialImage
                src={spotlightProject.heroImage.src}
                alt={spotlightProject.heroImage.alt}
                fallbackTitle={spotlightProject.title}
                priority
                fit="contain"
                transparentBg
                className="h-full w-full flex items-center justify-center"
                imgClassName="max-h-full max-w-full w-auto h-auto rounded-md border border-black/8 dark:border-white/10 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
              />
            </Link>

            <div className="lg:col-span-5 space-y-4">
              <p className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
                Featured Case Study · {spotlightProject.category}
              </p>
              <h2 className="font-display text-[28px] sm:text-[34px] font-bold uppercase tracking-tight leading-none text-[#1A1A1A] dark:text-[#F0F0EE]">
                <Link
                  href={`/work/${spotlightProject.slug}`}
                  className="hover:opacity-65 transition-opacity"
                >
                  {spotlightProject.title}
                </Link>
              </h2>
              <p className="text-[13px] leading-[1.75] text-[#666666] dark:text-[#9A9A96]">
                {spotlightProject.overview}
              </p>
              <p className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
                {spotlightProject.technologies.join(' / ')}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href={`/work/${spotlightProject.slug}`}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] px-5 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-85 transition-opacity whitespace-nowrap"
                >
                  <span>Explore Case Study</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                {spotlightProject.liveUrl && (
                  <a
                    href={spotlightProject.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center gap-1.5 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-5 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors whitespace-nowrap"
                  >
                    <span>Live Site</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter Tabs & Search Toolbar */}
      <section aria-label="Filter and search projects" className="py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="tablist"
            aria-label="Project categories"
            className="flex flex-wrap items-center gap-1.5"
          >
            {PROJECT_CATEGORIES.map((category) => {
              const selected = activeCategory === category;
              const count = categoryCounts[category];
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveCategory(category)}
                  className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-medium transition-colors duration-150 whitespace-nowrap cursor-pointer ${
                    selected
                      ? 'bg-[#1A1A1A] text-white dark:bg-[#F0F0EE] dark:text-[#0A0A0A]'
                      : 'border border-black/[0.09] dark:border-white/[0.11] text-[#666666] dark:text-[#9A9A96] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] hover:border-[#1A1A1A]/50 dark:hover:border-[#F0F0EE]/50'
                  }`}
                >
                  <span>{category}</span>
                  <span className="font-mono text-[10px] opacity-70 tabular-nums">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-72">
            <label htmlFor="project-search" className="sr-only">
              Search projects by title, category, or technology
            </label>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#666666] dark:text-[#9A9A96]"
              aria-hidden="true"
            />
            <input
              id="project-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search projects or stack..."
              className="h-9 w-full rounded-full border border-black/[0.09] dark:border-white/[0.11] bg-transparent pl-9 pr-8 text-[12.5px] text-[#1A1A1A] dark:text-[#F0F0EE] placeholder:text-[#666666]/75 dark:placeholder:text-[#9A9A96]/75 focus:border-[#1A1A1A] dark:focus:border-[#F0F0EE] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center text-[#666666] dark:text-[#9A9A96] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-[11.5px] text-[#666666] dark:text-[#9A9A96]">
          <p aria-live="polite" className="tabular-nums">
            Showing {filteredProjects.length} of {PROJECTS.length} projects
            {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
            {searchQuery.trim() ? ` matching “${searchQuery.trim()}”` : ''}
          </p>
          {isFiltering && (
            <button
              type="button"
              onClick={resetFilters}
              className="underline underline-offset-4 hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      </section>

      {/* Asymmetric Project Grid or Empty State */}
      {filteredProjects.length === 0 ? (
        <div className="my-10 rounded-2xl border border-[#EAEAEA] dark:border-[#222220] px-8 py-14 text-center space-y-3">
          <h2 className="font-display text-2xl font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
            No projects match your current filter.
          </h2>
          <p className="text-[13px] text-[#666666] dark:text-[#9A9A96]">
            Try searching for a different technology like Next.js, JavaFX, C++, or Flutter, or reset
            to view the complete portfolio.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex h-9 items-center rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] px-5 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-85 transition-opacity cursor-pointer"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <section aria-label="Project gallery" className="pb-14">
          <div className="grid grid-cols-1 gap-x-10 gap-y-14 lg:grid-cols-12">
            {filteredProjects.map((project, index) => {
              const pairIndex = Math.floor(index / 2);
              const isFirstInPair = index % 2 === 0;
              const isWide =
                filteredProjects.length >= 4
                  ? pairIndex % 2 === 0
                    ? isFirstInPair
                    : !isFirstInPair
                  : false;

              const spanClass =
                filteredProjects.length === 1
                  ? 'lg:col-span-8'
                  : filteredProjects.length < 4
                  ? 'lg:col-span-6'
                  : isWide
                  ? 'lg:col-span-7'
                  : 'lg:col-span-5';

              const aspectClass =
                project.heroImage.aspect === 'portrait'
                  ? 'aspect-[4/3]'
                  : isWide
                  ? 'aspect-[16/10]'
                  : 'aspect-[4/3]';

              return (
                <Reveal key={project.id} delay={(index % 2) * 0.04} className={spanClass}>
                  <ProjectCard project={project} aspectClass={aspectClass} />
                </Reveal>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
