import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { PROJECTS, SITE_PROFILE } from '@/data/portfolio';
import { WorkGallery } from '@/components/WorkGallery';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Explore software engineering case studies by Petros Geto across web applications, brand & hospitality websites, native desktop systems, and mobile apps.',
};

export default function WorkPage() {
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
              Work &amp; Case Studies
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

      <WorkGallery />

      {/* GitHub Archive Link */}
      <section className="mt-8 pt-10 border-t border-[#EAEAEA] dark:border-[#222220] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="font-display text-[22px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
            Additional Repositories &amp; Experiments
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
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-5 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors whitespace-nowrap shrink-0"
        >
          <span>View GitHub Repositories</span>
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </section>
    </div>
  );
}
