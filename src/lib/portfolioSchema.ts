import type {
  BlogSettings,
  ExperienceItem,
  ExperiencePoint,
  HeroMetric,
  NavigationLink,
  PhilosophyPillar,
  PortfolioBundle,
  ProjectCategory,
  ProjectImage,
  ProjectItem,
  SeoSettings,
  SiteProfile,
  SkillCategory,
  SocialLink,
  TechnicalInterest,
} from '@/data/portfolio';
import {
  DEFAULT_BLOG_SETTINGS,
  DEFAULT_SEO_SETTINGS,
  getDefaultPortfolioBundle,
} from '@/data/portfolio';
import { DEFAULT_THEME_TOKENS, sanitizeThemeTokens } from '@/lib/themeSystem';

export const ALLOWED_PROJECT_CATEGORIES: readonly ProjectCategory[] = [
  'Web Applications',
  'Brand & Hospitality',
  'Desktop & Systems',
  'Mobile',
];

export interface ValidationSuccess {
  ok: true;
  data: PortfolioBundle;
}

export interface ValidationFailure {
  ok: false;
  errors: string[];
}

export type PortfolioValidationResult = ValidationSuccess | ValidationFailure;

function cleanText(value: unknown, maxLength: number, fallback = ''): string {
  if (typeof value !== 'string') return fallback;
  return value.trim().slice(0, maxLength);
}

export function sanitizeSlug(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function sanitizeTelegramUsername(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw
    .trim()
    .replace(/^https?:\/\/(t\.me|telegram\.me)\/(s\/)?/i, '')
    .replace(/^@+/, '')
    .split(/[/?#]/)[0];

  if (!/^[a-zA-Z0-9_]{5,32}$/.test(trimmed)) {
    return null;
  }
  return trimmed;
}

export interface SafeUrlOptions {
  allowRelative?: boolean;
  allowMailto?: boolean;
  allowTel?: boolean;
}

export function sanitizeSafeUrl(
  raw: unknown,
  options: SafeUrlOptions = {}
): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 1000) return null;

  const { allowRelative = false, allowMailto = false, allowTel = false } = options;

  if (allowRelative && trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    // Disallow control characters or protocol smuggling in relative paths
    if (/[\u0000-\u001F\u007F]/.test(trimmed)) return null;
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const protocol = parsed.protocol.toLowerCase();
    if (protocol === 'https:' || protocol === 'http:') {
      return parsed.toString();
    }
    if (allowMailto && protocol === 'mailto:') {
      return trimmed;
    }
    if (allowTel && protocol === 'tel:') {
      return trimmed;
    }
    return null;
  } catch {
    return null;
  }
}

function sanitizeImage(
  raw: unknown,
  fallback: ProjectImage
): ProjectImage {
  if (!raw || typeof raw !== 'object') return fallback;
  const obj = raw as Record<string, unknown>;
  const src =
    sanitizeSafeUrl(obj.src, { allowRelative: true }) ?? fallback.src;
  const aspectRaw = cleanText(obj.aspect, 20, fallback.aspect);
  const aspect: ProjectImage['aspect'] =
    aspectRaw === 'wide' || aspectRaw === 'standard' || aspectRaw === 'portrait'
      ? aspectRaw
      : fallback.aspect;
  return {
    src,
    alt: cleanText(obj.alt, 240, fallback.alt),
    caption: cleanText(obj.caption, 400, fallback.caption),
    aspect,
  };
}

function sanitizeStringArray(raw: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => cleanText(item, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

export function validatePortfolioBundle(input: unknown): PortfolioValidationResult {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') {
    return { ok: false, errors: ['Portfolio payload must be a JSON object.'] };
  }

  const defaults = getDefaultPortfolioBundle();
  const raw = input as Record<string, unknown>;

  // 1. SITE_PROFILE
  const rawProfile =
    raw.SITE_PROFILE && typeof raw.SITE_PROFILE === 'object'
      ? (raw.SITE_PROFILE as Record<string, unknown>)
      : null;

  if (!rawProfile) {
    errors.push('SITE_PROFILE is required.');
  }

  const brand = cleanText(rawProfile?.brand, 60);
  const fullName = cleanText(rawProfile?.fullName, 100);
  const role = cleanText(rawProfile?.role, 120);
  const email = cleanText(rawProfile?.email, 160);
  if (!brand) errors.push('Brand name cannot be empty.');
  if (!fullName) errors.push('Full name cannot be empty.');
  if (!role) errors.push('Role cannot be empty.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('A valid email address is required.');
  }

  const portraitSrc =
    sanitizeSafeUrl(rawProfile?.portraitSrc, { allowRelative: true }) ??
    defaults.SITE_PROFILE.portraitSrc;

  const githubUrl =
    sanitizeSafeUrl(rawProfile?.githubUrl) ?? defaults.SITE_PROFILE.githubUrl;
  const linkedinUrl =
    sanitizeSafeUrl(rawProfile?.linkedinUrl) ?? defaults.SITE_PROFILE.linkedinUrl;
  const telegramUrl =
    sanitizeSafeUrl(rawProfile?.telegramUrl) ?? defaults.SITE_PROFILE.telegramUrl;
  const whatsappUrl =
    sanitizeSafeUrl(rawProfile?.whatsappUrl) ?? defaults.SITE_PROFILE.whatsappUrl;

  const rawMetrics = Array.isArray(rawProfile?.heroMetrics)
    ? rawProfile.heroMetrics
    : defaults.SITE_PROFILE.heroMetrics;

  const heroMetrics: HeroMetric[] = rawMetrics
    .slice(0, 8)
    .map((m) => {
      const obj = (m && typeof m === 'object' ? m : {}) as Record<string, unknown>;
      return {
        value: cleanText(obj.value, 32),
        label: cleanText(obj.label, 80),
      };
    })
    .filter((m) => m.value && m.label);

  const rawYear = Number(rawProfile?.copyrightYear);
  const copyrightYear =
    Number.isInteger(rawYear) && rawYear >= 2020 && rawYear <= 2100
      ? rawYear
      : defaults.SITE_PROFILE.copyrightYear;

  const SITE_PROFILE: SiteProfile = {
    brand: brand || defaults.SITE_PROFILE.brand,
    fullName: fullName || defaults.SITE_PROFILE.fullName,
    role: role || defaults.SITE_PROFILE.role,
    location: cleanText(rawProfile?.location, 120, defaults.SITE_PROFILE.location),
    email: email || defaults.SITE_PROFILE.email,
    phoneDisplay: cleanText(
      rawProfile?.phoneDisplay,
      40,
      defaults.SITE_PROFILE.phoneDisplay
    ),
    githubHandle: cleanText(
      rawProfile?.githubHandle,
      80,
      defaults.SITE_PROFILE.githubHandle
    ),
    githubUrl,
    linkedinHandle: cleanText(
      rawProfile?.linkedinHandle,
      80,
      defaults.SITE_PROFILE.linkedinHandle
    ),
    linkedinUrl,
    telegramHandle: cleanText(
      rawProfile?.telegramHandle,
      80,
      defaults.SITE_PROFILE.telegramHandle
    ),
    telegramUrl,
    whatsappUrl,
    portraitSrc,
    heroGreeting: cleanText(
      rawProfile?.heroGreeting,
      80,
      defaults.SITE_PROFILE.heroGreeting
    ),
    heroIntro: cleanText(
      rawProfile?.heroIntro,
      800,
      defaults.SITE_PROFILE.heroIntro
    ),
    shortPhilosophy: cleanText(
      rawProfile?.shortPhilosophy,
      400,
      defaults.SITE_PROFILE.shortPhilosophy
    ),
    copyrightYear,
    availabilityNote: cleanText(
      rawProfile?.availabilityNote,
      300,
      defaults.SITE_PROFILE.availabilityNote
    ),
    heroMetrics: heroMetrics.length > 0 ? heroMetrics : [...defaults.SITE_PROFILE.heroMetrics],
  };

  // 2. PROJECTS
  if (!Array.isArray(raw.PROJECTS) || raw.PROJECTS.length === 0) {
    errors.push('At least one project is required.');
  }

  const seenSlugs = new Set<string>();
  const PROJECTS: ProjectItem[] = Array.isArray(raw.PROJECTS)
    ? raw.PROJECTS.slice(0, 40).map((item, idx) => {
      const obj = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
      const title = cleanText(obj.title, 120);
      const slug = sanitizeSlug(obj.slug || title);
      if (!title) {
        errors.push(`Project #${idx + 1} is missing a title.`);
      }
      if (!slug) {
        errors.push(`Project "${title || `#${idx + 1}`}" needs a valid URL slug.`);
      } else if (seenSlugs.has(slug)) {
        errors.push(`Duplicate project slug "${slug}". Each project slug must be unique.`);
      } else {
        seenSlugs.add(slug);
      }

      const rawCategory = cleanText(obj.category, 60);
      const category: ProjectCategory = ALLOWED_PROJECT_CATEGORIES.includes(
        rawCategory as ProjectCategory
      )
        ? (rawCategory as ProjectCategory)
        : 'Web Applications';

      const defaultHero: ProjectImage = {
        src: '/images/project-aman-pay.png',
        alt: `${title || 'Project'} preview`,
        caption: title || 'Project preview',
        aspect: 'wide',
      };
      const heroImage = sanitizeImage(obj.heroImage, defaultHero);

      const rawGallery = Array.isArray(obj.gallery) ? obj.gallery : [];
      const gallery = rawGallery
        .slice(0, 10)
        .map((img) => sanitizeImage(img, heroImage))
        .filter((img) => Boolean(img.src));

      const rawLive = cleanText(obj.liveUrl, 500);
      const liveUrl = rawLive ? sanitizeSafeUrl(rawLive) ?? undefined : undefined;
      if (rawLive && !liveUrl) {
        errors.push(`Project "${title || slug}" has an invalid Live URL.`);
      }

      const rawGithub = cleanText(obj.githubUrl, 500);
      const githubUrlVal = rawGithub ? sanitizeSafeUrl(rawGithub) ?? undefined : undefined;
      if (rawGithub && !githubUrlVal) {
        errors.push(`Project "${title || slug}" has an invalid GitHub URL.`);
      }

      const challengesRaw = Array.isArray(obj.challengesAndSolutions)
        ? obj.challengesAndSolutions
        : [];
      const challengesAndSolutions = challengesRaw
        .slice(0, 12)
        .map((c) => {
          const cObj = (c && typeof c === 'object' ? c : {}) as Record<string, unknown>;
          return {
            challenge: cleanText(cObj.challenge, 600),
            solution: cleanText(cObj.solution, 600),
          };
        })
        .filter((c) => c.challenge && c.solution);

      const architecture = sanitizeStringArray(obj.architecture, 15, 300);

      return {
        id: cleanText(obj.id, 80) || slug || `project-${idx + 1}`,
        slug: slug || `project-${idx + 1}`,
        title: title || 'Untitled Project',
        subtitle: cleanText(obj.subtitle, 220),
        category,
        originalTag: cleanText(obj.originalTag, 80, category),
        year: cleanText(obj.year, 16, String(copyrightYear)),
        status: cleanText(obj.status, 60, 'Live Deployment'),
        featured: Boolean(obj.featured),
        featuredSpan: obj.featuredSpan === 'wide' ? 'wide' : 'standard',
        role: cleanText(obj.role, 100, 'Full-Stack Developer'),
        summary: cleanText(obj.summary, 600),
        overview: cleanText(obj.overview, 1600),
        problemStatement: cleanText(obj.problemStatement, 1000),
        objectives: sanitizeStringArray(obj.objectives, 12, 300),
        contribution: cleanText(obj.contribution, 1000),
        technologies: sanitizeStringArray(obj.technologies, 24, 50),
        keyFeatures: sanitizeStringArray(obj.keyFeatures, 15, 300),
        ...(architecture.length > 0 ? { architecture } : {}),
        ...(challengesAndSolutions.length > 0 ? { challengesAndSolutions } : {}),
        heroImage,
        gallery: gallery.length > 0 ? gallery : [heroImage],
        ...(liveUrl ? { liveUrl } : {}),
        ...(githubUrlVal ? { githubUrl: githubUrlVal } : {}),
      };
    })
    : defaults.PROJECTS;

  // 3. SKILL_CATEGORIES
  const SKILL_CATEGORIES: SkillCategory[] = Array.isArray(raw.SKILL_CATEGORIES)
    ? raw.SKILL_CATEGORIES.slice(0, 20)
      .map((cat, idx) => {
        const obj = (cat && typeof cat === 'object' ? cat : {}) as Record<string, unknown>;
        const name = cleanText(obj.name, 80);
        return {
          id: sanitizeSlug(obj.id || name) || `skill-cat-${idx + 1}`,
          index: cleanText(obj.index, 12, String(idx + 1).padStart(2, '0')),
          name,
          description: cleanText(obj.description, 300),
          items: sanitizeStringArray(obj.items, 30, 60),
        };
      })
      .filter((cat) => Boolean(cat.name))
    : defaults.SKILL_CATEGORIES;

  // 4. EXPERIENCES
  const EXPERIENCES: ExperienceItem[] = Array.isArray(raw.EXPERIENCES)
    ? raw.EXPERIENCES.slice(0, 25)
      .map((exp, idx) => {
        const obj = (exp && typeof exp === 'object' ? exp : {}) as Record<string, unknown>;
        const organization = cleanText(obj.organization, 140);
        const roleVal = cleanText(obj.role, 140);
        const rawOrgUrl = cleanText(obj.organizationUrl, 400);
        const organizationUrl = rawOrgUrl
          ? sanitizeSafeUrl(rawOrgUrl) ?? undefined
          : undefined;
        if (rawOrgUrl && !organizationUrl) {
          errors.push(`Experience "${organization || `#${idx + 1}`}" has an invalid URL.`);
        }
        const pointsRaw = Array.isArray(obj.points) ? obj.points : [];
        const points: ExperiencePoint[] = pointsRaw
          .slice(0, 12)
          .map((pt) => {
            const pObj = (pt && typeof pt === 'object' ? pt : {}) as Record<string, unknown>;
            const lead = cleanText(pObj.lead, 100);
            return {
              ...(lead ? { lead } : {}),
              text: cleanText(pObj.text, 450),
            };
          })
          .filter((pt) => Boolean(pt.text));

        return {
          id: sanitizeSlug(obj.id || organization) || `exp-${idx + 1}`,
          organization,
          ...(organizationUrl ? { organizationUrl } : {}),
          ...(cleanText(obj.organizationUrlLabel, 80)
            ? { organizationUrlLabel: cleanText(obj.organizationUrlLabel, 80) }
            : {}),
          role: roleVal,
          period: cleanText(obj.period, 60),
          shortYear: cleanText(obj.shortYear, 32),
          location: cleanText(obj.location, 120),
          summary: cleanText(obj.summary, 600),
          points,
          stack: sanitizeStringArray(obj.stack, 20, 50),
        };
      })
      .filter((exp) => Boolean(exp.organization && exp.role))
    : defaults.EXPERIENCES;

  // 5. PHILOSOPHY_PILLARS
  const PHILOSOPHY_PILLARS: PhilosophyPillar[] = Array.isArray(raw.PHILOSOPHY_PILLARS)
    ? raw.PHILOSOPHY_PILLARS.slice(0, 12)
      .map((pillar, idx) => {
        const obj = (pillar && typeof pillar === 'object' ? pillar : {}) as Record<
          string,
          unknown
        >;
        return {
          index: cleanText(obj.index, 10, String(idx + 1).padStart(2, '0')),
          title: cleanText(obj.title, 120),
          description: cleanText(obj.description, 500),
        };
      })
      .filter((p) => Boolean(p.title && p.description))
    : defaults.PHILOSOPHY_PILLARS;

  // 6. TECHNICAL_INTERESTS
  const TECHNICAL_INTERESTS: TechnicalInterest[] = Array.isArray(raw.TECHNICAL_INTERESTS)
    ? raw.TECHNICAL_INTERESTS.slice(0, 16)
      .map((interest) => {
        const obj = (interest && typeof interest === 'object' ? interest : {}) as Record<
          string,
          unknown
        >;
        return {
          title: cleanText(obj.title, 120),
          description: cleanText(obj.description, 500),
        };
      })
      .filter((i) => Boolean(i.title && i.description))
    : defaults.TECHNICAL_INTERESTS;

  // 7. SOCIAL_LINKS
  const SOCIAL_LINKS: SocialLink[] = Array.isArray(raw.SOCIAL_LINKS)
    ? raw.SOCIAL_LINKS.slice(0, 16)
      .map((link, idx) => {
        const obj = (link && typeof link === 'object' ? link : {}) as Record<string, unknown>;
        const label = cleanText(obj.label, 60);
        const href = sanitizeSafeUrl(obj.href, {
          allowMailto: true,
          allowTel: true,
        });
        if (label && !href) {
          errors.push(`Social link "${label}" has an invalid URL.`);
        }
        return {
          id: sanitizeSlug(obj.id || label) || `social-${idx + 1}`,
          label,
          handle: cleanText(obj.handle, 120),
          href: href || '',
          external: Boolean(obj.external),
        };
      })
      .filter((s) => Boolean(s.label && s.href))
    : defaults.SOCIAL_LINKS;

  // 8. NAVIGATION_LINKS
  const NAVIGATION_LINKS: NavigationLink[] = Array.isArray(raw.NAVIGATION_LINKS)
    ? raw.NAVIGATION_LINKS.slice(0, 10)
      .map((nav) => {
        const obj = (nav && typeof nav === 'object' ? nav : {}) as Record<string, unknown>;
        const pathVal = sanitizeSafeUrl(obj.path, { allowRelative: true });
        return {
          label: cleanText(obj.label, 40),
          path: pathVal || '/',
        };
      })
      .filter((n) => Boolean(n.label))
    : defaults.NAVIGATION_LINKS;

  // 9. BLOG_SETTINGS
  const rawBlog =
    raw.BLOG_SETTINGS && typeof raw.BLOG_SETTINGS === 'object'
      ? (raw.BLOG_SETTINGS as Record<string, unknown>)
      : null;

  let telegramChannel = DEFAULT_BLOG_SETTINGS.telegramChannel;
  if (rawBlog && typeof rawBlog.telegramChannel === 'string' && rawBlog.telegramChannel.trim()) {
    const cleanChannel = sanitizeTelegramUsername(rawBlog.telegramChannel);
    if (!cleanChannel) {
      errors.push(
        'Telegram channel username must be 5–32 letters, numbers, or underscores (e.g. abysiniyatech).'
      );
    } else {
      telegramChannel = cleanChannel;
    }
  }

  const BLOG_SETTINGS: BlogSettings = {
    telegramChannel,
    subtitle: cleanText(
      rawBlog?.subtitle,
      300,
      DEFAULT_BLOG_SETTINGS.subtitle
    ),
  };

  // 10. THEME_TOKENS
  const THEME_TOKENS = raw.THEME_TOKENS
    ? sanitizeThemeTokens(raw.THEME_TOKENS)
    : sanitizeThemeTokens(DEFAULT_THEME_TOKENS);

  // 11. SEO_SETTINGS
  const rawSeo =
    raw.SEO_SETTINGS && typeof raw.SEO_SETTINGS === 'object'
      ? (raw.SEO_SETTINGS as Record<string, unknown>)
      : null;

  const SEO_SETTINGS: SeoSettings = {
    defaultTitle: cleanText(
      rawSeo?.defaultTitle,
      120,
      DEFAULT_SEO_SETTINGS.defaultTitle
    ),
    titleTemplate: cleanText(
      rawSeo?.titleTemplate,
      80,
      DEFAULT_SEO_SETTINGS.titleTemplate
    ),
    defaultDescription: cleanText(
      rawSeo?.defaultDescription,
      320,
      DEFAULT_SEO_SETTINGS.defaultDescription
    ),
    keywords: rawSeo && Array.isArray(rawSeo.keywords)
      ? sanitizeStringArray(rawSeo.keywords, 30, 60)
      : [...DEFAULT_SEO_SETTINGS.keywords],
    twitterCreator: cleanText(
      rawSeo?.twitterCreator,
      50,
      DEFAULT_SEO_SETTINGS.twitterCreator
    ),
    ogImage:
      sanitizeSafeUrl(rawSeo?.ogImage, { allowRelative: true }) ??
      DEFAULT_SEO_SETTINGS.ogImage,
  };

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      SITE_PROFILE,
      NAVIGATION_LINKS:
        NAVIGATION_LINKS.length > 0 ? NAVIGATION_LINKS : defaults.NAVIGATION_LINKS,
      SOCIAL_LINKS: SOCIAL_LINKS.length > 0 ? SOCIAL_LINKS : defaults.SOCIAL_LINKS,
      PHILOSOPHY_PILLARS,
      TECHNICAL_INTERESTS,
      SKILL_CATEGORIES,
      EXPERIENCES,
      PROJECT_CATEGORIES: ['All', ...ALLOWED_PROJECT_CATEGORIES],
      PROJECTS,
      BLOG_SETTINGS,
      THEME_TOKENS,
      SEO_SETTINGS,
    },
  };
}

export type AdminSectionKey =
  | 'profile'
  | 'projects'
  | 'skills'
  | 'experience'
  | 'about'
  | 'contact'
  | 'navigation'
  | 'appearance'
  | 'media'
  | 'seo'
  | 'settings';

export function getDirtySections(
  saved: PortfolioBundle,
  draft: PortfolioBundle
): AdminSectionKey[] {
  const dirty: AdminSectionKey[] = [];

  const profilePick = (b: PortfolioBundle) => ({
    brand: b.SITE_PROFILE.brand,
    fullName: b.SITE_PROFILE.fullName,
    role: b.SITE_PROFILE.role,
    location: b.SITE_PROFILE.location,
    portraitSrc: b.SITE_PROFILE.portraitSrc,
    heroGreeting: b.SITE_PROFILE.heroGreeting,
    heroIntro: b.SITE_PROFILE.heroIntro,
    availabilityNote: b.SITE_PROFILE.availabilityNote,
    heroMetrics: b.SITE_PROFILE.heroMetrics,
  });

  if (JSON.stringify(profilePick(saved)) !== JSON.stringify(profilePick(draft))) {
    dirty.push('profile');
  }
  if (JSON.stringify(saved.PROJECTS) !== JSON.stringify(draft.PROJECTS)) {
    dirty.push('projects');
  }
  if (JSON.stringify(saved.SKILL_CATEGORIES) !== JSON.stringify(draft.SKILL_CATEGORIES)) {
    dirty.push('skills');
  }
  if (JSON.stringify(saved.EXPERIENCES) !== JSON.stringify(draft.EXPERIENCES)) {
    dirty.push('experience');
  }
  if (
    JSON.stringify(saved.PHILOSOPHY_PILLARS) !== JSON.stringify(draft.PHILOSOPHY_PILLARS) ||
    JSON.stringify(saved.TECHNICAL_INTERESTS) !== JSON.stringify(draft.TECHNICAL_INTERESTS)
  ) {
    dirty.push('about');
  }

  const contactPick = (b: PortfolioBundle) => ({
    email: b.SITE_PROFILE.email,
    phoneDisplay: b.SITE_PROFILE.phoneDisplay,
    githubHandle: b.SITE_PROFILE.githubHandle,
    githubUrl: b.SITE_PROFILE.githubUrl,
    linkedinHandle: b.SITE_PROFILE.linkedinHandle,
    linkedinUrl: b.SITE_PROFILE.linkedinUrl,
    telegramHandle: b.SITE_PROFILE.telegramHandle,
    telegramUrl: b.SITE_PROFILE.telegramUrl,
    whatsappUrl: b.SITE_PROFILE.whatsappUrl,
    SOCIAL_LINKS: b.SOCIAL_LINKS,
    BLOG_SETTINGS: b.BLOG_SETTINGS,
  });

  if (JSON.stringify(contactPick(saved)) !== JSON.stringify(contactPick(draft))) {
    dirty.push('contact');
  }

  const navPick = (b: PortfolioBundle) => ({
    NAVIGATION_LINKS: b.NAVIGATION_LINKS,
    PROJECT_CATEGORIES: b.PROJECT_CATEGORIES,
    shortPhilosophy: b.SITE_PROFILE.shortPhilosophy,
    copyrightYear: b.SITE_PROFILE.copyrightYear,
  });

  if (JSON.stringify(navPick(saved)) !== JSON.stringify(navPick(draft))) {
    dirty.push('navigation');
  }

  if (
    JSON.stringify(saved.THEME_TOKENS ?? DEFAULT_THEME_TOKENS) !==
    JSON.stringify(draft.THEME_TOKENS ?? DEFAULT_THEME_TOKENS)
  ) {
    dirty.push('appearance');
  }

  if (
    JSON.stringify(saved.SEO_SETTINGS ?? DEFAULT_SEO_SETTINGS) !==
    JSON.stringify(draft.SEO_SETTINGS ?? DEFAULT_SEO_SETTINGS)
  ) {
    dirty.push('seo');
  }

  return dirty;
}
