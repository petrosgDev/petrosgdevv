import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Search, X } from 'lucide-react';
import {
  PROJECT_CATEGORIES,
  PROJECTS,
  SITE_PROFILE,
} from '../data/portfolio';
import {
  filterProjects,
  getCategoryCounts,
  type CategoryFilter,
} from '../utils/portfolioLogic';
import { updatePageSeo } from '../utils/seo';
import { AppLink } from '../components/RouterContext';
import { EditorialImage } from '../components/EditorialImage';
import { ProjectCard } from '../components/ProjectCard';
import { Reveal } from '../components/Reveal';

export function WorkPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    updatePageSeo({
      title: `Work — ${SITE_PROFILE.fullName} (${SITE_PROFILE.brand})`,
      description:
        'Explore software engineering case studies by Petros Geto across web applications, brand & hospitality websites, native desktop systems, and mobile apps.',
      path: '/work',
    });
  }, []);

  const categoryCounts = useMemo(() => getCategoryCounts(PROJECTS), []);
  const filteredProjects = useMemo(
    () => filterProjects(PROJECTS, activeCategory, searchQuery),
    [activeCategory, searchQuery]
  );

  const spotlightProject = PROJECTS[0];
  const isFiltering = activeCategory !== 'All' || searchQuery.trim().length > 0;

  const resetFilters = () => {
    setActiveCategory('All');
    setSearchQuery('');
  };

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 md:px-10 md:py-16">
      {/* Page Header */}
      <header className="pb-12 border-b border-[#EAEAEA] dark:border-[#222220]">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8 space-y-2.5">
            <p className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
              Selected Portfolio · {PROJECTS.length} Projects
            </p>
            <h1 className="font-display text-[2.4rem] sm:text-[3.1rem] font-extrabold uppercase leading-[0.98] tracking-[-0.01em] text-[#1A1A1A] dark:text-[#F0F0EE]">
              Work & Case Studies
            </h1>
          </div>
          <div className="lg:col-span-4">
            <p className="text-[13px] leading-[1.75] text-[#666666] dark:text-[#9A9A96]">
              Full-stack web platforms, hospitality showcases, native Java and C++ desktop systems,
              and offline-first mobile applications.
            </p>
          </div>
        </div>
      </header>

      {/* Featured Project Spotlight */}
      {!isFiltering && spotlightProject && (
        <section
          aria-label="Featured project spotlight"
          className="py-12 border-b border-[#EAEAEA] dark:border-[#222220]"
        >
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
            <AppLink
              to={`/work/${spotlightProject.slug}`}
              aria-label={`Open ${spotlightProject.title} case study`}
              className="group lg:col-span-7 flex items-center justify-center border border-[#EAEAEA] dark:border-[#222220] bg-[#F6F6F5] dark:bg-[#141413] p-4 sm:p-6 overflow-hidden aspect-[16/10]"
            >
              <EditorialImage
                src={spotlightProject.heroImage.src}
                alt={spotlightProject.heroImage.alt}
                fallbackTitle={spotlightProject.title}
                priority
                fit="contain"
                className="h-full w-full bg-transparent dark:bg-transparent flex items-center justify-center"
                imgClassName="max-h-full max-w-full w-auto h-auto border border-black/8 dark:border-white/10 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
              />
            </AppLink>

            <div className="lg:col-span-5 space-y-4">
              <p className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
                Featured Case Study · {spotlightProject.category}
              </p>
              <h2 className="font-display text-[28px] sm:text-[34px] font-bold uppercase tracking-tight leading-none text-[#1A1A1A] dark:text-[#F0F0EE]">
                <AppLink
                  to={`/work/${spotlightProject.slug}`}
                  className="hover:opacity-65 transition-opacity"
                >
                  {spotlightProject.title}
                </AppLink>
              </h2>
              <p className="text-[13px] leading-[1.75] text-[#666666] dark:text-[#9A9A96]">
                {spotlightProject.overview}
              </p>
              <p className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
                {spotlightProject.technologies.join(' / ')}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <AppLink
                  to={`/work/${spotlightProject.slug}`}
                  className="inline-flex h-10 items-center gap-1.5 bg-[#1A1A1A] dark:bg-[#F0F0EE] px-4 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-80 transition-opacity whitespace-nowrap"
                >
                  <span>Explore Case Study</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </AppLink>
                {spotlightProject.liveUrl && (
                  <a
                    href={spotlightProject.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center gap-1.5 border border-[#EAEAEA] dark:border-[#222220] px-4 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors whitespace-nowrap"
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
                  className={`inline-flex h-9 items-center gap-1.5 px-3 text-[12px] font-medium transition-colors duration-150 whitespace-nowrap cursor-pointer ${
                    selected
                      ? 'bg-[#1A1A1A] text-white dark:bg-[#F0F0EE] dark:text-[#0A0A0A]'
                      : 'border border-[#EAEAEA] dark:border-[#222220] text-[#666666] dark:text-[#9A9A96] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] hover:border-[#1A1A1A]/50 dark:hover:border-[#F0F0EE]/50'
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
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#666666] dark:text-[#9A9A96]"
              aria-hidden="true"
            />
            <input
              id="project-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search projects or stack..."
              className="h-9 w-full border border-[#EAEAEA] dark:border-[#222220] bg-transparent pl-9 pr-8 text-[12.5px] text-[#1A1A1A] dark:text-[#F0F0EE] placeholder:text-[#666666]/75 dark:placeholder:text-[#9A9A96]/75 focus:border-[#1A1A1A] dark:focus:border-[#F0F0EE] focus:outline-none transition-colors"
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
        <div className="my-10 border border-[#EAEAEA] dark:border-[#222220] px-8 py-14 text-center space-y-3">
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
            className="inline-flex h-9 items-center bg-[#1A1A1A] dark:bg-[#F0F0EE] px-4 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-80 transition-opacity cursor-pointer"
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

      {/* GitHub Archive Link */}
      <section className="mt-8 pt-10 border-t border-[#EAEAEA] dark:border-[#222220] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="font-display text-[22px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
            Additional Repositories & Experiments
          </h2>
          <p className="text-[13px] text-[#666666] dark:text-[#9A9A96]">
            Browse all 23 public repositories—including Flutter apps, Python tools, and Java utilities—on
            GitHub.
          </p>
        </div>
        <a
          href={`${SITE_PROFILE.githubUrl}?tab=repositories`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-1.5 border border-[#EAEAEA] dark:border-[#222220] px-4 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors whitespace-nowrap shrink-0"
        >
          <span>View GitHub Repositories</span>
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </section>
    </div>
  );
}
