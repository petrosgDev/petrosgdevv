import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import { AppShell } from '@/components/AppShell';
import './globals.css';

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

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: 'PETROS G DEV',
    template: '%s — PETROS G DEV',
  },
  description: 'PETROS G DEV',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
    },
  },
  other: {
    robots: 'noai, noimageai, noindex, nofollow, noarchive, nosnippet',
    GPTBot: 'noindex, nofollow',
    ClaudeBot: 'noindex, nofollow',
    CCBot: 'nofollow',
    'tdm-reservation': '1',
  },
};

const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem('petros-portfolio-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(!s&&d)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

const SPLASH_INIT_SCRIPT = `(function(){try{var seen=sessionStorage.getItem('petros-splash-seen')==='1';var rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;var q=new URLSearchParams(window.location.search);var skip=q.get('nosplash')==='1'||q.get('autostart')==='1';if(!seen&&!rm&&!skip){document.documentElement.setAttribute('data-splash','active');window.setTimeout(function(){document.documentElement.removeAttribute('data-splash');},3000);}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${barlowCondensed.variable} ${plusJakartaSans.variable} ${jetBrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: SPLASH_INIT_SCRIPT }} />
      </head>
      <body className="bg-white text-[#1A1A1A] dark:bg-[#0A0A0A] dark:text-[#F0F0EE] antialiased selection:bg-[#1A1A1A]/10 dark:selection:bg-white/15">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
