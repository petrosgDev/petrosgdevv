'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { ProjectImage } from '@/data/portfolio';

interface LightboxModalProps {
  image: ProjectImage | null;
  projectTitle: string;
  onClose: () => void;
}

export function LightboxModal({ image, projectTitle, onClose }: LightboxModalProps) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!image) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [image, onClose]);

  return (
    <AnimatePresence>
      {image && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`${projectTitle} image preview`}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0C0C0B]/92 p-4 sm:p-8 backdrop-blur-sm"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="relative flex max-h-[92vh] w-full max-w-6xl flex-col gap-4"
          >
            <div className="flex items-center justify-between gap-4 text-[#F2EFE9]">
              <p className="text-sm font-medium truncate">{projectTitle}</p>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close image preview"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#F2EFE9]/25 text-[#F2EFE9] hover:bg-[#F2EFE9] hover:text-[#0C0C0B] transition-colors cursor-pointer shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#262522] bg-[#151513] flex items-center justify-center max-h-[78vh]">
              <img
                src={image.src}
                alt={image.alt}
                referrerPolicy="no-referrer"
                className="max-h-[76vh] w-auto max-w-full object-contain"
              />
            </div>

            <p className="text-xs text-[#A19E96]">{image.caption}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
