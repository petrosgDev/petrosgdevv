import { decodeVault } from '@/lib/dataShield';
import { PORTFOLIO_VAULT } from '@/data/portfolioVault';
import { DEFAULT_THEME_TOKENS, type ThemeTokensConfig } from '@/lib/themeSystem';

export type ProjectCategory =
  | 'Web Applications'
  | 'Brand & Hospitality'
  | 'Desktop & Systems'
  | 'Mobile';

export interface ProjectImage {
  src: string;
  alt: string;
  caption: string;
  aspect: 'wide' | 'standard' | 'portrait';
}

export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: ProjectCategory;
  originalTag: string;
  year: string;
  status: string;
  featured: boolean;
  featuredSpan: 'wide' | 'standard';
  role: string;
  summary: string;
  overview: string;
  problemStatement: string;
  objectives: string[];
  contribution: string;
  technologies: string[];
  keyFeatures: string[];
  architecture?: string[];
  challengesAndSolutions?: {
    challenge: string;
    solution: string;
  }[];
  heroImage: ProjectImage;
  gallery: ProjectImage[];
  liveUrl?: string;
  githubUrl?: string;
}

export interface SkillCategory {
  id: string;
  index: string;
  name: string;
  description: string;
  items: string[];
}

export interface ExperiencePoint {
  lead?: string;
  text: string;
}

export interface ExperienceItem {
  id: string;
  organization: string;
  organizationUrl?: string;
  organizationUrlLabel?: string;
  role: string;
  period: string;
  shortYear: string;
  location: string;
  summary: string;
  points: ExperiencePoint[];
  stack: string[];
}

export interface SocialLink {
  id: string;
  label: string;
  handle: string;
  href: string;
  external: boolean;
}

export interface PhilosophyPillar {
  index: string;
  title: string;
  description: string;
}

export interface TechnicalInterest {
  title: string;
  description: string;
}

export interface HeroMetric {
  value: string;
  label: string;
}

export interface SiteProfile {
  brand: string;
  fullName: string;
  role: string;
  location: string;
  email: string;
  phoneDisplay: string;
  githubHandle: string;
  githubUrl: string;
  linkedinHandle: string;
  linkedinUrl: string;
  telegramHandle: string;
  telegramUrl: string;
  whatsappUrl: string;
  portraitSrc: string;
  heroGreeting: string;
  heroIntro: string;
  shortPhilosophy: string;
  copyrightYear: number;
  availabilityNote: string;
  heroMetrics: readonly HeroMetric[];
}

export interface NavigationLink {
  label: string;
  path: string;
}

export interface BlogSettings {
  telegramChannel: string;
  subtitle: string;
}

export interface SeoSettings {
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  keywords: string[];
  twitterCreator: string;
  ogImage: string;
}

export interface PortfolioBundle {
  SITE_PROFILE: SiteProfile;
  NAVIGATION_LINKS: NavigationLink[];
  SOCIAL_LINKS: SocialLink[];
  PHILOSOPHY_PILLARS: PhilosophyPillar[];
  TECHNICAL_INTERESTS: TechnicalInterest[];
  SKILL_CATEGORIES: SkillCategory[];
  EXPERIENCES: ExperienceItem[];
  PROJECT_CATEGORIES: readonly ('All' | ProjectCategory)[];
  PROJECTS: ProjectItem[];
  BLOG_SETTINGS?: BlogSettings;
  THEME_TOKENS?: ThemeTokensConfig;
  SEO_SETTINGS?: SeoSettings;
}

export const DEFAULT_BLOG_SETTINGS: BlogSettings = {
  telegramChannel: 'abysiniyatech',
  subtitle:
    'Engineering notes, tech industry dispatches, and software updates synced directly from my Telegram channel.',
};

export const DEFAULT_SEO_SETTINGS: SeoSettings = {
  defaultTitle: 'Petros Geto | Software Engineer & AI Developer',
  titleTemplate: '%s | Petros Geto',
  defaultDescription:
    'Petros Geto — Software Engineer & AI Developer in Addis Ababa specializing in AI-powered systems, full-stack web apps, and scalable digital products.',
  keywords: [
    'Petros Geto',
    'PETROS G DEV',
    'Software Engineer Ethiopia',
    'Full-Stack Developer Addis Ababa',
    'AI Developer Ethiopia',
    'Next.js Developer Ethiopia',
  ],
  twitterCreator: '@petrosgdev',
  ogImage: '/og-card/',
};

const decodedBundle = decodeVault<PortfolioBundle>(PORTFOLIO_VAULT);

export function getDefaultPortfolioBundle(): PortfolioBundle {
  const cloned = JSON.parse(JSON.stringify(decodedBundle)) as PortfolioBundle;
  cloned.BLOG_SETTINGS = {
    ...DEFAULT_BLOG_SETTINGS,
    ...(cloned.BLOG_SETTINGS ?? {}),
  };
  cloned.THEME_TOKENS = JSON.parse(JSON.stringify(DEFAULT_THEME_TOKENS)) as ThemeTokensConfig;
  cloned.SEO_SETTINGS = {
    ...DEFAULT_SEO_SETTINGS,
    ...(cloned.SEO_SETTINGS ?? {}),
    keywords: [...(cloned.SEO_SETTINGS?.keywords ?? DEFAULT_SEO_SETTINGS.keywords)],
  };
  return cloned;
}

export const SITE_PROFILE: SiteProfile = decodedBundle.SITE_PROFILE;
export const NAVIGATION_LINKS: readonly NavigationLink[] = decodedBundle.NAVIGATION_LINKS;
export const SOCIAL_LINKS: SocialLink[] = decodedBundle.SOCIAL_LINKS;
export const PHILOSOPHY_PILLARS: PhilosophyPillar[] = decodedBundle.PHILOSOPHY_PILLARS;
export const TECHNICAL_INTERESTS: TechnicalInterest[] = decodedBundle.TECHNICAL_INTERESTS;
export const SKILL_CATEGORIES: SkillCategory[] = decodedBundle.SKILL_CATEGORIES;
export const EXPERIENCES: ExperienceItem[] = decodedBundle.EXPERIENCES;
export const PROJECT_CATEGORIES: readonly ('All' | ProjectCategory)[] =
  decodedBundle.PROJECT_CATEGORIES;
export const PROJECTS: ProjectItem[] = decodedBundle.PROJECTS;
