import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { PROJECTS, SITE_PROFILE } from '@/data/portfolio';
import {
  getAdjacentProjects,
  getProjectBySlug,
  getRelatedProjects,
} from '@/lib/portfolioLogic';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectHeroPreview } from '@/components/ProjectHeroPreview';
import { Reveal } from '@/components/Reveal';

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(PROJECTS, slug);

  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  return {
    title: `${project.title} — Case Study`,
    description: project.summary,
    openGraph: {
      title: `${project.title} — Case Study | ${SITE_PROFILE.fullName}`,
      description: project.summary,
      images: [{ url: project.heroImage.src, alt: project.heroImage.alt }],
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(PROJECTS, slug);

  if (!project) {
    notFound();
  }

  const { previous, next } = getAdjacentProjects(PROJECTS, project.slug);
  const relatedProjects = getRelatedProjects(PROJECTS, project.slug, 2);

  return (
    <article className="mx-auto max-w-[1200px] px-6 py-10 md:px-10 md:py-16">
      <div className="mb-8">
        <Link
          href="/work"
          className="inline-flex items-center gap-1.5 text-[12px] text-[#666666] dark:text-[#9A9A96] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to all projects</span>
        </Link>
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
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] px-5 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-85 transition-opacity whitespace-nowrap"
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
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-5 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors whitespace-nowrap"
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

      {/* Live Website Frame (or Screenshot Lightbox for Non-Web Apps) */}
      <ProjectHeroPreview
        title={project.title}
        heroImage={project.heroImage}
        liveUrl={project.liveUrl}
      />

      {/* Structured Case Study Sections */}
      <div className="divide-y divide-[#EAEAEA] dark:divide-[#222220] border-y border-[#EAEAEA] dark:border-[#222220]">
        <Reveal>
          <section className="py-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="font-display text-[22px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
                Overview &amp; Problem
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
                Objectives &amp; Role
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
                  My Role &amp; Contribution
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
                Key Features &amp; Stack
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
                  Architecture &amp; Workflow
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
                  Challenges &amp; Solutions
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
            <Link
              href="/work"
              className="text-[12px] text-[#666666] dark:text-[#9A9A96] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] underline underline-offset-4"
            >
              All projects
            </Link>
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
          <Link
            href={`/work/${previous.slug}`}
            className="group rounded-xl border border-black/[0.08] dark:border-white/[0.1] p-5 hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors"
          >
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
              <ArrowLeft className="h-3 w-3" aria-hidden="true" />
              <span>Previous Project</span>
            </span>
            <p className="mt-1.5 font-display text-[22px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE] group-hover:opacity-65 transition-opacity">
              {previous.title}
            </p>
          </Link>
        ) : (
          <div />
        )}

        {next && (
          <Link
            href={`/work/${next.slug}`}
            className="group rounded-xl border border-black/[0.08] dark:border-white/[0.1] p-5 sm:text-right hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors"
          >
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
              <span>Next Project</span>
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </span>
            <p className="mt-1.5 font-display text-[22px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE] group-hover:opacity-65 transition-opacity">
              {next.title}
            </p>
          </Link>
        )}
      </nav>
    </article>
  );
}
