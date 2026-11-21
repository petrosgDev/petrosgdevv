'use client';

import { SITE_PROFILE } from '@/data/portfolio';
import { ContactForm } from '@/components/ContactForm';

export function ContactView() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 md:px-10 md:py-16">
      <header className="pb-12 border-b border-[#EAEAEA] dark:border-[#222220]">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8 space-y-2.5">
            <p className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
              Contact · {SITE_PROFILE.location}
            </p>
            <h1 className="font-display text-[2.4rem] sm:text-[3.1rem] font-extrabold uppercase leading-[0.98] tracking-[-0.01em] text-[#1A1A1A] dark:text-[#F0F0EE]">
              Get in Touch.
            </h1>
          </div>
          <div className="lg:col-span-4">
            <p className="text-[13px] leading-[1.75] text-[#666666] dark:text-[#9A9A96]">
              {SITE_PROFILE.availabilityNote}
            </p>
          </div>
        </div>
      </header>

      <ContactForm />
    </div>
  );
}
