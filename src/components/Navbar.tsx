'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowUpRight,
  Briefcase,
  Github,
  Home,
  Mail,
  Menu,
  Moon,
  Sun,
  User,
  X,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { NAVIGATION_LINKS, SITE_PROFILE } from '@/data/portfolio';
import { BrandLogo } from '@/components/BrandLogo';
import { useTheme } from '@/components/ThemeContext';

const MOBILE_DOCK_ICONS: Record<string, typeof Home> = {
  '/': Home,
  '/work': Briefcase,
  '/about': User,
  '/contact': Mail,
};

export function Navbar() {
  const pathname = usePathname() || '/';
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 14);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  const isActivePath = (linkPath: string) => {
    if (linkPath === '/') {
      return pathname === '/';
    }
    return pathname === linkPath || pathname.startsWith(`${linkPath}/`);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_18px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_18px_rgba(0,0,0,0.35)]'
            : 'bg-white/85 dark:bg-[#0A0A0A]/85 backdrop-blur-md border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex h-14 md:h-16 max-w-[1200px] items-center justify-between gap-4 px-5 md:px-10">
          {/* Zone 1: Brand Monogram Logo & Wordmark */}
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-sans text-[12px] font-semibold tracking-[0.16em] text-[#1A1A1A] dark:text-[#F0F0EE] whitespace-nowrap shrink-0 transition-opacity hover:opacity-75"
          >
            <BrandLogo size="md" className="transition-transform duration-300 group-hover:scale-105" />
            <span>{SITE_PROFILE.brand}</span>
          </Link>

          {/* Zone 2: Modern Desktop Segmented Glass Navigation */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center rounded-full bg-[#F5F5F4]/90 dark:bg-[#161615]/90 p-1 border border-black/[0.06] dark:border-white/[0.08]"
          >
            {NAVIGATION_LINKS.map((item) => {
              const active = isActivePath(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  aria-current={active ? 'page' : undefined}
                  className={`relative px-4 py-1.5 text-[12.5px] rounded-full whitespace-nowrap shrink-0 transition-colors duration-200 ${
                    active
                      ? 'text-[#1A1A1A] dark:text-[#F0F0EE] font-medium'
                      : 'text-[#666666] dark:text-[#9A9A96] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="desktop-nav-active-pill"
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 420, damping: 34 }
                      }
                      className="absolute inset-0 rounded-full bg-white dark:bg-[#262624] shadow-[0_1px_4px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_6px_rgba(0,0,0,0.45)] border border-black/[0.04] dark:border-white/[0.06]"
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: Modern Circular Utility Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={SITE_PROFILE.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Petros Geto on GitHub"
              title="GitHub (@petrosgDev)"
              className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-white/70 dark:bg-[#141413]/70 text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] hover:bg-[#F5F5F4] dark:hover:bg-[#1E1E1C] transition-all duration-200 shrink-0"
            >
              <Github className="h-3.5 w-3.5" aria-hidden="true" />
            </a>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-white/70 dark:bg-[#141413]/70 text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] hover:bg-[#F5F5F4] dark:hover:bg-[#1E1E1C] transition-all duration-200 shrink-0 cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Moon className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation-drawer"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="inline-flex md:hidden h-9 w-9 items-center justify-center rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-white/80 dark:bg-[#141413]/80 text-[#1A1A1A] dark:text-[#F0F0EE] active:scale-95 transition-all duration-200 shrink-0 cursor-pointer"
            >
              {mobileOpen ? (
                <X className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Menu className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Modern Floating Mobile Menu Sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/35 dark:bg-black/65 backdrop-blur-sm md:hidden"
            />

            <motion.nav
              id="mobile-navigation-drawer"
              aria-label="Mobile navigation"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-4 right-4 top-[66px] z-50 md:hidden rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#111110] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.7)]"
            >
              <div className="flex flex-col gap-1">
                {NAVIGATION_LINKS.map((item, idx) => {
                  const active = isActivePath(item.path);
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      aria-current={active ? 'page' : undefined}
                      className={`flex min-h-[46px] items-center justify-between rounded-xl px-3.5 py-2.5 text-[14px] transition-colors ${
                        active
                          ? 'bg-[#F4F4F3] dark:bg-[#1F1F1D] font-semibold text-[#1A1A1A] dark:text-[#F0F0EE]'
                          : 'text-[#555553] dark:text-[#A0A09C] hover:bg-[#F8F8F7] dark:hover:bg-[#181817]'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="font-mono text-[10.5px] opacity-55 tabular-nums">
                          0{idx + 1}
                        </span>
                        <span>{item.label}</span>
                      </span>
                      {active ? (
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-1.5 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE]"
                        />
                      ) : (
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-45" aria-hidden="true" />
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Quick Connect Strip inside Mobile Menu */}
              <div className="mt-3.5 pt-3.5 border-t border-black/[0.06] dark:border-white/[0.08] space-y-2.5">
                <div className="flex items-center justify-between px-1 text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
                  <span>{SITE_PROFILE.location}</span>
                  <span>Quick Connect</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={`mailto:${SITE_PROFILE.email}`}
                    className="flex h-9 items-center justify-center rounded-xl border border-black/[0.08] dark:border-white/[0.1] text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:bg-[#F4F4F3] dark:hover:bg-[#1E1E1C] transition-colors"
                  >
                    Email
                  </a>
                  <a
                    href={SITE_PROFILE.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 items-center justify-center rounded-xl border border-black/[0.08] dark:border-white/[0.1] text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:bg-[#F4F4F3] dark:hover:bg-[#1E1E1C] transition-colors"
                  >
                    GitHub
                  </a>
                  <a
                    href={SITE_PROFILE.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 items-center justify-center rounded-xl border border-black/[0.08] dark:border-white/[0.1] text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:bg-[#F4F4F3] dark:hover:bg-[#1E1E1C] transition-colors"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Modern Mobile Floating Bottom Dock */}
      <nav
        aria-label="Mobile quick navigation"
        className="fixed bottom-3.5 left-4 right-4 z-40 mx-auto max-w-[360px] md:hidden rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-white/88 dark:bg-[#121211]/88 backdrop-blur-xl px-1.5 py-1.5 shadow-[0_10px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_10px_32px_rgba(0,0,0,0.55)]"
      >
        <div className="grid grid-cols-4 gap-1">
          {NAVIGATION_LINKS.map((item) => {
            const active = isActivePath(item.path);
            const Icon = MOBILE_DOCK_ICONS[item.path] ?? Home;
            return (
              <Link
                key={item.path}
                href={item.path}
                aria-current={active ? 'page' : undefined}
                className={`relative flex min-h-[46px] flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 transition-colors duration-200 ${
                  active
                    ? 'text-[#1A1A1A] dark:text-[#F0F0EE] font-semibold'
                    : 'text-[#6E6E6A] dark:text-[#8E8E8A]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="mobile-dock-active-pill"
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 420, damping: 34 }
                    }
                    className="absolute inset-0 rounded-xl bg-[#F3F3F1] dark:bg-[#222220]"
                  />
                )}
                <Icon className="relative z-10 h-4 w-4" aria-hidden="true" />
                <span className="relative z-10 text-[10px] leading-none tracking-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
