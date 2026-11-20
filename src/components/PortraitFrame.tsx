import { EditorialImage } from '@/components/EditorialImage';

interface PortraitFrameProps {
  src: string;
  alt: string;
  fallbackTitle: string;
  priority?: boolean;
  size?: 'hero' | 'about';
}

export function PortraitFrame({
  src,
  alt,
  fallbackTitle,
  priority = false,
  size = 'hero',
}: PortraitFrameProps) {
  const sizeClass =
    size === 'hero'
      ? 'max-w-[270px] sm:max-w-[330px] lg:max-w-[395px]'
      : 'max-w-[250px] sm:max-w-[310px] lg:max-w-[360px]';

  return (
    <div
      data-testid="portrait-frame"
      className={`relative w-full ${sizeClass} aspect-[1/1.03] overflow-hidden rounded-2xl border-[1.5px] border-[#1A1A1A]/15 dark:border-white/[0.14] bg-gradient-to-b from-[#F9F9F7] via-[#F2F2EE] to-[#E8E8E3] dark:from-[#1C1C1A] dark:via-[#141413] dark:to-[#0C0C0B] shadow-[6px_6px_0_0_rgba(26,26,26,0.08)] dark:shadow-[6px_6px_0_0_rgba(255,255,255,0.06)] flex items-end justify-center`}
    >
      {/* Subtle Architectural Dot Backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(26,26,26,0.09)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(ellipse_80%_72%_at_50%_40%,black_25%,transparent_80%)]"
      />

      {/* Soft Studio Rim Backlight for Clean Light & Dark Mode Separation */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.92),transparent_68%)] dark:bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.11),transparent_62%)]"
      />

      {/* Portrait Anchored Flush Edge-to-Edge at Bottom & Sides */}
      <div className="relative z-10 h-full w-full flex items-end justify-center pt-4 sm:pt-5">
        <EditorialImage
          src={src}
          alt={alt}
          fallbackTitle={fallbackTitle}
          priority={priority}
          fit="contain"
          transparentBg
          className="h-full w-full flex items-end justify-center"
          imgClassName="w-full h-auto max-h-full object-contain object-bottom drop-shadow-[0_10px_22px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_14px_28px_rgba(0,0,0,0.5)]"
        />
      </div>

      {/* Hairline Inner Frame Polish */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/[0.04] dark:ring-white/[0.05]"
      />
    </div>
  );
}
