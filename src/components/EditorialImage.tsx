import { useState } from 'react';

interface EditorialImageProps {
  src: string;
  alt: string;
  fallbackTitle: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  fit?: 'cover' | 'contain';
  transparentBg?: boolean;
}

export function EditorialImage({
  src,
  alt,
  fallbackTitle,
  className = '',
  imgClassName = '',
  priority = false,
  fit = 'cover',
  transparentBg = false,
}: EditorialImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-[#EFECE5] dark:bg-[#151513] p-8 text-center ${className}`}
      >
        <div className="space-y-2">
          <p className="font-serif text-xl text-[#141413] dark:text-[#F2EFE9]">
            {fallbackTitle}
          </p>
          <p className="text-xs text-[#5A5955] dark:text-[#A19E96]">
            Visual preview unavailable
          </p>
        </div>
      </div>
    );
  }

  const bgClass = transparentBg ? 'bg-transparent' : 'bg-[#EFECE5] dark:bg-[#151513]';

  return (
    <div className={`relative overflow-hidden ${bgClass} ${className}`}>
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${
          fit === 'contain'
            ? 'max-h-full max-w-full object-contain'
            : 'h-full w-full object-cover object-top'
        } ${imgClassName}`}
      />
    </div>
  );
}
