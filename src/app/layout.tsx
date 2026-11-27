import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import { AppShell } from '@/components/AppShell';
import { getPublishedPortfolioServer } from '@/lib/serverPortfolio';
import {
  buildRootJsonLd,
  buildSafeJsonLdString,
  resolveSiteUrl,
  SEO_CONFIG,
} from '@/lib/seo';
import './globals.css';

export const dynamic = 'force-dynamic';

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-barlow-condensed',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const SITE_URL = resolveSiteUrl();

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SEO_CONFIG.defaultTitle,
    template: SEO_CONFIG.titleTemplate,
  },
  description: SEO_CONFIG.defaultDescription,
  applicationName: SEO_CONFIG.siteName,
  authors: [{ name: SEO_CONFIG.siteName, url: SITE_URL }],
  creator: SEO_CONFIG.siteName,
  publisher: SEO_CONFIG.siteName,
  keywords: [...SEO_CONFIG.keywords],
  category: 'technology',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: SEO_CONFIG.locale,
    url: '/',
    siteName: SEO_CONFIG.siteName,
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.defaultDescription,
    images: [
      {
        url: '/og-card/',
        width: 1200,
        height: 630,
        alt: SEO_CONFIG.defaultTitle,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.defaultDescription,
    creator: SEO_CONFIG.twitterCreator,
    images: ['/og-card/'],
  },
  other: {
    GPTBot: 'noindex, nofollow',
    ClaudeBot: 'noindex, nofollow',
    CCBot: 'nofollow',
  },
};

const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem('petros-portfolio-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(!s&&d)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

const SPLASH_INIT_SCRIPT = `(function(){try{var bot=/Googlebot|Bingbot|DuckDuckBot|Applebot|YandexBot|Slurp/i.test(navigator.userAgent||'');var seen=sessionStorage.getItem('petros-splash-seen')==='1';var rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;var q=new URLSearchParams(window.location.search);var skip=bot||q.get('nosplash')==='1'||q.get('autostart')==='1';if(!seen&&!rm&&!skip){document.documentElement.setAttribute('data-splash','active');window.setTimeout(function(){document.documentElement.removeAttribute('data-splash');},3000);}}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialSnapshot = await getPublishedPortfolioServer();
  const rootJsonLd = buildSafeJsonLdString(
    buildRootJsonLd(initialSnapshot?.data, resolveSiteUrl())
  );

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${barlowCondensed.variable} ${plusJakartaSans.variable} ${jetBrainsMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: rootJsonLd }}
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: SPLASH_INIT_SCRIPT }} />
      </head>
      <body className="bg-white text-[#1A1A1A] dark:bg-[#0A0A0A] dark:text-[#F0F0EE] antialiased selection:bg-[#1A1A1A]/10 dark:selection:bg-white/15">
        <AppShell initialSnapshot={initialSnapshot}>{children}</AppShell>
      </body>
    </html>
  );
}
