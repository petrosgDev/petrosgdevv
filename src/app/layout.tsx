import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import { SITE_PROFILE } from '@/data/portfolio';
import { ThemeProvider } from '@/components/ThemeContext';
import { Navbar } from '@/components/Navbar';
import { SocialRail } from '@/components/SocialRail';
import { Footer } from '@/components/Footer';
import { SplashIntro } from '@/components/SplashIntro';
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://petrosgeto.pages.dev';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_PROFILE.fullName} — ${SITE_PROFILE.role}`,
    template: `%s — ${SITE_PROFILE.fullName} (${SITE_PROFILE.brand})`,
  },
  description:
    'Portfolio of Petros Geto (PETROS G DEV), a software engineer in Addis Ababa building full-stack web applications, AI-powered solutions, and scalable digital products.',
  authors: [{ name: SITE_PROFILE.fullName, url: siteUrl }],
  openGraph: {
    type: 'website',
    siteName: SITE_PROFILE.brand,
    title: `${SITE_PROFILE.fullName} — ${SITE_PROFILE.role}`,
    description:
      'Explore full-stack web applications, desktop systems, mobile software, and engineering case studies by Petros Geto.',
    url: siteUrl,
    images: [
      {
        url: '/images/project-aman-pay.png',
        alt: 'Petros Geto — Software Engineer & AI Developer Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_PROFILE.fullName} — ${SITE_PROFILE.role}`,
    description:
      'Explore full-stack web applications, desktop systems, mobile software, and engineering case studies by Petros Geto.',
    images: ['/images/project-aman-pay.png'],
  },
};

const PERSON_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: SITE_PROFILE.fullName,
  alternateName: SITE_PROFILE.brand,
  jobTitle: SITE_PROFILE.role,
  description: SITE_PROFILE.heroIntro,
  url: `${siteUrl}/`,
  email: `mailto:${SITE_PROFILE.email}`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Addis Ababa',
    addressCountry: 'ET',
  },
  sameAs: [SITE_PROFILE.githubUrl, SITE_PROFILE.linkedinUrl, SITE_PROFILE.telegramUrl],
  knowsAbout: [
    'React',
    'Next.js',
    'TypeScript',
    'JavaScript',
    'Node.js',
    'Express',
    'Spring Boot',
    'Python',
    'Java',
    'C++',
    'Flutter',
    'PostgreSQL',
    'MySQL',
    'Docker',
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_JSON_LD) }}
        />
      </head>
      <body className="bg-white text-[#1A1A1A] dark:bg-[#0A0A0A] dark:text-[#F0F0EE] antialiased selection:bg-[#1A1A1A]/10 dark:selection:bg-white/15">
        <ThemeProvider>
          <SplashIntro />
          <div className="min-h-screen flex flex-col bg-white dark:bg-[#0A0A0A] text-[#1A1A1A] dark:text-[#F0F0EE]">
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
      </body>
    </html>
  );
}
