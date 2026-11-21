'use client';

import React, { useEffect, useState } from 'react';
import { isAiCrawlerUserAgent } from '@/lib/dataShield';
import { ThemeProvider } from '@/components/ThemeContext';
import { Navbar } from '@/components/Navbar';
import { SocialRail } from '@/components/SocialRail';
import { Footer } from '@/components/Footer';
import { SplashIntro } from '@/components/SplashIntro';

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Client-only application shell.
 * Ensures static HTML exports and SSR responses contain an empty #root shell
 * with zero portfolio data, preventing non-JS AI URL readers and HTML scrapers
 * from extracting site content while rendering identically for real browsers.
 */
export function AppShell({ children }: AppShellProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    if (isAiCrawlerUserAgent(ua)) {
      return;
    }
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div
        id="root"
        className="min-h-screen bg-white dark:bg-[#0A0A0A]"
        aria-busy="true"
      />
    );
  }

  return (
    <ThemeProvider>
      <SplashIntro />
      <div
        id="root"
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
    </ThemeProvider>
  );
}
