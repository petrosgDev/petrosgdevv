'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { isAiCrawlerUserAgent } from '@/lib/dataShield';
import { ThemeProvider } from '@/components/ThemeContext';
import { PortfolioProvider } from '@/components/PortfolioContext';
import { ThemeTokenStyle } from '@/components/ThemeTokenStyle';
import { Navbar } from '@/components/Navbar';
import { SocialRail } from '@/components/SocialRail';
import { Footer } from '@/components/Footer';
import { SplashIntro } from '@/components/SplashIntro';

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Application shell with SSR-first rendering so search engines (Googlebot, Bingbot)
 * immediately receive full semantic HTML, headings, and internal links on initial crawl.
 */
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname() || '/';
  const [blocked, setBlocked] = useState(false);
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

  useEffect(() => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    if (isAiCrawlerUserAgent(ua)) {
      setBlocked(true);
    }
  }, []);

  if (blocked) {
    return (
      <div
        id="root"
        className="min-h-screen bg-white dark:bg-[#0A0A0A]"
        aria-hidden="true"
      />
    );
  }

  return (
    <ThemeProvider>
      <PortfolioProvider>
        {isAdminRoute ? (
          <div
            id="root"
            className="min-h-screen bg-white dark:bg-[#0A0A0A] text-[#1A1A1A] dark:text-[#F0F0EE]"
          >
            {children}
          </div>
        ) : (
          <>
            <ThemeTokenStyle />
            <SplashIntro />
            <div
              id="root"
              data-portfolio-surface="public"
              className="min-h-screen flex flex-col bg-white dark:bg-[#0A0A0A] text-[#1A1A1A] dark:text-[#F0F0EE]"
            >
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-[#1A1A1A] focus:text-white focus:px-4 focus:py-2 focus:text-xs focus:font-medium"
              >
                Skip to main content
              </a>

              <Navbar />
              <SocialRail />

              <main id="main-content" className="flex-1">
                {children}
              </main>

              <Footer />
            </div>
          </>
        )}
      </PortfolioProvider>
    </ThemeProvider>
  );
}
