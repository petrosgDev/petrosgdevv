'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import { usePortfolio } from '@/components/PortfolioContext';
import { formatLiveHost } from '@/lib/portfolioLogic';
import type { ExperienceItem } from '@/data/portfolio';

function isEducationOrCert(item: ExperienceItem): boolean {
  if (
    item.id === 'software-engineering-education' ||
    item.id === 'insa-summer-camp'
  ) {
    return true;
  }
  const combined = `${item.role} ${item.organization}`.toLowerCase();
  return /\bb\.?sc\b|university|certified|summer camp/i.test(combined);
}

export function ResumeView() {
  const { data } = usePortfolio();
  const { EXPERIENCES, PROJECTS, SITE_PROFILE, SKILL_CATEGORIES } = data;
  const [copiedEmail, setCopiedEmail] = useState(false);

  const careerExperiences = EXPERIENCES.filter((item) => !isEducationOrCert(item));
  const educationAndCerts = EXPERIENCES.filter((item) => isEducationOrCert(item));

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SITE_PROFILE.email);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 2200);
    } catch {
      // Fallback: ignore if clipboard API unavailable
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const cleanPhoneHref = SITE_PROFILE.phoneDisplay.replace(/[^+\d]/g, '');

  return (
    <div className="mx-auto max-w-[960px] px-4 sm:px-6 md:px-10 pt-24 pb-24 print:max-w-none print:px-0 print:pt-0 print:pb-0">
      {/* Top Action Bar (hidden when printing to PDF) */}
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[12px] font-mono uppercase tracking-[0.12em] text-[#666666] dark:text-[#9A9A96] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to Portfolio</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => void handleCopyEmail()}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-3.5 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors cursor-pointer"
          >
            {copiedEmail ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                <span>Email Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 opacity-75" aria-hidden="true" />
                <span>Copy Email</span>
              </>
            )}
          </button>

          <Link
            href="/contact"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-3.5 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors"
          >
            <span>Contact</span>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-75" aria-hidden="true" />
          </Link>

          <button
            type="button"
            onClick={handlePrintPdf}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] px-4 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-85 transition-opacity cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Save PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Executive Architectural Resume Sheet */}
      <article
        aria-label={`Resume of ${SITE_PROFILE.fullName}`}
        className="rounded-2xl border border-[#EAEAEA] dark:border-[#222220] bg-white dark:bg-[#111110] p-6 sm:p-10 md:p-12 shadow-[0_12px_40px_rgba(0,0,0,0.03)] dark:shadow-none print:rounded-none print:border-0 print:bg-white print:p-0 print:shadow-none"
      >
        {/* Document Header */}
        <div className="border-b border-[#1A1A1A] dark:border-[#F0F0EE]/30 pb-6 print:border-[#111111] print:pb-4">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[#666666] dark:text-[#9A9A96] print:text-[#444444]">
            {SITE_PROFILE.role} · Full-Stack &amp; Systems Engineering
          </p>
          <h1 className="mt-1.5 font-display text-[36px] sm:text-[46px] font-extrabold uppercase tracking-tight leading-[0.95] text-[#1A1A1A] dark:text-[#F0F0EE] print:text-[32px] print:text-[#111111]">
            {SITE_PROFILE.fullName}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-[#454542] dark:text-[#C8C8C4] print:text-[11px] print:text-[#333333]">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 opacity-65 print:hidden" aria-hidden="true" />
              <span>{SITE_PROFILE.location}</span>
            </span>
            <span aria-hidden="true" className="opacity-35">·</span>
            <a
              href={`tel:${cleanPhoneHref}`}
              className="inline-flex items-center gap-1.5 hover:text-[#1A1A1A] dark:hover:text-white transition-colors tabular-nums"
            >
              <Phone className="h-3.5 w-3.5 opacity-65 print:hidden" aria-hidden="true" />
              <span>{SITE_PROFILE.phoneDisplay}</span>
            </a>
            <span aria-hidden="true" className="opacity-35">·</span>
            <a
              href={`mailto:${SITE_PROFILE.email}`}
              className="inline-flex items-center gap-1.5 underline underline-offset-4 decoration-black/25 dark:decoration-white/25 hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
            >
              <Mail className="h-3.5 w-3.5 opacity-65 print:hidden" aria-hidden="true" />
              <span>{SITE_PROFILE.email}</span>
            </a>
            <span aria-hidden="true" className="opacity-35">·</span>
            <a
              href={SITE_PROFILE.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 decoration-black/25 dark:decoration-white/25 hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
            >
              GitHub ({SITE_PROFILE.githubHandle})
            </a>
            <span aria-hidden="true" className="opacity-35">·</span>
            <a
              href={SITE_PROFILE.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 decoration-black/25 dark:decoration-white/25 hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
            >
              LinkedIn ({SITE_PROFILE.linkedinHandle})
            </a>
          </div>
        </div>

        {/* 01 · Profile */}
        <section className="mt-7 space-y-2.5 print:mt-5">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#666666] dark:text-[#9A9A96] border-b border-[#EAEAEA] dark:border-[#222220] pb-1.5 print:text-[#444444]">
            01 · Profile
          </h2>
          <p className="text-[13.5px] leading-[1.72] text-[#2A2A2A] dark:text-[#D4D4D0] print:text-[11.5px] print:leading-[1.55] print:text-[#222222]">
            {SITE_PROFILE.heroIntro} {SITE_PROFILE.shortPhilosophy}
          </p>
        </section>

        {/* 02 · Experience */}
        {careerExperiences.length > 0 ? (
          <section className="mt-8 space-y-5 print:mt-5 print:space-y-3.5">
            <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#666666] dark:text-[#9A9A96] border-b border-[#EAEAEA] dark:border-[#222220] pb-1.5 print:text-[#444444]">
              02 · Experience
            </h2>

            <div className="space-y-6 print:space-y-4">
              {careerExperiences.map((exp) => (
                <div key={exp.id} className="break-inside-avoid space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <h3 className="text-[15px] font-bold text-[#1A1A1A] dark:text-[#F0F0EE] print:text-[13px] print:text-[#111111]">
                        {exp.role}
                      </h3>
                      <span className="text-[13px] font-medium text-[#52524E] dark:text-[#B5B5B0] print:text-[12px] print:text-[#444444]">
                        — {exp.organization}
                      </span>
                      {exp.organizationUrl ? (
                        <a
                          href={exp.organizationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 font-mono text-[11px] text-[#666666] dark:text-[#9A9A96] underline underline-offset-2 hover:text-[#1A1A1A] dark:hover:text-white"
                        >
                          <span>{exp.organizationUrlLabel || formatLiveHost(exp.organizationUrl)}</span>
                          <ArrowUpRight className="h-3 w-3 print:hidden" aria-hidden="true" />
                        </a>
                      ) : null}
                    </div>

                    <p className="font-mono text-[11.5px] text-[#666666] dark:text-[#9A9A96] tabular-nums shrink-0 print:text-[10.5px] print:text-[#444444]">
                      {exp.period} · {exp.location}
                    </p>
                  </div>

                  <p className="text-[13px] leading-[1.65] text-[#454542] dark:text-[#C8C8C4] print:text-[11px] print:leading-[1.5] print:text-[#222222]">
                    {exp.summary}
                  </p>

                  <ul className="space-y-1.5 pl-4 print:space-y-1">
                    {exp.points.map((pt, pIdx) => (
                      <li
                        key={`${exp.id}-pt-${pIdx}`}
                        className="relative pl-3 text-[12.5px] leading-[1.62] text-[#52524E] dark:text-[#B5B5B0] print:text-[10.5px] print:leading-[1.45] print:text-[#222222]"
                      >
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-[0.58em] h-1 w-1 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] print:bg-[#111111]"
                        />
                        {pt.lead ? (
                          <strong className="font-semibold text-[#1A1A1A] dark:text-[#F0F0EE] print:text-[#111111]">
                            {pt.lead}{' '}
                          </strong>
                        ) : null}
                        <span>{pt.text}</span>
                      </li>
                    ))}
                  </ul>

                  {exp.stack.length > 0 ? (
                    <p className="font-mono text-[11px] text-[#666666] dark:text-[#9A9A96] print:text-[10px] print:text-[#555555]">
                      Stack: {exp.stack.join(' · ')}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* 03 · Selected Engineering & AI Projects */}
        <section className="mt-8 space-y-4 print:mt-5 print:space-y-3">
          <div className="flex items-center justify-between border-b border-[#EAEAEA] dark:border-[#222220] pb-1.5">
            <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#666666] dark:text-[#9A9A96] print:text-[#444444]">
              03 · Selected Projects ({String(PROJECTS.length).padStart(2, '0')})
            </h2>
            <Link
              href="/work"
              className="no-print inline-flex items-center gap-1 font-mono text-[11px] text-[#666666] dark:text-[#9A9A96] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
            >
              <span>Full Archive</span>
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 print:grid-cols-2 print:gap-x-6 print:gap-y-2.5">
            {PROJECTS.map((project) => (
              <div key={project.id} className="break-inside-avoid space-y-1">
                <div className="flex items-baseline justify-between gap-2">
                  <Link
                    href={`/work/${project.slug}`}
                    className="group inline-flex items-center gap-1 text-[13.5px] font-bold text-[#1A1A1A] dark:text-[#F0F0EE] hover:underline underline-offset-4 print:text-[11.5px] print:text-[#111111]"
                  >
                    <span>{project.title}</span>
                    <ArrowUpRight
                      className="no-print h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity"
                      aria-hidden="true"
                    />
                  </Link>
                  <span className="font-mono text-[10.5px] text-[#666666] dark:text-[#9A9A96] shrink-0 print:text-[9.5px] print:text-[#555555]">
                    {project.category} · {project.year}
                  </span>
                </div>
                <p className="text-[12.5px] leading-[1.55] text-[#52524E] dark:text-[#B5B5B0] print:text-[10.5px] print:leading-[1.4] print:text-[#222222]">
                  {project.subtitle}
                </p>
                <p className="font-mono text-[10.5px] text-[#666666] dark:text-[#9A9A96] print:text-[9.5px] print:text-[#555555]">
                  {project.technologies.slice(0, 5).join(' · ')}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 04 · Education & Certifications */}
        {educationAndCerts.length > 0 ? (
          <section className="mt-8 space-y-4 print:mt-5 print:space-y-3">
            <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#666666] dark:text-[#9A9A96] border-b border-[#EAEAEA] dark:border-[#222220] pb-1.5 print:text-[#444444]">
              04 · Education &amp; Certifications
            </h2>

            <div className="space-y-4 print:space-y-3">
              {educationAndCerts.map((item) => (
                <div key={item.id} className="break-inside-avoid space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <h3 className="text-[14.5px] font-bold text-[#1A1A1A] dark:text-[#F0F0EE] print:text-[12px] print:text-[#111111]">
                        {item.role}
                      </h3>
                      <span className="text-[13px] font-medium text-[#52524E] dark:text-[#B5B5B0] print:text-[11.5px] print:text-[#444444]">
                        — {item.organization}
                      </span>
                      {item.organizationUrl ? (
                        <a
                          href={item.organizationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 font-mono text-[11px] text-[#666666] dark:text-[#9A9A96] underline underline-offset-2 hover:text-[#1A1A1A] dark:hover:text-white"
                        >
                          <span>{item.organizationUrlLabel || formatLiveHost(item.organizationUrl)}</span>
                          <ArrowUpRight className="h-3 w-3 print:hidden" aria-hidden="true" />
                        </a>
                      ) : null}
                    </div>

                    <p className="font-mono text-[11.5px] text-[#666666] dark:text-[#9A9A96] tabular-nums shrink-0 print:text-[10.5px] print:text-[#444444]">
                      {item.period} · {item.location}
                    </p>
                  </div>

                  <p className="text-[12.5px] leading-[1.6] text-[#454542] dark:text-[#C8C8C4] print:text-[10.5px] print:leading-[1.45] print:text-[#222222]">
                    {item.summary}
                  </p>
                  <p className="font-mono text-[11px] text-[#666666] dark:text-[#9A9A96] print:text-[10px] print:text-[#555555]">
                    Focus: {item.stack.join(' · ')}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* 05 · Technical Skills */}
        <section className="mt-8 space-y-3.5 print:mt-5 print:space-y-2.5">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#666666] dark:text-[#9A9A96] border-b border-[#EAEAEA] dark:border-[#222220] pb-1.5 print:text-[#444444]">
            05 · Technical Skills
          </h2>

          <div className="space-y-2 print:space-y-1.5">
            {SKILL_CATEGORIES.map((category) => (
              <div
                key={category.id}
                className="grid grid-cols-1 sm:grid-cols-[180px_minmax(0,1fr)] gap-1 sm:gap-4 items-baseline text-[12.5px] print:grid-cols-[150px_minmax(0,1fr)] print:text-[11px]"
              >
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-[#1A1A1A] dark:text-[#F0F0EE] print:text-[10px] print:text-[#111111]">
                  {category.name}:
                </span>
                <span className="text-[#454542] dark:text-[#C8C8C4] leading-[1.6] print:text-[#222222]">
                  {category.items.join(' · ')}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 06 · Key Highlights */}
        <section className="mt-8 border-t border-[#EAEAEA] dark:border-[#222220] pt-5 print:mt-5 print:pt-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:grid-cols-4">
            {SITE_PROFILE.heroMetrics.map((metric) => (
              <div key={metric.label} className="space-y-0.5">
                <p className="font-display text-[20px] font-bold uppercase tracking-tight text-[#1A1A1A] dark:text-[#F0F0EE] tabular-nums print:text-[16px] print:text-[#111111]">
                  {metric.value}
                </p>
                <p className="text-[11px] text-[#666666] dark:text-[#9A9A96] print:text-[9.5px] print:text-[#555555]">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
