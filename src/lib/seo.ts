import type { PortfolioBundle, ProjectItem } from '@/data/portfolio';
import { getDefaultPortfolioBundle } from '@/data/portfolio';

export const SEO_CONFIG = {
  siteName: 'Petros Geto',
  brandHandle: 'PETROS G DEV',
  alternateNames: [
    'PETROS G DEV',
    'Petros G Dev',
    'petrosgDev',
    'Petros Geto Portfolio',
  ],
  defaultTitle: 'Petros Geto | Software Engineer & AI Developer',
  titleTemplate: '%s | Petros Geto',
  defaultDescription:
    'Petros Geto — Software Engineer & AI Developer in Addis Ababa specializing in AI-powered systems, full-stack web apps, and scalable digital products.',
  twitterCreator: '@petrosgdev',
  locale: 'en_US',
  keywords: [
    'Petros Geto',
    'PETROS G DEV',
    'Petros Geto Software Engineer',
    'Petros Geto AI Developer',
    'Petros Geto Portfolio',
    'Petros Geto Developer',
    'Software Engineer Ethiopia',
    'Full-Stack Developer Addis Ababa',
    'AI Developer Ethiopia',
    'Next.js Developer Ethiopia',
    'Debre Birhan University Software Engineering',
    'Aman Pay',
    'Event Hub',
    'LOCK IN',
  ],
} as const;

export interface SiteUrlEnv {
  NEXT_PUBLIC_SITE_URL?: string;
  APP_URL?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
  VERCEL_URL?: string;
  [key: string]: string | undefined;
}

function normalizeOrigin(raw: string | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return null;
    }
    return parsed.origin;
  } catch {
    return null;
  }
}

/**
 * Resolves the canonical public origin for metadataBase, canonical links,
 * OpenGraph URLs, sitemap.xml, robots.txt, and Schema.org JSON-LD.
 */
export function resolveSiteUrl(env: SiteUrlEnv = process.env): string {
  const candidates = [
    env.NEXT_PUBLIC_SITE_URL,
    env.APP_URL,
    env.VERCEL_PROJECT_PRODUCTION_URL,
    env.VERCEL_URL,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeOrigin(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return 'http://localhost:3000';
}

export function buildCanonicalUrl(pathname: string, siteUrl: string = resolveSiteUrl()): string {
  const base = normalizeOrigin(siteUrl) ?? 'http://localhost:3000';
  const cleaned = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (cleaned === '/') {
    return `${base}/`;
  }
  return cleaned.endsWith('/') ? `${base}${cleaned}` : `${base}${cleaned}/`;
}

export function toAbsoluteAssetUrl(
  assetPath: string,
  siteUrl: string = resolveSiteUrl()
): string {
  if (/^https?:\/\//i.test(assetPath)) {
    return assetPath;
  }
  const base = normalizeOrigin(siteUrl) ?? 'http://localhost:3000';
  const normalizedPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  return `${base}${normalizedPath}`;
}

export function buildSafeJsonLdString(schema: Record<string, unknown>): string {
  return JSON.stringify(schema)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

export function buildBreadcrumbJsonLd(
  items: ReadonlyArray<{ name: string; path: string }>,
  siteUrl: string = resolveSiteUrl()
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: buildCanonicalUrl(item.path, siteUrl),
    })),
  };
}

export function buildRootJsonLd(
  bundle: PortfolioBundle = getDefaultPortfolioBundle(),
  siteUrl: string = resolveSiteUrl()
): Record<string, unknown> {
  const base = normalizeOrigin(siteUrl) ?? 'http://localhost:3000';
  const profile = bundle.SITE_PROFILE;
  const personId = `${base}/#person`;
  const websiteId = `${base}/#website`;
  const profilePageId = `${base}/#profilepage`;

  const skills = Array.from(
    new Set([
      'Software Engineering',
      'Artificial Intelligence',
      'Full-Stack Web Development',
      ...bundle.SKILL_CATEGORIES.flatMap((category) => category.items),
    ])
  );

  const sameAs = Array.from(
    new Set(
      [
        profile.githubUrl,
        profile.linkedinUrl,
        profile.telegramUrl,
        bundle.BLOG_SETTINGS?.telegramChannel
          ? `https://t.me/${bundle.BLOG_SETTINGS.telegramChannel}`
          : 'https://t.me/abysiniyatech',
      ].filter(Boolean)
    )
  );

  const city = profile.location.split(',')[0]?.trim() || 'Addis Ababa';

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: `${base}/`,
        name: SEO_CONFIG.siteName,
        alternateName: [...SEO_CONFIG.alternateNames],
        description: SEO_CONFIG.defaultDescription,
        inLanguage: 'en',
        author: { '@id': personId },
        publisher: { '@id': personId },
      },
      {
        '@type': 'Person',
        '@id': personId,
        name: profile.fullName,
        givenName: 'Petros',
        familyName: 'Geto',
        alternateName: [...SEO_CONFIG.alternateNames],
        url: `${base}/`,
        image: {
          '@type': 'ImageObject',
          url: toAbsoluteAssetUrl(profile.portraitSrc, base),
          caption: `${profile.fullName} — ${profile.role}`,
        },
        jobTitle: profile.role,
        description: SEO_CONFIG.defaultDescription,
        email: `mailto:${profile.email}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: city,
          addressCountry: 'ET',
        },
        alumniOf: {
          '@type': 'CollegeOrUniversity',
          name: 'Debre Birhan University',
        },
        knowsAbout: skills,
        sameAs,
      },
      {
        '@type': 'ProfilePage',
        '@id': profilePageId,
        url: `${base}/`,
        name: SEO_CONFIG.defaultTitle,
        description: SEO_CONFIG.defaultDescription,
        inLanguage: 'en',
        isPartOf: { '@id': websiteId },
        mainEntity: { '@id': personId },
        about: { '@id': personId },
      },
    ],
  };
}

export function buildWorkCollectionJsonLd(
  projects: readonly ProjectItem[],
  siteUrl: string = resolveSiteUrl()
): Record<string, unknown> {
  const base = normalizeOrigin(siteUrl) ?? 'http://localhost:3000';
  const workUrl = buildCanonicalUrl('/work', base);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${workUrl}#collection`,
        url: workUrl,
        name: 'Projects & Work | Petros Geto',
        description:
          'Selected full-stack web applications, AI platforms, mobile apps, and desktop systems engineered by Petros Geto.',
        isPartOf: { '@id': `${base}/#website` },
        author: { '@id': `${base}/#person` },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: projects.length,
          itemListElement: projects.map((project, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: project.title,
            url: buildCanonicalUrl(`/work/${project.slug}`, base),
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${base}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Work',
            item: workUrl,
          },
        ],
      },
    ],
  };
}

export function buildProjectJsonLd(
  project: ProjectItem,
  siteUrl: string = resolveSiteUrl()
): Record<string, unknown> {
  const base = normalizeOrigin(siteUrl) ?? 'http://localhost:3000';
  const projectUrl = buildCanonicalUrl(`/work/${project.slug}`, base);
  const workUrl = buildCanonicalUrl('/work', base);
  const isSoftware =
    project.category === 'Web Applications' ||
    project.category === 'Desktop & Systems' ||
    project.category === 'Mobile';

  const projectNode: Record<string, unknown> = {
    '@type': isSoftware ? 'SoftwareApplication' : 'CreativeWork',
    '@id': `${projectUrl}#project`,
    name: project.title,
    headline: `${project.title} — ${project.subtitle}`,
    description: project.summary || project.subtitle,
    url: projectUrl,
    image: toAbsoluteAssetUrl(project.heroImage.src, base),
    author: { '@id': `${base}/#person` },
    creator: { '@id': `${base}/#person` },
    datePublished: `${project.year}-01-01`,
    keywords: project.technologies.join(', '),
    ...(isSoftware
      ? {
          applicationCategory:
            project.category === 'Mobile'
              ? 'MobileApplication'
              : project.category === 'Desktop & Systems'
                ? 'DesktopEnhancementApplication'
                : 'WebApplication',
          operatingSystem:
            project.category === 'Web Applications' ? 'Web, All' : 'Cross-Platform',
        }
      : {}),
    ...(project.liveUrl ? { sameAs: project.liveUrl } : {}),
    ...(project.githubUrl ? { codeRepository: project.githubUrl } : {}),
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      projectNode,
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${base}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Work',
            item: workUrl,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: project.title,
            item: projectUrl,
          },
        ],
      },
    ],
  };
}
