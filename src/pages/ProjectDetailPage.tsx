import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Maximize2 } from 'lucide-react';
import { PROJECTS, SITE_PROFILE, type ProjectImage } from '../data/portfolio';
import {
  getAdjacentProjects,
  getProjectBySlug,
  getRelatedProjects,
} from '../utils/portfolioLogic';
import { updatePageSeo } from '../utils/seo';
import { AppLink } from '../components/RouterContext';
import { EditorialImage } from '../components/EditorialImage';
import { LightboxModal } from '../components/LightboxModal';
import { ProjectCard } from '../components/ProjectCard';
import { Reveal } from '../components/Reveal';
import { NotFoundPage } from './NotFoundPage';

interface ProjectDetailPageProps {
  slug: string;
}

export function ProjectDetailPage({ slug }: ProjectDetailPageProps) {
  const project = useMemo(() => getProjectBySlug(PROJECTS, slug), [slug]);
  const [lightboxImage, setLightboxImage] = useState<ProjectImage | null>(null);

  useEffect(() => {
    if (!project) {
      return;
    }
    updatePageSeo({
      title: `${project.title} — Case Study | ${SITE_PROFILE.fullName}`,
      description: project.summary,
      path: `/work/${project.slug}`,
    });
  }, [project]);

  if (!project) {
    return <NotFoundPage />;
  }

  const { previous, next } = getAdjacentProjects(PROJECTS, project.slug);
  const relatedProjects = getRelatedProjects(PROJECTS, project.slug, 2);
  const isPortrait = project.heroImage.aspect === 'portrait';

  return (
    <article className="mx-auto max-w-[1200px] px-6 py-10 md:px-10 md:py-16">
      <div className="mb-8">
        <AppLink
          to="/work"
          className="inline-flex items-center gap-1.5 text-[12px] text-[#666666] dark:text-[#9A9A96] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to all projects</span>
        </AppLink>
      </div>

      {/* Header */}
      <header className="pb-10 border-b border-[#EAEAEA] dark:border-[#222220]">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#666666] dark:text-[#9A9A96]">
              <span>{project.category}</span>
              <span aria-hidden="true">·</span>
              <span>{project.originalTag}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{project.year}</span>
              <span aria-hidden="true">·</span>
              <span>{project.status}</span>
            </div>

            <h1 className="font-display text-[2.4rem] sm:text-[3.2rem] font-extrabold uppercase leading-[0.98] tracking-[-0.01em] text-[#1A1A1A] dark:text-[#F0F0EE]">
              {project.title}
            </h1>

            <p className="max-w-[60ch] text-[14px] leading-[1.75] text-[#666666] dark:text-[#9A9A96]">
              {project.subtitle}
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-wrap lg:justify-end gap-3">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-1.5 bg-[#1A1A1A] dark:bg-[#F0F0EE] px-4 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-80 transition-opacity whitespace-nowrap"
              >
                <span>Visit Live Demo</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-1.5 border border-[#EAEAEA] dark:border-[#222220] px-4 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors whitespace-nowrap"
              >
                <span>GitHub Repository</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>

        <dl className="mt-8 pt-6 border-t border-[#EAEAEA] dark:border-[#222220] grid grid-cols-2 gap-6 sm:grid-cols-4 text-[13px]">
          <div>
            <dt className="text-[11px] text-[#666666] dark:text-[#9A9A96]">Role</dt>
            <dd className="mt-1 font-medium text-[#1A1A1A] dark:text-[#F0F0EE]">{project.role}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-[#666666] dark:text-[#9A9A96]">Category</dt>
            <dd className="mt-1 font-medium text-[#1A1A1A] dark:text-[#F0F0EE]">
              {project.category}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-[#666666] dark:text-[#9A9A96]">Year</dt>
            <dd className="mt-1 font-mono font-medium text-[#1A1A1A] dark:text-[#F0F0EE] tabular-nums">
              {project.year}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-[#666666] dark:text-[#9A9A96]">Status</dt>
            <dd className="mt-1 font-medium text-[#1A1A1A] dark:text-[#F0F0EE]">
              {project.status}
            </dd>
          </div>
        </dl>
      </header>

      {/* Hero Screenshot */}
      <section className="py-10">
        <figure className="space-y-2.5">
          <button
            type="button"
            onClick={() => setLightboxImage(project.heroImage)}
            aria-label={`Open fullscreen preview of ${project.title}`}
            className={`group relative flex items-center justify-center w-full border border-[#EAEAEA] dark:border-[#222220] overflow-hidden text-left cursor-zoom-in ${
              isPortrait
                ? 'bg-[#141413] py-10 px-6 max-h-[620px]'
                : 'bg-[#F6F6F5] dark:bg-[#141413] p-4 sm:p-8 lg:p-10'
            }`}
          >
            <EditorialImage
              src={project.heroImage.src}
              alt={project.heroImage.alt}
              fallbackTitle={project.title}
              priority
              fit="contain"
              className={`bg-transparent dark:bg-transparent flex items-center justify-center ${
                isPortrait ? 'h-[500px] w-full' : 'w-full'
              }`}
              imgClassName={`transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.01] ${
                isPortrait
                  ? 'max-h-[500px] w-auto shadow-lg'
                  : 'w-full h-auto max-h-[620px] object-contain border border-black/8 dark:border-white/10'
              }`}
            />
            <span className="absolute right-4 bottom-4 inline-flex items-center gap-1.5 bg-[#1A1A1A]/85 px-3 py-1.5 text-[11px] font-medium text-white opacity-90 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="h-3 w-3" aria-hidden="true" />
              <span>Inspect full view</span>
            </span>
          </button>
          <figcaption className="text-[11.5px] text-[#666666] dark:text-[#9A9A96]">
            {project.heroImage.caption}
          </figcaption>
        </figure>
      </section>

      {/* Structured Case Study Sections */}
      <div className="divide-y divide-[#EAEAEA] dark:divide-[#222220] border-y border-[#EAEAEA] dark:border-[#222220]">
        <Reveal>
          <section className="py-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="font-display text-[22px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
                Overview & Problem
              </h2>
            </div>
            <div className="lg:col-span-8 space-y-5">
              <div className="space-y-1.5">
                <h3 className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
                  Project Overview
                </h3>
                <p className="text-[13.5px] sm:text-[14px] leading-[1.8] text-[#1A1A1A] dark:text-[#F0F0EE] max-w-[65ch]">
                  {project.overview}
                </p>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
                  Problem Statement
                </h3>
                <p className="text-[13.5px] leading-[1.8] text-[#666666] dark:text-[#9A9A96] max-w-[65ch]">
                  {project.problemStatement}
                </p>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="py-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="font-display text-[22px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
                Objectives & Role
              </h2>
            </div>
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-2.5">
                <h3 className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
                  Project Objectives
                </h3>
                <ul className="space-y-2.5">
                  {project.objectives.map((objective, idx) => (
                    <li
                      key={objective}
                      className="grid grid-cols-[22px_1fr] gap-2.5 text-[13.5px] leading-[1.75] text-[#1A1A1A] dark:text-[#F0F0EE]"
                    >
                      <span className="font-mono text-[11px] pt-1 text-[#666666] dark:text-[#9A9A96] tabular-nums">
                        0{idx + 1}
                      </span>
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5 pt-4 border-t border-[#EAEAEA] dark:border-[#222220]">
                <h3 className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
                  My Role & Contribution
                </h3>
                <p className="text-[13.5px] leading-[1.8] text-[#666666] dark:text-[#9A9A96] max-w-[65ch]">
                  {project.contribution}
                </p>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="py-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="font-display text-[22px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
                Key Features & Stack
              </h2>
            </div>
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-2.5">
                <h3 className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
                  Implemented Capabilities
                </h3>
                <ul className="space-y-2.5">
                  {project.keyFeatures.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-[13.5px] leading-[1.75] text-[#1A1A1A] dark:text-[#F0F0EE]"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2.5 h-[1px] w-2.5 shrink-0 bg-[#1A1A1A] dark:bg-[#F0F0EE]"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5 pt-4 border-t border-[#EAEAEA] dark:border-[#222220]">
                <h3 className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
                  Technologies Used
                </h3>
                <p className="text-[12.5px] font-mono text-[#1A1A1A] dark:text-[#F0F0EE]">
                  {project.technologies.join(' · ')}
                </p>
              </div>
            </div>
          </section>
        </Reveal>

        {project.architecture && project.architecture.length > 0 && (
          <Reveal>
            <section className="py-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <h2 className="font-display text-[22px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
                  Architecture & Workflow
                </h2>
              </div>
              <div className="lg:col-span-8">
                <ul className="space-y-2.5">
                  {project.architecture.map((item, idx) => (
                    <li
                      key={item}
                      className="grid grid-cols-[22px_1fr] gap-2.5 text-[13.5px] leading-[1.75]"
                    >
                      <span className="font-mono text-[11px] pt-1 text-[#666666] dark:text-[#9A9A96] tabular-nums">
                        0{idx + 1}
                      </span>
                      <span className="text-[#1A1A1A] dark:text-[#F0F0EE]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </Reveal>
        )}

        {project.challengesAndSolutions && project.challengesAndSolutions.length > 0 && (
          <Reveal>
            <section className="py-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <h2 className="font-display text-[22px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
                  Challenges & Solutions
                </h2>
              </div>
              <div className="lg:col-span-8 space-y-5">
                {project.challengesAndSolutions.map((entry) => (
                  <div key={entry.challenge} className="space-y-3">
                    <div>
                      <h3 className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
                        Challenge
                      </h3>
                      <p className="mt-1 text-[13.5px] leading-[1.75] text-[#666666] dark:text-[#9A9A96]">
                        {entry.challenge}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-[11px] font-mono text-[#1A1A1A] dark:text-[#F0F0EE]">
                        Engineering Solution
                      </h3>
                      <p className="mt-1 text-[13.5px] leading-[1.75] text-[#1A1A1A] dark:text-[#F0F0EE]">
                        {entry.solution}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>
        )}
      </div>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="py-16 border-b border-[#EAEAEA] dark:border-[#222220]">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
                Continue Exploring
              </p>
              <h2 className="font-display text-[26px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
                Related Projects
              </h2>
            </div>
            <AppLink
              to="/work"
              className="text-[12px] text-[#666666] dark:text-[#9A9A96] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] underline underline-offset-4"
            >
              All projects
            </AppLink>
          </div>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {relatedProjects.map((related) => (
              <ProjectCard key={related.id} project={related} aspectClass="aspect-[16/10]" />
            ))}
          </div>
        </section>
      )}

      {/* Previous / Next Project */}
      <nav
        aria-label="Project sequence navigation"
        className="pt-10 grid grid-cols-1 gap-6 sm:grid-cols-2"
      >
        {previous ? (
          <AppLink
            to={`/work/${previous.slug}`}
            className="group border border-[#EAEAEA] dark:border-[#222220] p-5 hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors"
          >
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
              <ArrowLeft className="h-3 w-3" aria-hidden="true" />
              <span>Previous Project</span>
            </span>
            <p className="mt-1.5 font-display text-[22px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE] group-hover:opacity-65 transition-opacity">
              {previous.title}
            </p>
          </AppLink>
        ) : (
          <div />
        )}

        {next && (
          <AppLink
            to={`/work/${next.slug}`}
            className="group border border-[#EAEAEA] dark:border-[#222220] p-5 sm:text-right hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors"
          >
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
              <span>Next Project</span>
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </span>
            <p className="mt-1.5 font-display text-[22px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE] group-hover:opacity-65 transition-opacity">
              {next.title}
            </p>
          </AppLink>
        )}
      </nav>

      <LightboxModal
        image={lightboxImage}
        projectTitle={project.title}
        onClose={() => setLightboxImage(null)}
      />
    </article>
  );
}
