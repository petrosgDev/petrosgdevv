import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { ProjectItem } from '@/data/portfolio';
import { EditorialImage } from '@/components/EditorialImage';
import { LiveSiteFrame } from '@/components/LiveSiteFrame';

interface ProjectCardProps {
  project: ProjectItem;
  aspectClass?: string;
  priority?: boolean;
}

export function ProjectCard({
  project,
  aspectClass = 'aspect-[16/10]',
  priority = false,
}: ProjectCardProps) {
  const isPortrait = project.heroImage.aspect === 'portrait';

  return (
    <article className="group flex flex-col">
      {project.liveUrl ? (
        <LiveSiteFrame
          url={project.liveUrl}
          title={project.title}
          fallbackImage={project.heroImage}
          variant="card"
          href={`/work/${project.slug}`}
          aspectClass={aspectClass}
          priority={priority}
        />
      ) : (
        /* Clean Modern Minimalist Studio Matte Frame for Desktop & Mobile Native Apps */
        <Link
          href={`/work/${project.slug}`}
          aria-label={`View ${project.title} case study`}
          className={`flex items-center justify-center w-full rounded-xl border border-black/[0.07] dark:border-white/[0.08] overflow-hidden transition-all duration-300 group-hover:border-black/15 dark:group-hover:border-white/20 group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] dark:group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)] ${
            isPortrait
              ? 'bg-[#141413] p-5 sm:p-7'
              : 'bg-[#F6F6F5] dark:bg-[#141413] p-4 sm:p-6'
          } ${aspectClass}`}
        >
          <EditorialImage
            src={project.heroImage.src}
            alt={project.heroImage.alt}
            fallbackTitle={project.title}
            priority={priority}
            fit="contain"
            transparentBg
            className="h-full w-full flex items-center justify-center"
            imgClassName={`max-h-full max-w-full w-auto h-auto rounded-md transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02] ${
              isPortrait
                ? 'shadow-lg'
                : 'border border-black/8 dark:border-white/10'
            }`}
          />
        </Link>
      )}

      {/* Quiet Small-Font Minimalist Metadata */}
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4 text-[11px] text-[#666666] dark:text-[#9A9A96]">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="truncate">{project.category}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums shrink-0">{project.year}</span>
          </div>
          <span className="shrink-0">{project.status}</span>
        </div>

        <h3 className="font-display text-[22px] sm:text-[24px] font-bold uppercase tracking-[0.01em] leading-tight text-[#1A1A1A] dark:text-[#F0F0EE]">
          <Link
            href={`/work/${project.slug}`}
            className="hover:opacity-65 transition-opacity"
          >
            {project.title}
          </Link>
        </h3>

        <p className="text-[13px] leading-[1.65] text-[#666666] dark:text-[#9A9A96] max-w-[58ch]">
          {project.summary}
        </p>

        <p className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
          {project.technologies.join(' / ')}
        </p>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-5 gap-y-2 pt-2.5 border-t border-[#EAEAEA] dark:border-[#222220] text-[12px]">
          <Link
            href={`/work/${project.slug}`}
            className="inline-flex items-center gap-1 font-medium text-[#1A1A1A] dark:text-[#F0F0EE] underline underline-offset-4 hover:opacity-65 transition-opacity whitespace-nowrap"
          >
            <span>Case Study</span>
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </Link>

          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#666666] dark:text-[#9A9A96] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] transition-colors whitespace-nowrap"
            >
              <span>Live Site</span>
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </a>
          )}

          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#666666] dark:text-[#9A9A96] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] transition-colors whitespace-nowrap"
            >
              <span>GitHub</span>
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
