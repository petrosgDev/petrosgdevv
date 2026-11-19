import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { SITE_PROFILE } from '../data/portfolio';
import { updatePageSeo } from '../utils/seo';
import { AppLink } from '../components/RouterContext';

export function NotFoundPage() {
  useEffect(() => {
    updatePageSeo({
      title: `Page Not Found — ${SITE_PROFILE.fullName}`,
      description: 'The requested portfolio page could not be found.',
    });
  }, []);

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-24 md:px-10 md:py-32">
      <div className="max-w-lg space-y-5">
        <p className="font-mono text-[11px] text-[#666666] dark:text-[#9A9A96]">404 · Not Found</p>
        <h1 className="font-display text-[2.4rem] sm:text-[3rem] font-extrabold uppercase tracking-tight text-[#1A1A1A] dark:text-[#F0F0EE]">
          Page Not Found.
        </h1>
        <p className="text-[13.5px] leading-[1.75] text-[#666666] dark:text-[#9A9A96]">
          The route you entered could not be matched. Return to the homepage or browse the complete
          project archive.
        </p>
        <div className="pt-2 flex flex-wrap gap-3">
          <AppLink
            to="/"
            className="inline-flex h-10 items-center gap-1.5 bg-[#1A1A1A] dark:bg-[#F0F0EE] px-4 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-80 transition-opacity whitespace-nowrap"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to Home</span>
          </AppLink>
          <AppLink
            to="/work"
            className="inline-flex h-10 items-center border border-[#EAEAEA] dark:border-[#222220] px-4 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors whitespace-nowrap"
          >
            Browse Work
          </AppLink>
        </div>
      </div>
    </section>
  );
}
