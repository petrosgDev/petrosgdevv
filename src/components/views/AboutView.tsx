'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import {
  EXPERIENCES,
  PHILOSOPHY_PILLARS,
  SITE_PROFILE,
  SKILL_CATEGORIES,
  TECHNICAL_INTERESTS,
} from '@/data/portfolio';
import { EditorialImage } from '@/components/EditorialImage';
import { ExperienceShowcase } from '@/components/ExperienceShowcase';
import { Reveal } from '@/components/Reveal';
import { SkillShowcase } from '@/components/SkillShowcase';

export function AboutView() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 md:px-10 md:py-16">
      {/* Header & Left-Side Borderless Portrait */}
      <section className="grid grid-cols-1 gap-8 md:gap-12 pb-14 md:pb-16 border-b border-[#EAEAEA] dark:border-[#222220] lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5 flex justify-center lg:justify-start">
          <EditorialImage
            src={SITE_PROFILE.portraitSrc}
            alt={`Portrait of ${SITE_PROFILE.fullName}`}
            fallbackTitle={SITE_PROFILE.fullName}
            priority
            fit="contain"
            transparentBg
            className="w-full max-w-[260px] sm:max-w-[320px] lg:max-w-[360px]"
            imgClassName="w-full h-auto object-contain"
          />
        </div>

        <div className="lg:col-span-7 space-y-5">
          <p className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
            About · {SITE_PROFILE.location}
          </p>
          <h1 className="font-display text-[2.4rem] sm:text-[3rem] font-extrabold uppercase leading-[0.98] tracking-[-0.01em] text-[#1A1A1A] dark:text-[#F0F0EE]">
            {SITE_PROFILE.fullName}.
          </h1>
          <p className="text-[13.5px] sm:text-[14px] leading-[1.85] text-[#1A1A1A] dark:text-[#F0F0EE] max-w-[54ch]">
            {SITE_PROFILE.heroIntro}
          </p>
          <p className="text-[13px] sm:text-[13.5px] leading-[1.8] text-[#666666] dark:text-[#9A9A96] max-w-[54ch]">
            Based in <em className="italic">{SITE_PROFILE.location}</em>, I work across the
            stack—shipping production web platforms in Next.js and Node.js, cross-platform mobile
            interfaces in Flutter and React Native, and foundational computer science desktop
            applications in Java and C++.
          </p>

          <div className="pt-2 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] px-5 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-85 transition-opacity whitespace-nowrap"
            >
              <span>Get in Touch</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <Link
              href="/work"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-5 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors whitespace-nowrap"
            >
              <span>Explore Work</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Development Philosophy */}
      <section className="py-16 border-b border-[#EAEAEA] dark:border-[#222220]">
        <Reveal>
          <div className="mb-10 space-y-1.5">
            <p className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
              01. Development Philosophy
            </p>
            <h2 className="font-display text-[26px] sm:text-[32px] font-bold uppercase tracking-tight text-[#1A1A1A] dark:text-[#F0F0EE]">
              How I Approach Software
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {PHILOSOPHY_PILLARS.map((pillar, idx) => (
            <Reveal key={pillar.index} delay={idx * 0.04}>
              <div className="pt-5 border-t border-[#EAEAEA] dark:border-[#222220] space-y-2.5">
                <span className="font-mono text-[11px] text-[#666666] dark:text-[#9A9A96] tabular-nums">
                  {pillar.index}
                </span>
                <h3 className="text-[15px] font-semibold text-[#1A1A1A] dark:text-[#F0F0EE]">
                  {pillar.title}
                </h3>
                <p className="text-[13px] leading-[1.75] text-[#666666] dark:text-[#9A9A96]">
                  {pillar.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Technical Interests */}
      <section className="py-16 border-b border-[#EAEAEA] dark:border-[#222220]">
        <Reveal>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4 space-y-1.5">
              <p className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
                02. Technical Interests
              </p>
              <h2 className="font-display text-[26px] sm:text-[32px] font-bold uppercase tracking-tight text-[#1A1A1A] dark:text-[#F0F0EE]">
                Areas of Focus
              </h2>
            </div>

            <div className="lg:col-span-8 divide-y divide-[#EAEAEA] dark:divide-[#222220]">
              {TECHNICAL_INTERESTS.map((interest) => (
                <div key={interest.title} className="py-5 first:pt-0 last:pb-0 space-y-1.5">
                  <h3 className="text-[15px] font-semibold text-[#1A1A1A] dark:text-[#F0F0EE]">
                    {interest.title}
                  </h3>
                  <p className="text-[13px] leading-[1.75] text-[#666666] dark:text-[#9A9A96] max-w-[62ch]">
                    {interest.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* Core Technologies */}
      <section className="py-16 border-b border-[#EAEAEA] dark:border-[#222220]">
        <Reveal>
          <div className="mb-10 space-y-1.5">
            <p className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
              03. Verified Skills
            </p>
            <h2 className="font-display text-[26px] sm:text-[32px] font-bold uppercase tracking-tight text-[#1A1A1A] dark:text-[#F0F0EE]">
              Core Technologies
            </h2>
          </div>
        </Reveal>

        <SkillShowcase categories={SKILL_CATEGORIES} />
      </section>

      {/* Experience */}
      <section className="py-16 border-b border-[#EAEAEA] dark:border-[#222220]">
        <ExperienceShowcase
          items={EXPERIENCES}
          idPrefix="about-exp"
          eyebrow="04. Experience"
          heading="Where I've Been"
        />
      </section>

      {/* Looking Ahead */}
      <section className="pt-14">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8 space-y-2.5">
            <p className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
              05. Looking Ahead
            </p>
            <h2 className="font-display text-[26px] sm:text-[32px] font-bold uppercase tracking-tight text-[#1A1A1A] dark:text-[#F0F0EE]">
              Applied AI &amp; Full-Stack Product Delivery
            </h2>
            <p className="text-[13px] leading-[1.75] text-[#666666] dark:text-[#9A9A96] max-w-[60ch]">
              My goal is to collaborate on ambitious software products where thoughtful product
              architecture, reliable backend systems, and applied AI solve meaningful local and
              global challenges.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-wrap lg:justify-end gap-3">
            <Link
              href="/work"
              className="inline-flex h-10 items-center rounded-full border border-black/[0.12] dark:border-white/[0.14] px-5 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors whitespace-nowrap"
            >
              Explore Work
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] px-5 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-85 transition-opacity whitespace-nowrap"
            >
              <span>Start a Conversation</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
