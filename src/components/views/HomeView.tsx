'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import {
  EXPERIENCES,
  PROJECTS,
  SITE_PROFILE,
  SKILL_CATEGORIES,
} from '@/data/portfolio';
import { getFeaturedProjects } from '@/lib/portfolioLogic';
import { EditorialImage } from '@/components/EditorialImage';
import { ExperienceShowcase } from '@/components/ExperienceShowcase';
import { ProjectCard } from '@/components/ProjectCard';
import { Reveal } from '@/components/Reveal';
import { SkillShowcase } from '@/components/SkillShowcase';
import { TelegramBlogPreview } from '@/components/TelegramBlogPreview';

export function HomeView() {
  const featuredProjects = getFeaturedProjects(PROJECTS);

  return (
    <div>
      {/* 1. Minimalist Split Hero — Studio-Framed Portrait (Left) & Clean Typography (Right) */}
      <section className="mx-auto flex min-h-[calc(100svh-56px)] md:min-h-[calc(100svh-68px)] max-w-[1200px] flex-col justify-between px-5 pt-10 pb-16 md:px-10 md:pt-20 md:pb-12 lg:pt-24 lg:pb-14">
        <div className="my-auto grid grid-cols-1 gap-10 md:gap-14 lg:grid-cols-12 lg:items-center lg:gap-16 xl:gap-24">
          {/* Left Column: Clean Borderless Portrait */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start">
            <EditorialImage
              src={SITE_PROFILE.portraitSrc}
              alt={`Portrait of ${SITE_PROFILE.fullName}, ${SITE_PROFILE.role}`}
              fallbackTitle={SITE_PROFILE.fullName}
              priority
              fit="contain"
              transparentBg
              className="w-full max-w-[290px] sm:max-w-[350px] lg:max-w-[400px]"
              imgClassName="w-full h-auto object-contain"
            />
          </div>

          {/* Right Column: Minimalist Editorial Intro */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6 md:space-y-7">
            <h1 className="font-display text-[2.5rem] sm:text-[3.1rem] font-extrabold uppercase leading-[0.98] tracking-[-0.01em] text-[#1A1A1A] dark:text-[#F0F0EE]">
              {SITE_PROFILE.heroGreeting}
            </h1>

            <p className="max-w-[46ch] text-[13.5px] sm:text-[14px] leading-[1.85] text-[#2A2A2A] dark:text-[#D4D4D0]">
              I&apos;m{' '}
              <strong className="font-semibold text-[#1A1A1A] dark:text-white">
                {SITE_PROFILE.fullName}
              </strong>
              , a{' '}
              <strong className="font-semibold text-[#1A1A1A] dark:text-white">
                software engineer
              </strong>{' '}
              and{' '}
              <strong className="font-semibold text-[#1A1A1A] dark:text-white">AI developer</strong>{' '}
              based in <em className="italic">{SITE_PROFILE.location}</em>. I build{' '}
              <strong className="font-semibold text-[#1A1A1A] dark:text-white">
                full-stack applications
              </strong>{' '}
              and practical, scalable digital products through clean code and thoughtful design.{' '}
              <Link
                href="/work"
                className="underline underline-offset-4 decoration-[#1A1A1A]/60 dark:decoration-[#F0F0EE]/60 hover:opacity-65 transition-opacity"
              >
                Explore my work
              </Link>{' '}
              or{' '}
              <Link
                href="/contact"
                className="underline underline-offset-4 decoration-[#1A1A1A]/60 dark:decoration-[#F0F0EE]/60 hover:opacity-65 transition-opacity"
              >
                contact below
              </Link>
              .
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-[#2A2A2A] dark:text-[#D4D4D0]">
              <p>
                <a
                  href={SITE_PROFILE.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#1A1A1A] dark:text-white underline underline-offset-4 hover:opacity-65 transition-opacity"
                >
                  {SITE_PROFILE.githubHandle}
                </a>{' '}
                <span className="text-[#666666] dark:text-[#9A9A96]">on GitHub</span>
              </p>
              <p>
                <a
                  href={SITE_PROFILE.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#1A1A1A] dark:text-white underline underline-offset-4 hover:opacity-65 transition-opacity"
                >
                  {SITE_PROFILE.linkedinHandle}
                </a>{' '}
                <span className="text-[#666666] dark:text-[#9A9A96]">on LinkedIn</span>
              </p>
            </div>

            <div className="pt-2 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3">
              <Link
                href="/work"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] px-5 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-85 active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <span>Explore My Work</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>

              <Link
                href="/contact"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-5 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] hover:bg-[#F7F7F6] dark:hover:bg-[#161615] active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <span>Get in Touch</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        {/* Minimal Hairline Verified Metrics Row */}
        <div className="mt-12 md:mt-16 pt-7 border-t border-[#EAEAEA] dark:border-[#222220] grid grid-cols-2 gap-6 md:gap-8 md:grid-cols-4">
          {SITE_PROFILE.heroMetrics.map((metric) => (
            <div key={metric.label} className="space-y-1">
              <p className="font-display text-[26px] font-bold uppercase tracking-tight text-[#1A1A1A] dark:text-[#F0F0EE] tabular-nums">
                {metric.value}
              </p>
              <p className="text-[12px] leading-snug text-[#666666] dark:text-[#9A9A96]">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Featured Projects — Clean Asymmetric Editorial Gallery */}
      <section className="border-t border-[#EAEAEA] dark:border-[#222220]">
        <div className="mx-auto max-w-[1200px] px-6 py-16 md:px-10 md:py-24">
          <Reveal>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-10 border-b border-[#EAEAEA] dark:border-[#222220]">
              <div className="space-y-1.5">
                <p className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
                  01. Selected Works
                </p>
                <h2 className="font-display text-[28px] sm:text-[34px] font-bold uppercase tracking-tight text-[#1A1A1A] dark:text-[#F0F0EE]">
                  Featured Projects
                </h2>
              </div>
              <Link
                href="/work"
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] underline underline-offset-4 hover:opacity-65 transition-opacity whitespace-nowrap"
              >
                <span>View all {PROJECTS.length} projects</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-14 lg:grid-cols-12">
            {featuredProjects.map((project, index) => {
              const colSpanClass =
                index === 0 || index === 3 ? 'lg:col-span-7' : 'lg:col-span-5';
              const aspectClass =
                index === 0 || index === 3
                  ? 'aspect-[16/10]'
                  : 'aspect-[4/3] lg:aspect-[5/4]';

              return (
                <Reveal key={project.id} delay={index * 0.04} className={colSpanClass}>
                  <ProjectCard
                    project={project}
                    aspectClass={aspectClass}
                    priority={index < 2}
                  />
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. About Introduction */}
      <section className="border-t border-[#EAEAEA] dark:border-[#222220] bg-[#FAFAFA] dark:bg-[#111110]">
        <div className="mx-auto max-w-[1200px] px-6 py-16 md:px-10 md:py-24">
          <Reveal>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-4 space-y-1.5">
                <p className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
                  02. About
                </p>
                <h2 className="font-display text-[26px] sm:text-[32px] font-bold uppercase tracking-tight leading-tight text-[#1A1A1A] dark:text-[#F0F0EE]">
                  Built for utility, crafted to last.
                </h2>
              </div>

              <div className="lg:col-span-8 space-y-5">
                <p className="text-[14px] sm:text-[15px] leading-[1.8] text-[#1A1A1A] dark:text-[#F0F0EE] max-w-[64ch]">
                  {SITE_PROFILE.heroIntro}
                </p>
                <p className="text-[13px] sm:text-[13.5px] leading-[1.8] text-[#666666] dark:text-[#9A9A96] max-w-[64ch]">
                  Across full-stack Next.js platforms, mobile applications, and native Java and C++
                  systems, my focus stays consistent: understand the real workflow first, structure
                  the architecture cleanly, and deliver calm interfaces people enjoy using.
                </p>
                <div className="pt-1">
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] underline underline-offset-4 hover:opacity-65 transition-opacity"
                  >
                    <span>Read full background &amp; philosophy</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 4. Technology & Skills */}
      <section
        id="skills"
        className="scroll-mt-24 border-t border-[#EAEAEA] dark:border-[#222220] bg-[#F7F7F5] dark:bg-[#0E0E0D]"
      >
        <div className="mx-auto max-w-[1200px] px-6 py-16 md:px-10 md:py-24">
          <Reveal>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 pb-10">
              <div className="lg:col-span-5 space-y-1.5">
                <p className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
                  03. Capabilities
                </p>
                <h2 className="font-display text-[28px] sm:text-[34px] font-bold uppercase tracking-tight text-[#1A1A1A] dark:text-[#F0F0EE]">
                  What I Build With
                </h2>
              </div>
              <div className="lg:col-span-7 flex items-end">
                <p className="text-[13px] leading-relaxed text-[#666666] dark:text-[#9A9A96] max-w-[58ch]">
                  Technologies verified across live deployments, academic software engineering
                  systems, and public repositories.
                </p>
              </div>
            </div>
          </Reveal>

          <SkillShowcase categories={SKILL_CATEGORIES} />
        </div>
      </section>

      {/* 5. Experience — Sticky Role Index & Scrollable Cards */}
      <section
        id="experience"
        className="scroll-mt-24 border-t border-[#EAEAEA] dark:border-[#222220]"
      >
        <div className="mx-auto max-w-[1200px] px-6 py-16 md:px-10 md:py-24">
          <ExperienceShowcase items={EXPERIENCES} showAboutLink />
        </div>
      </section>

      {/* 5.5 Live Blog Dispatches from Telegram (@abysiniyatech) */}
      <TelegramBlogPreview />

      {/* 6. Minimal Closing Contact CTA */}
      <section className="border-t border-[#EAEAEA] dark:border-[#222220] bg-[#141414] text-[#F0F0EE]">
        <div className="mx-auto max-w-[1200px] px-6 py-20 md:px-10 md:py-24">
          <Reveal>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8 space-y-3">
                <p className="text-[11px] font-mono text-[#9A9A96]">06. Collaboration</p>
                <h2 className="font-display text-[30px] sm:text-[40px] font-bold uppercase leading-[1.02] tracking-tight text-white">
                  Have a product or problem worth building?
                </h2>
                <p className="max-w-[54ch] text-[13.5px] leading-relaxed text-[#A3A39E]">
                  {SITE_PROFILE.availabilityNote}
                </p>
              </div>
              <div className="lg:col-span-4 flex flex-wrap lg:justify-end gap-3">
                <Link
                  href="/contact"
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-[12px] font-medium text-[#0A0A0A] hover:opacity-85 transition-opacity whitespace-nowrap"
                >
                  <span>Start a Conversation</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                <a
                  href={`mailto:${SITE_PROFILE.email}`}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/25 px-4 text-[12px] font-medium text-white hover:border-white transition-colors whitespace-nowrap"
                >
                  <span>Email Directly</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
