'use client';

import Link from 'next/link';
import { ArrowUp, ArrowUpRight, Lock } from 'lucide-react';
import { usePortfolio } from '@/components/PortfolioContext';

export function Footer() {
  const { data } = usePortfolio();
  const { NAVIGATION_LINKS, SITE_PROFILE, SOCIAL_LINKS } = data;
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[#EAEAEA] dark:border-[#222220] bg-white dark:bg-[#0A0A0A]">
      <div className="mx-auto max-w-[1200px] px-6 pt-14 pb-24 md:px-10 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-5 space-y-3">
            <Link
              href="/"
              className="inline-flex items-center font-sans text-[12px] font-semibold tracking-[0.16em] text-[#1A1A1A] dark:text-[#F0F0EE] hover:opacity-75 transition-opacity"
            >
              {SITE_PROFILE.brand}
            </Link>
            <p className="max-w-xs text-[13px] leading-relaxed text-[#666666] dark:text-[#9A9A96]">
              {SITE_PROFILE.shortPhilosophy}
            </p>
            <p className="text-[12px] text-[#666666] dark:text-[#9A9A96]">
              {SITE_PROFILE.location}
              <span aria-hidden="true" className="mx-2">·</span>
              <a
                href={`mailto:${SITE_PROFILE.email}`}
                className="underline underline-offset-4 hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] transition-colors"
              >
                {SITE_PROFILE.email}
              </a>
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h2 className="text-[11px] font-mono tracking-wider uppercase text-[#666666] dark:text-[#9A9A96]">
              Navigation
            </h2>
            <ul className="space-y-2 text-[13px]">
              {NAVIGATION_LINKS.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className="text-[#1A1A1A] dark:text-[#F0F0EE] hover:underline underline-offset-4 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/blog"
                  className="text-[#1A1A1A] dark:text-[#F0F0EE] hover:underline underline-offset-4 transition-colors"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h2 className="text-[11px] font-mono tracking-wider uppercase text-[#666666] dark:text-[#9A9A96]">
              Connect
            </h2>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
              {SOCIAL_LINKS.filter((s) => s.id !== 'phone').map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center gap-1 text-[#1A1A1A] dark:text-[#F0F0EE] hover:underline underline-offset-4 transition-colors"
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-55" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#EAEAEA] dark:border-[#222220] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-[#666666] dark:text-[#9A9A96]">
            <p>
              © {SITE_PROFILE.copyrightYear} {SITE_PROFILE.fullName}. All rights reserved.
            </p>
            <span aria-hidden="true" className="opacity-40">·</span>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 font-mono text-[11px] text-[#666666] dark:text-[#9A9A96] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] transition-colors"
            >
              <Lock className="h-3 w-3 opacity-70" aria-hidden="true" />
              <span>Admin</span>
            </Link>
          </div>
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.1] px-3.5 py-1.5 text-[12px] text-[#666666] dark:text-[#9A9A96] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}
