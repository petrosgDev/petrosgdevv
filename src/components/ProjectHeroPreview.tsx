'use client';

import { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import type { ProjectImage } from '@/data/portfolio';
import { EditorialImage } from '@/components/EditorialImage';
import { LightboxModal } from '@/components/LightboxModal';
import { LiveSiteFrame } from '@/components/LiveSiteFrame';

interface ProjectHeroPreviewProps {
  title: string;
  heroImage: ProjectImage;
  liveUrl?: string;
}

export function ProjectHeroPreview({ title, heroImage, liveUrl }: ProjectHeroPreviewProps) {
  const [lightboxImage, setLightboxImage] = useState<ProjectImage | null>(null);
  const isPortrait = heroImage.aspect === 'portrait';

  return (
    <>
      <section className="py-10">
        <figure className="space-y-2.5">
          {liveUrl ? (
            <LiveSiteFrame
              url={liveUrl}
              title={title}
              fallbackImage={heroImage}
              variant="hero"
              priority
              onInspectStatic={() => setLightboxImage(heroImage)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setLightboxImage(heroImage)}
              aria-label={`Open fullscreen preview of ${title}`}
              className={`group relative flex items-center justify-center w-full rounded-xl border border-black/[0.07] dark:border-white/[0.08] overflow-hidden text-left cursor-zoom-in ${
                isPortrait
                  ? 'bg-[#141413] py-10 px-6 max-h-[620px]'
                  : 'bg-[#F6F6F5] dark:bg-[#141413] p-4 sm:p-8 lg:p-10'
              }`}
            >
              <EditorialImage
                src={heroImage.src}
                alt={heroImage.alt}
                fallbackTitle={title}
                priority
                fit="contain"
                transparentBg
                className={`flex items-center justify-center ${
                  isPortrait ? 'h-[500px] w-full' : 'w-full'
                }`}
                imgClassName={`rounded-md transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.01] ${
                  isPortrait
                    ? 'max-h-[500px] w-auto shadow-lg'
                    : 'w-full h-auto max-h-[620px] object-contain border border-black/8 dark:border-white/10'
                }`}
              />
              <span className="absolute right-4 bottom-4 inline-flex items-center gap-1.5 rounded-full bg-[#1A1A1A]/85 px-3.5 py-1.5 text-[11px] font-medium text-white opacity-90 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                <Maximize2 className="h-3 w-3" aria-hidden="true" />
                <span>Inspect full view</span>
              </span>
            </button>
          )}
          <figcaption className="text-[11.5px] text-[#666666] dark:text-[#9A9A96]">
            {liveUrl
              ? `Live interactive website preview — ${heroImage.caption}`
              : heroImage.caption}
          </figcaption>
        </figure>
      </section>

      <LightboxModal
        image={lightboxImage}
        projectTitle={title}
        onClose={() => setLightboxImage(null)}
      />
    </>
  );
}
