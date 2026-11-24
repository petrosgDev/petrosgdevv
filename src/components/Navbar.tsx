'use client';

import type { MouseEvent } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Code2,
  GitBranch,
  Github,
  Home,
  Linkedin,
  Mail,
  Menu,
  MessageCircle,
  Moon,
  Newspaper,
  Send,
  Sun,
  X,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { usePortfolio } from '@/components/PortfolioContext';
import { useTheme } from '@/components/ThemeContext';
import { BlogDockItem } from '@/components/BlogDockItem';

interface DockNavItem {
  id: string;
  label: string;
  href: string;
  matchPath: string;
  hash?: string;
  icon: typeof Home;
}

const DESKTOP_PRIMARY_NAV: DockNavItem[] = [
  { id: 'home', label: 'Home', href: '/', matchPath: '/', icon: Home },
  { id: 'work', label: 'Work', href: '/work', matchPath: '/work', icon: Briefcase },
  {
    id: 'skills',
    label: 'Skills',
    href: '/#skills',
    matchPath: '/',
    hash: '#skills',
    icon: Code2,
  },
  {
    id: 'experience',
    label: 'Experience',
    href: '/#experience',
    matchPath: '/',
    hash: '#experience',
    icon: GitBranch,
  },
  { id: 'blog', label: 'Blog', href: '/blog', matchPath: '/blog', icon: Newspaper },
  { id: 'about', label: 'About', href: '/about', matchPath: '/about', icon: BookOpen },
];

const MOBILE_DOCK_PRIMARY_NAV: DockNavItem[] = [
  { id: 'home', label: 'Home', href: '/', matchPath: '/', icon: Home },
  { id: 'work', label: 'Work', href: '/work', matchPath: '/work', icon: Briefcase },
  {
    id: 'skills',
    label: 'Skills',
    href: '/#skills',
    matchPath: '/',
    hash: '#skills',
    icon: Code2,
  },
  {
    id: 'experience',
    label: 'Experience',
    href: '/#experience',
    matchPath: '/',
    hash: '#experience',
    icon: GitBranch,
  },
  { id: 'blog', label: 'Blog', href: '/blog', matchPath: '/blog', icon: Newspaper },
  { id: 'about', label: 'About', href: '/about', matchPath: '/about', icon: BookOpen },
];

const MOBILE_DRAWER_NAV = [
  { label: 'Home', href: '/', matchPath: '/' },
  { label: 'Work', href: '/work', matchPath: '/work' },
  { label: 'Skills', href: '/#skills', matchPath: '/', hash: '#skills' },
  { label: 'Experience', href: '/#experience', matchPath: '/', hash: '#experience' },
  { label: 'Blog', href: '/blog', matchPath: '/blog' },
  { label: 'About', href: '/about', matchPath: '/about' },
  { label: 'Contact', href: '/contact', matchPath: '/contact' },
];

export function Navbar() {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const { data } = usePortfolio();
  const { SITE_PROFILE } = data;
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState('');
  const prefersReducedMotion = useReducedMotion();

  const drawerSocials = [
    { label: 'GitHub', href: SITE_PROFILE.githubUrl, icon: Github, external: true },
    { label: 'LinkedIn', href: SITE_PROFILE.linkedinUrl, icon: Linkedin, external: true },
    { label: 'Telegram', href: SITE_PROFILE.telegramUrl, icon: Send, external: true },
    { label: 'WhatsApp', href: SITE_PROFILE.whatsappUrl, icon: MessageCircle, external: true },
    { label: 'Email', href: `mailto:${SITE_PROFILE.email}`, icon: Mail, external: false },
  ];

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
    if (pathname !== '/') {
      setActiveHash('');
      return;
    }

    const pendingTarget =
      typeof window !== 'undefined'
        ? window.sessionStorage.getItem('pending-scroll-target')
        : null;
    const hashFromUrl =
      typeof window !== 'undefined' && window.location.hash
        ? window.location.hash.slice(1)
        : '';
    const targetId = pendingTarget || hashFromUrl;

    if (pendingTarget && typeof window !== 'undefined') {
      window.sessionStorage.removeItem('pending-scroll-target');
    }

    if (targetId) {
      setActiveHash(`#${targetId}`);
      requestAnimationFrame(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'start',
          });
        }
      });
    } else {
      setActiveHash('');
    }
  }, [pathname, prefersReducedMotion]);

  useEffect(() => {
    const onHashChange = () => {
      setActiveHash(window.location.hash || '');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

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

  const isRouteActive = (matchPath: string, hash?: string) => {
    const normalized = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
    if (hash) {
      return normalized === '/' && activeHash === hash;
    }
    if (matchPath === '/') {
      return normalized === '/' && !activeHash;
    }
    return normalized === matchPath || normalized.startsWith(`${matchPath}/`);
  };

  const contactActive = isRouteActive('/contact');

  const handleItemClick = (event: MouseEvent<HTMLAnchorElement>, itemHash?: string) => {
    setMobileOpen(false);
    if (!itemHash) {
      setActiveHash('');
      return;
    }

    event.preventDefault();
    const targetId = itemHash.slice(1);
    setActiveHash(itemHash);

    if (pathname === '/') {
      window.history.replaceState(null, '', `/#${targetId}`);
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      }
      return;
    }

    window.sessionStorage.setItem('pending-scroll-target', targetId);
    router.push(`/#${targetId}`);
  };

  return (
    <>
      <header className="sticky top-0 z-50 pointer-events-none">
        {/* Seamless top-edge atmospheric fade — replaces the rigid full-width rectangular header box */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 top-0 h-20 md:h-24 transition-opacity duration-300 bg-gradient-to-b from-white/95 via-white/60 to-transparent dark:from-[#0A0A0A]/95 dark:via-[#0A0A0A]/60 dark:to-transparent ${
            scrolled ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div className="relative mx-auto flex h-14 md:h-[74px] max-w-[1200px] items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr] gap-4 px-5 md:px-10">
          {/* Zone 1: Floating Brand Wordmark */}
          <Link
            href="/"
            onClick={(e) => handleItemClick(e)}
            className="pointer-events-auto inline-flex items-center justify-self-start font-sans text-[12px] font-semibold tracking-[0.16em] text-[#1A1A1A] dark:text-[#F0F0EE] whitespace-nowrap shrink-0 transition-opacity hover:opacity-75"
          >
            {SITE_PROFILE.brand}
          </Link>

          {/* Zone 2: Floating Icon-Sign Pill Navigation Dock */}
          <nav
            aria-label="Primary navigation"
            className="pointer-events-auto hidden md:flex items-center gap-0.5 justify-self-center rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-[#F5F5F4]/92 dark:bg-[#17191C]/92 p-1.5 backdrop-blur-xl shadow-[0_6px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.48)]"
          >
            {DESKTOP_PRIMARY_NAV.map((item) => {
              const active = isRouteActive(item.matchPath, item.hash);
              if (item.id === 'blog') {
                return (
                  <BlogDockItem
                    key={item.id}
                    active={active}
                    variant="desktop"
                    layoutId="desktop-icon-nav-active"
                    onNavigate={(e) => handleItemClick(e)}
                  />
                );
              }
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={(e) => handleItemClick(e, item.hash)}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white/60 ${
                    active
                      ? 'text-[#111110] dark:text-[#F5F5F3]'
                      : 'text-[#686864] dark:text-[#A3A6AB] hover:text-[#111110] dark:hover:text-[#F5F5F3] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="desktop-icon-nav-active"
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 420, damping: 34 }
                      }
                      className="absolute inset-0 rounded-full bg-white dark:bg-[#2B2E33] shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.45)] ring-1 ring-black/[0.06] dark:ring-white/[0.08]"
                    />
                  )}
                  <Icon className="relative z-10 h-[17px] w-[17px]" aria-hidden="true" />
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 translate-y-1 opacity-0 whitespace-nowrap rounded-lg border border-black/[0.08] dark:border-white/[0.1] bg-white/95 dark:bg-[#17191C]/95 px-2.5 py-1 text-[11px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] shadow-md backdrop-blur-md transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* Subtle vertical hairline divider matching modern icon dock */}
            <span
              aria-hidden="true"
              className="mx-1.5 h-5 w-px bg-black/[0.1] dark:bg-white/[0.12]"
            />

            {/* Contact Icon Sign */}
            <Link
              href="/contact"
              onClick={(e) => handleItemClick(e)}
              aria-label="Contact"
              aria-current={contactActive ? 'page' : undefined}
              className={`group relative flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white/60 ${
                contactActive
                  ? 'text-[#111110] dark:text-[#F5F5F3]'
                  : 'text-[#686864] dark:text-[#A3A6AB] hover:text-[#111110] dark:hover:text-[#F5F5F3] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
              }`}
            >
              {contactActive && (
                <motion.span
                  layoutId="desktop-icon-nav-active"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 420, damping: 34 }
                  }
                  className="absolute inset-0 rounded-full bg-white dark:bg-[#2B2E33] shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.45)] ring-1 ring-black/[0.06] dark:ring-white/[0.08]"
                />
              )}
              <Mail className="relative z-10 h-[17px] w-[17px]" aria-hidden="true" />
              <span
                role="tooltip"
                className="pointer-events-none absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 translate-y-1 opacity-0 whitespace-nowrap rounded-lg border border-black/[0.08] dark:border-white/[0.1] bg-white/95 dark:bg-[#17191C]/95 px-2.5 py-1 text-[11px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] shadow-md backdrop-blur-md transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
              >
                Contact
              </span>
            </Link>
          </nav>

          {/* Zone 3: Floating Circular GitHub & Theme Toggle Buttons */}
          <div className="pointer-events-auto flex items-center justify-end justify-self-end gap-2 shrink-0">
            <a
              href={SITE_PROFILE.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Petros Geto on GitHub"
              title="GitHub (@petrosgDev)"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-[#F5F5F4]/88 dark:bg-[#17191C]/88 backdrop-blur-xl shadow-[0_4px_14px_rgba(0,0,0,0.05)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.42)] text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] hover:bg-white dark:hover:bg-[#23262B] transition-all duration-200 shrink-0"
            >
              <Github className="h-3.5 w-3.5" aria-hidden="true" />
            </a>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-[#F5F5F4]/88 dark:bg-[#17191C]/88 backdrop-blur-xl shadow-[0_4px_14px_rgba(0,0,0,0.05)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.42)] text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] hover:bg-white dark:hover:bg-[#23262B] transition-all duration-200 shrink-0 cursor-pointer"
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
              className="inline-flex md:hidden h-9 w-9 items-center justify-center rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-[#F5F5F4]/90 dark:bg-[#17191C]/90 backdrop-blur-xl shadow-[0_4px_14px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.45)] text-[#1A1A1A] dark:text-[#F0F0EE] active:scale-95 transition-all duration-200 shrink-0 cursor-pointer"
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
              className="fixed left-4 right-4 top-[66px] z-50 md:hidden rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#141619] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.75)]"
            >
              <div className="flex flex-col gap-1">
                {MOBILE_DRAWER_NAV.map((item, idx) => {
                  const active = isRouteActive(item.matchPath, item.hash);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={(e) => handleItemClick(e, item.hash)}
                      aria-current={active ? 'page' : undefined}
                      className={`flex min-h-[44px] items-center justify-between rounded-xl px-3.5 py-2 text-[14px] transition-colors ${
                        active
                          ? 'bg-[#F4F4F3] dark:bg-[#23262B] font-semibold text-[#1A1A1A] dark:text-[#F0F0EE]'
                          : 'text-[#555553] dark:text-[#A3A6AB] hover:bg-[#F8F8F7] dark:hover:bg-[#1C1F24]'
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

              {/* Social Media Capsule inside Mobile Drawer */}
              <div className="mt-3.5 pt-3.5 border-t border-black/[0.06] dark:border-white/[0.08] space-y-2.5">
                <div className="flex items-center justify-between px-1 text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
                  <span>{SITE_PROFILE.location}</span>
                  <span>Socials</span>
                </div>
                <div className="flex items-center justify-between rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-[#F5F5F4] dark:bg-[#1C1F24] p-1">
                  {drawerSocials.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        target={social.external ? '_blank' : undefined}
                        rel={social.external ? 'noopener noreferrer' : undefined}
                        aria-label={social.label}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-[#4A4A46] dark:text-[#C4C7CC] hover:bg-white dark:hover:bg-[#2B2E33] hover:text-[#111110] dark:hover:text-white transition-colors"
                      >
                        <Icon className="h-[17px] w-[17px]" aria-hidden="true" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Modern Mobile Floating Icon-Sign Bottom Dock (Home, Work, Skills, Experience, Blog, About | Contact) */}
      <nav
        aria-label="Mobile quick navigation"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex md:hidden items-center gap-0.5 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-[#F5F5F4]/92 dark:bg-[#17191C]/92 p-1.5 backdrop-blur-xl shadow-[0_10px_32px_rgba(0,0,0,0.14)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)] max-w-[calc(100vw-24px)]"
      >
        {MOBILE_DOCK_PRIMARY_NAV.map((item) => {
          const active = isRouteActive(item.matchPath, item.hash);
          if (item.id === 'blog') {
            return (
              <BlogDockItem
                key={item.id}
                active={active}
                variant="mobile"
                layoutId="mobile-dock-active-circle"
                onNavigate={(e) => handleItemClick(e)}
              />
            );
          }
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={(e) => handleItemClick(e, item.hash)}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 ${
                active
                  ? 'text-[#111110] dark:text-[#F5F5F3]'
                  : 'text-[#686864] dark:text-[#A3A6AB]'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="mobile-dock-active-circle"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 420, damping: 34 }
                  }
                  className="absolute inset-0 rounded-full bg-white dark:bg-[#2B2E33] shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.45)] ring-1 ring-black/[0.06] dark:ring-white/[0.08]"
                />
              )}
              <Icon className="relative z-10 h-[17px] w-[17px]" aria-hidden="true" />
            </Link>
          );
        })}

        <span
          aria-hidden="true"
          className="mx-0.5 h-5 w-px bg-black/[0.1] dark:bg-white/[0.12]"
        />

        <Link
          href="/contact"
          onClick={(e) => handleItemClick(e)}
          aria-label="Contact"
          aria-current={contactActive ? 'page' : undefined}
          className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 ${
            contactActive
              ? 'text-[#111110] dark:text-[#F5F5F3]'
              : 'text-[#686864] dark:text-[#A3A6AB]'
          }`}
        >
          {contactActive && (
            <motion.span
              layoutId="mobile-dock-active-circle"
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 420, damping: 34 }
              }
              className="absolute inset-0 rounded-full bg-white dark:bg-[#2B2E33] shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.45)] ring-1 ring-black/[0.06] dark:ring-white/[0.08]"
            />
          )}
          <Mail className="relative z-10 h-[17px] w-[17px]" aria-hidden="true" />
        </Link>
      </nav>
    </>
  );
}
