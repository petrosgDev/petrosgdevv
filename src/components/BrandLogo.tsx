import { SITE_PROFILE } from '@/data/portfolio';

interface BrandLogoProps {
  size?: 'sm' | 'md';
  className?: string;
}

export function BrandLogo({ size = 'md', className = '' }: BrandLogoProps) {
  const sizeClass = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden ${sizeClass} ${className}`}
    >
      <img
        src={SITE_PROFILE.logoSrc}
        alt={`${SITE_PROFILE.brand} logo`}
        referrerPolicy="no-referrer"
        className="h-full w-full object-cover object-[50%_32%] scale-[1.22] brightness-[1.08] contrast-[1.28] mix-blend-multiply dark:invert dark:mix-blend-screen select-none"
      />
    </span>
  );
}
