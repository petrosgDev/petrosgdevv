'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Globe,
  Hand,
  Image as ImageIcon,
  Lock,
  Monitor,
  RotateCw,
  Smartphone,
} from 'lucide-react';
import type { ProjectImage } from '@/data/portfolio';
import { computeIframePreviewMetrics, formatLiveHost } from '@/lib/portfolioLogic';
import { EditorialImage } from '@/components/EditorialImage';

type ViewportMode = 'desktop' | 'mobile';
type DisplayMode = 'live' | 'static';

interface LiveSiteFrameProps {
  url: string;
  title: string;
  fallbackImage: ProjectImage;
  variant: 'card' | 'hero';
  href?: string;
  aspectClass?: string;
  priority?: boolean;
  onInspectStatic?: () => void;
}

export function LiveSiteFrame({
  url,
  title,
  fallbackImage,
  variant,
  href,
  aspectClass = 'aspect-[16/10]',
  priority = false,
  onInspectStatic,
}: LiveSiteFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Always mount iframes client-side after hydration so React reliably receives onLoad
  const [shouldMountIframe, setShouldMountIframe] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);
  const [interactive, setInteractive] = useState(variant === 'hero');
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('live');
  const [boxSize, setBoxSize] = useState<{ width: number; height: number }>({
    width: variant === 'hero' ? 1120 : 560,
    height: variant === 'hero' ? 630 : 350,
  });

  const displayHost = formatLiveHost(url);
  const virtualWidth = viewportMode === 'mobile' ? 390 : 1440;
  const metrics = computeIframePreviewMetrics(boxSize.width, boxSize.height, virtualWidth);

  // Mount priority/hero iframes immediately on client; lazy-mount below-the-fold cards
  useEffect(() => {
    if (shouldMountIframe) {
      return;
    }

    if (variant === 'hero' || priority) {
      setShouldMountIframe(true);
      return;
    }

    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setShouldMountIframe(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldMountIframe(true);
          observer.disconnect();
        }
      },
      { rootMargin: '420px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [priority, shouldMountIframe, variant]);

  // Safety reveal if a slow third-party subresource delays the iframe's window load event
  useEffect(() => {
    if (!shouldMountIframe || isLoaded) {
      return;
    }
    const fallbackTimer = window.setTimeout(() => {
      setIsLoaded(true);
    }, 3200);
    return () => window.clearTimeout(fallbackTimer);
  }, [shouldMountIframe, isLoaded, reloadCount, viewportMode]);

  // Measure the actual viewport slot so the 1440px / 390px virtual site scales pixel-cleanly
  useEffect(() => {
    const node = viewportRef.current;
    if (!node) {
      return;
    }

    const measure = () => {
      const rect = node.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setBoxSize((prev) => {
          const nextW = Math.round(rect.width);
          const nextH = Math.round(rect.height);
          if (prev.width === nextW && prev.height === nextH) {
            return prev;
          }
          return { width: nextW, height: nextH };
        });
      }
    };

    measure();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [viewportMode, displayMode]);

  const handleViewportChange = (nextMode: ViewportMode) => {
    if (nextMode === viewportMode) {
      return;
    }
    setIsLoaded(false);
    setViewportMode(nextMode);
  };

  const handleReload = () => {
    setIsLoaded(false);
    setReloadCount((c) => c + 1);
  };

  const isHero = variant === 'hero';
  const showLiveIframe = displayMode === 'live';

  return (
    <div
      ref={containerRef}
      data-testid={isHero ? 'live-hero-frame' : 'live-card-frame'}
      data-live-url={url}
      data-viewport-mode={viewportMode}
      className={`flex flex-col w-full rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#F5F5F3] dark:bg-[#121211] overflow-hidden transition-all duration-300 ${
        isHero
          ? 'shadow-[0_16px_44px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_44px_rgba(0,0,0,0.45)]'
          : 'group-hover:border-black/18 dark:group-hover:border-white/22 group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)] dark:group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.42)]'
      }`}
    >
      {/* Minimal Monochrome Browser Chrome */}
      <div
        className={`flex items-center justify-between gap-2 border-b border-black/[0.07] dark:border-white/[0.08] bg-[#F1F1EF] dark:bg-[#161615] px-3 ${
          isHero ? 'h-11 sm:px-4' : 'h-9'
        }`}
      >
        {/* Left: Monochrome Window Marks + Live Address */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="hidden sm:flex items-center gap-1.5 shrink-0" aria-hidden="true">
            <span className="h-2 w-2 rounded-full border border-black/22 dark:border-white/22" />
            <span className="h-2 w-2 rounded-full border border-black/22 dark:border-white/22" />
            <span className="h-2 w-2 rounded-full border border-black/22 dark:border-white/22" />
          </div>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${title} live website at ${displayHost}`}
            className="inline-flex items-center gap-1.5 min-w-0 rounded-md bg-white/80 dark:bg-black/35 border border-black/[0.06] dark:border-white/[0.08] px-2.5 py-1 text-[10.5px] font-mono text-[#4A4A48] dark:text-[#A8A8A3] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] transition-colors"
          >
            <Globe className="h-3 w-3 shrink-0 opacity-65" aria-hidden="true" />
            <span className="truncate">{displayHost}</span>
          </a>
        </div>

        {/* Right: Viewport / Interaction Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {isHero ? (
            <>
              {showLiveIframe && (
                <div
                  role="group"
                  aria-label="Preview viewport size"
                  className="inline-flex items-center rounded-md border border-black/[0.08] dark:border-white/[0.1] bg-white/70 dark:bg-black/30 p-0.5"
                >
                  <button
                    type="button"
                    onClick={() => handleViewportChange('desktop')}
                    aria-pressed={viewportMode === 'desktop'}
                    aria-label="Desktop viewport preview"
                    className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[10.5px] font-medium transition-colors cursor-pointer ${
                      viewportMode === 'desktop'
                        ? 'bg-[#1A1A1A] text-white dark:bg-[#F0F0EE] dark:text-[#0A0A0A]'
                        : 'text-[#666666] dark:text-[#9A9A96] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE]'
                    }`}
                  >
                    <Monitor className="h-3 w-3" aria-hidden="true" />
                    <span className="hidden sm:inline">Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleViewportChange('mobile')}
                    aria-pressed={viewportMode === 'mobile'}
                    aria-label="Mobile viewport preview"
                    className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[10.5px] font-medium transition-colors cursor-pointer ${
                      viewportMode === 'mobile'
                        ? 'bg-[#1A1A1A] text-white dark:bg-[#F0F0EE] dark:text-[#0A0A0A]'
                        : 'text-[#666666] dark:text-[#9A9A96] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE]'
                    }`}
                  >
                    <Smartphone className="h-3 w-3" aria-hidden="true" />
                    <span className="hidden sm:inline">Mobile</span>
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setDisplayMode((m) => (m === 'live' ? 'static' : 'live'))}
                aria-label={showLiveIframe ? `Switch ${title} to static preview` : `Switch ${title} to live site`}
                className="inline-flex items-center gap-1 rounded-md border border-black/[0.08] dark:border-white/[0.1] bg-white/70 dark:bg-black/30 px-2 py-1 text-[10.5px] font-medium text-[#555555] dark:text-[#A3A39E] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] transition-colors cursor-pointer"
              >
                <ImageIcon className="h-3 w-3" aria-hidden="true" />
                <span className="hidden md:inline">{showLiveIframe ? 'Static' : 'Live Site'}</span>
              </button>

              {showLiveIframe && (
                <button
                  type="button"
                  onClick={handleReload}
                  aria-label={`Reload ${title} live preview`}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-black/[0.08] dark:border-white/[0.1] bg-white/70 dark:bg-black/30 text-[#555555] dark:text-[#A3A39E] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] transition-colors cursor-pointer"
                >
                  <RotateCw className="h-3 w-3" aria-hidden="true" />
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => setInteractive((prev) => !prev)}
              aria-pressed={interactive}
              aria-label={
                interactive
                  ? `Lock live preview for ${title}`
                  : `Interact with live website for ${title}`
              }
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10.5px] font-medium transition-colors cursor-pointer ${
                interactive
                  ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white dark:border-[#F0F0EE] dark:bg-[#F0F0EE] dark:text-[#0A0A0A]'
                  : 'border-black/[0.08] dark:border-white/[0.1] bg-white/75 dark:bg-black/30 text-[#555555] dark:text-[#A3A39E] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE]'
              }`}
            >
              {interactive ? (
                <>
                  <Lock className="h-2.5 w-2.5" aria-hidden="true" />
                  <span>Done</span>
                </>
              ) : (
                <>
                  <Hand className="h-2.5 w-2.5" aria-hidden="true" />
                  <span>Interact</span>
                </>
              )}
            </button>
          )}

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${title} in a new tab`}
            className={`inline-flex items-center justify-center rounded-md border border-black/[0.08] dark:border-white/[0.1] bg-white/75 dark:bg-black/30 text-[#555555] dark:text-[#A3A39E] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] transition-colors ${
              isHero ? 'h-7 px-2 gap-1 text-[10.5px] font-medium' : 'h-6 w-6'
            }`}
          >
            {isHero && <span className="hidden sm:inline">Open</span>}
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Live Website Canvas / Static Preview */}
      {showLiveIframe ? (
        <div
          className={`relative w-full overflow-hidden bg-[#EAEAE6] dark:bg-[#0D0D0C] ${
            isHero
              ? viewportMode === 'mobile'
                ? 'h-[620px] sm:h-[680px] flex items-center justify-center py-4 sm:py-6 px-3'
                : 'h-[420px] sm:h-[540px] lg:h-[640px]'
              : aspectClass
          }`}
        >
          <div
            ref={viewportRef}
            className={`relative overflow-hidden bg-white dark:bg-[#0B0B0A] ${
              isHero && viewportMode === 'mobile'
                ? 'h-full w-full max-w-[390px] rounded-lg border border-black/[0.12] dark:border-white/[0.14] shadow-lg'
                : 'h-full w-full'
            }`}
          >
            {/* Instant backdrop screenshot while the live site hydrates underneath */}
            <div
              className={`absolute inset-0 transition-opacity duration-500 ${
                isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
              aria-hidden={isLoaded}
            >
              <EditorialImage
                src={fallbackImage.src}
                alt={fallbackImage.alt}
                fallbackTitle={title}
                priority={priority || isHero}
                fit="cover"
                className="h-full w-full"
                imgClassName="h-full w-full object-cover object-top"
              />
              <div className="absolute right-2.5 bottom-2.5 rounded bg-[#141413]/80 px-2 py-0.5 text-[10px] font-mono tracking-[0.04em] text-white/90 backdrop-blur-sm">
                Loading live frame
              </div>
            </div>

            {/* Real Scaled Live Website Iframe */}
            {shouldMountIframe && (
              <iframe
                key={`${url}-${reloadCount}-${viewportMode}`}
                src={url}
                title={`${title} live website preview`}
                loading={isHero ? 'eager' : 'lazy'}
                referrerPolicy="no-referrer"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                onLoad={() => setIsLoaded(true)}
                style={{
                  width: `${metrics.iframeWidth}px`,
                  height: `${metrics.iframeHeight}px`,
                  transform: `scale(${metrics.scale})`,
                  transformOrigin: 'top left',
                }}
                className={`absolute top-0 left-0 border-0 bg-white transition-opacity duration-500 ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                } ${interactive ? 'pointer-events-auto' : 'pointer-events-none'}`}
              />
            )}

            {/* Card Click Overlay (active only when locked so clicking opens Case Study cleanly) */}
            {!isHero && !interactive && href && (
              <Link
                href={href}
                aria-label={`View ${title} case study`}
                className="absolute inset-0 z-10 flex items-end justify-end p-3 bg-transparent transition-colors duration-300 group-hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-[#F0F0EE]"
              >
                <span className="inline-flex items-center gap-1 rounded-md bg-[#111110]/85 px-2.5 py-1 text-[10.5px] font-medium text-white opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 backdrop-blur-sm">
                  <span>Case Study</span>
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onInspectStatic}
          aria-label={`Open fullscreen screenshot of ${title}`}
          className="group relative flex items-center justify-center w-full bg-[#F6F6F5] dark:bg-[#141413] p-4 sm:p-8 lg:p-10 text-left cursor-zoom-in"
        >
          <EditorialImage
            src={fallbackImage.src}
            alt={fallbackImage.alt}
            fallbackTitle={title}
            priority
            fit="contain"
            transparentBg
            className="w-full flex items-center justify-center"
            imgClassName="w-full h-auto max-h-[600px] object-contain rounded-md border border-black/8 dark:border-white/10"
          />
        </button>
      )}
    </div>
  );
}
