export interface ThemePaletteTokens {
  // Surfaces & Borders
  pageBg: string;
  sectionBg: string;
  cardBg: string;
  borderColor: string;

  // Headers, Nav Bars & Floating Docks
  headerWordmark: string;
  headerFadeBg: string;
  navBarBg: string;
  navBarBorder: string;
  navActivePillBg: string;
  navActiveText: string;
  navInactiveText: string;
  socialRailBg: string;
  socialRailText: string;

  // Typography & Links
  headingText: string;
  bodyText: string;
  mutedText: string;
  linkText: string;

  // Buttons & Accents
  primaryBtnBg: string;
  primaryBtnText: string;
  secondaryBtnBorder: string;
  accentColor: string;

  // Closing CTA & Footer Bar
  ctaBg: string;
  ctaHeading: string;
  ctaText: string;
  footerBg: string;
  footerHeading: string;
  footerText: string;
  footerBorder: string;
}

export interface ThemeTokensConfig {
  light: ThemePaletteTokens;
  dark: ThemePaletteTokens;
}

export const DEFAULT_LIGHT_TOKENS: ThemePaletteTokens = {
  pageBg: '#FFFFFF',
  sectionBg: '#FAFAFA',
  cardBg: '#F6F6F5',
  borderColor: '#EAEAEA',

  headerWordmark: '#1A1A1A',
  headerFadeBg: '#FFFFFF',
  navBarBg: '#F5F5F4',
  navBarBorder: '#E5E5E3',
  navActivePillBg: '#FFFFFF',
  navActiveText: '#111110',
  navInactiveText: '#686864',
  socialRailBg: '#F5F5F4',
  socialRailText: '#5A5A56',

  headingText: '#1A1A1A',
  bodyText: '#2A2A2A',
  mutedText: '#666666',
  linkText: '#1A1A1A',

  primaryBtnBg: '#1A1A1A',
  primaryBtnText: '#FFFFFF',
  secondaryBtnBorder: '#DFDFDD',
  accentColor: '#1A1A1A',

  ctaBg: '#141414',
  ctaHeading: '#FFFFFF',
  ctaText: '#A3A39E',
  footerBg: '#FFFFFF',
  footerHeading: '#1A1A1A',
  footerText: '#666666',
  footerBorder: '#EAEAEA',
};

export const DEFAULT_DARK_TOKENS: ThemePaletteTokens = {
  pageBg: '#0A0A0A',
  sectionBg: '#111110',
  cardBg: '#141413',
  borderColor: '#222220',

  headerWordmark: '#F0F0EE',
  headerFadeBg: '#0A0A0A',
  navBarBg: '#17191C',
  navBarBorder: '#2C2F35',
  navActivePillBg: '#2B2E33',
  navActiveText: '#F5F5F3',
  navInactiveText: '#A3A6AB',
  socialRailBg: '#17191C',
  socialRailText: '#A8ABB0',

  headingText: '#F0F0EE',
  bodyText: '#D4D4D0',
  mutedText: '#9A9A96',
  linkText: '#F0F0EE',

  primaryBtnBg: '#F0F0EE',
  primaryBtnText: '#0A0A0A',
  secondaryBtnBorder: '#2E2E2B',
  accentColor: '#F0F0EE',

  ctaBg: '#141414',
  ctaHeading: '#FFFFFF',
  ctaText: '#A3A39E',
  footerBg: '#0A0A0A',
  footerHeading: '#F0F0EE',
  footerText: '#9A9A96',
  footerBorder: '#222220',
};

export const DEFAULT_THEME_TOKENS: ThemeTokensConfig = {
  light: { ...DEFAULT_LIGHT_TOKENS },
  dark: { ...DEFAULT_DARK_TOKENS },
};

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  tokens: ThemeTokensConfig;
}

export const THEME_PRESETS: readonly ThemePreset[] = [
  {
    id: 'editorial-monochrome',
    name: 'Editorial Monochrome (Default)',
    description: 'Original crisp monochrome editorial palette matching the shipped portfolio.',
    tokens: {
      light: { ...DEFAULT_LIGHT_TOKENS },
      dark: { ...DEFAULT_DARK_TOKENS },
    },
  },
  {
    id: 'warm-paper',
    name: 'Warm Ivory & Espresso',
    description: 'Archival warm stone paper with deep espresso ink and subtle brass highlights.',
    tokens: {
      light: {
        pageBg: '#FAF8F5',
        sectionBg: '#F3EFE8',
        cardBg: '#EFEAE1',
        borderColor: '#E3DDD2',
        headerWordmark: '#231D18',
        headerFadeBg: '#FAF8F5',
        navBarBg: '#F0ECE4',
        navBarBorder: '#DDD6CA',
        navActivePillBg: '#FFFFFF',
        navActiveText: '#231D18',
        navInactiveText: '#6E645A',
        socialRailBg: '#F0ECE4',
        socialRailText: '#5F564D',
        headingText: '#231D18',
        bodyText: '#3A312A',
        mutedText: '#72675D',
        linkText: '#8C5E34',
        primaryBtnBg: '#231D18',
        primaryBtnText: '#FAF8F5',
        secondaryBtnBorder: '#CFC7B9',
        accentColor: '#8C5E34',
        ctaBg: '#231D18',
        ctaHeading: '#FAF8F5',
        ctaText: '#C4B9AD',
        footerBg: '#FAF8F5',
        footerHeading: '#231D18',
        footerText: '#72675D',
        footerBorder: '#E3DDD2',
      },
      dark: {
        pageBg: '#12100E',
        sectionBg: '#181512',
        cardBg: '#1D1A16',
        borderColor: '#2B2621',
        headerWordmark: '#F2ECE4',
        headerFadeBg: '#12100E',
        navBarBg: '#1E1A17',
        navBarBorder: '#342D27',
        navActivePillBg: '#322B24',
        navActiveText: '#F7F2EA',
        navInactiveText: '#A89E92',
        socialRailBg: '#1E1A17',
        socialRailText: '#B2A79B',
        headingText: '#F2ECE4',
        bodyText: '#DDD5CA',
        mutedText: '#A59A8E',
        linkText: '#D9A773',
        primaryBtnBg: '#F2ECE4',
        primaryBtnText: '#12100E',
        secondaryBtnBorder: '#3E362F',
        accentColor: '#D9A773',
        ctaBg: '#1B1714',
        ctaHeading: '#F7F2EA',
        ctaText: '#B6ABA0',
        footerBg: '#12100E',
        footerHeading: '#F2ECE4',
        footerText: '#A59A8E',
        footerBorder: '#2B2621',
      },
    },
  },
  {
    id: 'nordic-cobalt',
    name: 'Nordic Slate & Cobalt',
    description: 'Cool architectural slate surfaces paired with restrained cobalt links and pills.',
    tokens: {
      light: {
        pageBg: '#F8FAFC',
        sectionBg: '#F1F5F9',
        cardBg: '#E9EEF5',
        borderColor: '#DCE4EE',
        headerWordmark: '#0F172A',
        headerFadeBg: '#F8FAFC',
        navBarBg: '#EEF2F7',
        navBarBorder: '#D6E0EC',
        navActivePillBg: '#FFFFFF',
        navActiveText: '#1D4ED8',
        navInactiveText: '#475569',
        socialRailBg: '#EEF2F7',
        socialRailText: '#475569',
        headingText: '#0F172A',
        bodyText: '#1E293B',
        mutedText: '#64748B',
        linkText: '#1D4ED8',
        primaryBtnBg: '#0F172A',
        primaryBtnText: '#F8FAFC',
        secondaryBtnBorder: '#CBD5E1',
        accentColor: '#2563EB',
        ctaBg: '#0F172A',
        ctaHeading: '#F8FAFC',
        ctaText: '#94A3B8',
        footerBg: '#F8FAFC',
        footerHeading: '#0F172A',
        footerText: '#64748B',
        footerBorder: '#DCE4EE',
      },
      dark: {
        pageBg: '#090D16',
        sectionBg: '#0F1624',
        cardBg: '#141D2F',
        borderColor: '#1E293B',
        headerWordmark: '#F1F5F9',
        headerFadeBg: '#090D16',
        navBarBg: '#131C2E',
        navBarBorder: '#26334A',
        navActivePillBg: '#23324D',
        navActiveText: '#60A5FA',
        navInactiveText: '#94A3B8',
        socialRailBg: '#131C2E',
        socialRailText: '#94A3B8',
        headingText: '#F8FAFC',
        bodyText: '#CBD5E1',
        mutedText: '#94A3B8',
        linkText: '#60A5FA',
        primaryBtnBg: '#3B82F6',
        primaryBtnText: '#FFFFFF',
        secondaryBtnBorder: '#334155',
        accentColor: '#60A5FA',
        ctaBg: '#0F172A',
        ctaHeading: '#F8FAFC',
        ctaText: '#94A3B8',
        footerBg: '#090D16',
        footerHeading: '#F8FAFC',
        footerText: '#94A3B8',
        footerBorder: '#1E293B',
      },
    },
  },
  {
    id: 'botanical-mineral',
    name: 'Mineral & Deep Sage',
    description: 'Calm botanical neutral canvas with deep forest emerald contrast.',
    tokens: {
      light: {
        pageBg: '#F9FAF8',
        sectionBg: '#F2F5F0',
        cardBg: '#EBF0E8',
        borderColor: '#DCE4D8',
        headerWordmark: '#132219',
        headerFadeBg: '#F9FAF8',
        navBarBg: '#EDF2EB',
        navBarBorder: '#D4DDD0',
        navActivePillBg: '#FFFFFF',
        navActiveText: '#14532D',
        navInactiveText: '#4B5E52',
        socialRailBg: '#EDF2EB',
        socialRailText: '#4B5E52',
        headingText: '#132219',
        bodyText: '#23362B',
        mutedText: '#586B5E',
        linkText: '#15803D',
        primaryBtnBg: '#14532D',
        primaryBtnText: '#F9FAF8',
        secondaryBtnBorder: '#C5D2C0',
        accentColor: '#15803D',
        ctaBg: '#132219',
        ctaHeading: '#F9FAF8',
        ctaText: '#A6B8AC',
        footerBg: '#F9FAF8',
        footerHeading: '#132219',
        footerText: '#586B5E',
        footerBorder: '#DCE4D8',
      },
      dark: {
        pageBg: '#090E0B',
        sectionBg: '#101713',
        cardBg: '#151E19',
        borderColor: '#212E26',
        headerWordmark: '#ECFDF5',
        headerFadeBg: '#090E0B',
        navBarBg: '#141D18',
        navBarBorder: '#27382E',
        navActivePillBg: '#22382B',
        navActiveText: '#4ADE80',
        navInactiveText: '#93A89B',
        socialRailBg: '#141D18',
        socialRailText: '#93A89B',
        headingText: '#F0FDF4',
        bodyText: '#D1E2D7',
        mutedText: '#8DA395',
        linkText: '#4ADE80',
        primaryBtnBg: '#22C55E',
        primaryBtnText: '#052E16',
        secondaryBtnBorder: '#2D4035',
        accentColor: '#4ADE80',
        ctaBg: '#0F1A14',
        ctaHeading: '#F0FDF4',
        ctaText: '#9BB0A3',
        footerBg: '#090E0B',
        footerHeading: '#F0FDF4',
        footerText: '#8DA395',
        footerBorder: '#212E26',
      },
    },
  },
];

const HEX_COLOR_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export function sanitizeHexColor(raw: unknown, fallback: string): string {
  if (typeof raw !== 'string') return fallback;
  const trimmed = raw.trim();
  if (!HEX_COLOR_RE.test(trimmed)) return fallback;
  if (trimmed.length === 4) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return trimmed.toUpperCase();
}

function sanitizePalette(
  raw: unknown,
  defaults: ThemePaletteTokens
): ThemePaletteTokens {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const out = { ...defaults };
  (Object.keys(defaults) as Array<keyof ThemePaletteTokens>).forEach((key) => {
    out[key] = sanitizeHexColor(obj[key], defaults[key]);
  });
  return out;
}

export function sanitizeThemeTokens(raw: unknown): ThemeTokensConfig {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    light: sanitizePalette(obj.light, DEFAULT_LIGHT_TOKENS),
    dark: sanitizePalette(obj.dark, DEFAULT_DARK_TOKENS),
  };
}

export function hasCustomThemeTokens(tokens?: ThemeTokensConfig | null): boolean {
  if (!tokens) return false;
  return (
    JSON.stringify(sanitizeThemeTokens(tokens)) !==
    JSON.stringify(DEFAULT_THEME_TOKENS)
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const normalized = sanitizeHexColor(hex, '#000000').slice(1);
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildModeCssRules(
  tokens: ThemePaletteTokens,
  defaults: ThemePaletteTokens,
  prefix: string,
  rootSelector: string
): string {
  const rules: string[] = [];

  if (tokens.pageBg !== defaults.pageBg) {
    rules.push(
      `${prefix} ${rootSelector}, html${prefix === 'html:not(.dark)' ? ':not(.dark)' : '.dark'} body:has(${rootSelector}) { background-color: ${tokens.pageBg} !important; }`
    );
  }

  if (tokens.sectionBg !== defaults.sectionBg) {
    rules.push(
      `${prefix} ${rootSelector} [class*="bg-[#FAFAFA]"], ${prefix} ${rootSelector} [class*="bg-[#F7F7F5]"], ${prefix} ${rootSelector} [class*="bg-[#111110]"], ${prefix} ${rootSelector} [class*="bg-[#0E0E0D]"] { background-color: ${tokens.sectionBg} !important; }`
    );
  }

  if (tokens.cardBg !== defaults.cardBg) {
    rules.push(
      `${prefix} ${rootSelector} [class*="bg-[#F6F6F5]"], ${prefix} ${rootSelector} [class*="bg-[#F2F2F0]"], ${prefix} ${rootSelector} [class*="bg-[#EFEFED]"], ${prefix} ${rootSelector} [class*="bg-[#141413]"], ${prefix} ${rootSelector} [class*="bg-[#161615]"], ${prefix} ${rootSelector} [class*="bg-[#121211]"] { background-color: ${tokens.cardBg} !important; }`
    );
  }

  if (tokens.borderColor !== defaults.borderColor) {
    rules.push(
      `${prefix} ${rootSelector} [class*="border-[#EAEAEA]"], ${prefix} ${rootSelector} [class*="border-[#222220]"], ${prefix} ${rootSelector} [class*="divide-[#EAEAEA]"], ${prefix} ${rootSelector} [class*="divide-[#222220]"] { border-color: ${tokens.borderColor} !important; }`
    );
  }

  if (tokens.headerWordmark !== defaults.headerWordmark) {
    rules.push(
      `${prefix} ${rootSelector} header > div > a { color: ${tokens.headerWordmark} !important; }`
    );
  }

  if (tokens.headerFadeBg !== defaults.headerFadeBg) {
    rules.push(
      `${prefix} ${rootSelector} header > div[aria-hidden="true"] { background-image: linear-gradient(to bottom, ${hexToRgba(tokens.headerFadeBg, 0.95)}, ${hexToRgba(tokens.headerFadeBg, 0.6)}, transparent) !important; }`
    );
  }

  if (tokens.navBarBg !== defaults.navBarBg || tokens.navBarBorder !== defaults.navBarBorder) {
    rules.push(
      `${prefix} ${rootSelector} header nav, ${prefix} ${rootSelector} nav[aria-label="Mobile quick navigation"], ${prefix} ${rootSelector} #mobile-navigation-drawer, ${prefix} ${rootSelector} header > div > div > a[class*="rounded-full"], ${prefix} ${rootSelector} header > div > div > button[class*="rounded-full"] { background-color: ${hexToRgba(tokens.navBarBg, 0.92)} !important; border-color: ${tokens.navBarBorder} !important; }`
    );
  }

  if (tokens.navActivePillBg !== defaults.navActivePillBg) {
    rules.push(
      `${prefix} ${rootSelector} header nav span.rounded-full, ${prefix} ${rootSelector} nav[aria-label="Mobile quick navigation"] span.rounded-full { background-color: ${tokens.navActivePillBg} !important; }`
    );
  }

  if (tokens.navActiveText !== defaults.navActiveText) {
    rules.push(
      `${prefix} ${rootSelector} header nav a[aria-current="page"], ${prefix} ${rootSelector} nav[aria-label="Mobile quick navigation"] a[aria-current="page"] { color: ${tokens.navActiveText} !important; }`
    );
  }

  if (tokens.navInactiveText !== defaults.navInactiveText) {
    rules.push(
      `${prefix} ${rootSelector} header nav a:not([aria-current="page"]), ${prefix} ${rootSelector} nav[aria-label="Mobile quick navigation"] a:not([aria-current="page"]), ${prefix} ${rootSelector} header > div > div > a[class*="rounded-full"], ${prefix} ${rootSelector} header > div > div > button[class*="rounded-full"] { color: ${tokens.navInactiveText} !important; }`
    );
  }

  if (tokens.socialRailBg !== defaults.socialRailBg) {
    rules.push(
      `${prefix} ${rootSelector} aside[aria-label="Social media accounts"] { background-color: ${hexToRgba(tokens.socialRailBg, 0.92)} !important; border-color: ${tokens.navBarBorder} !important; }`
    );
  }

  if (tokens.socialRailText !== defaults.socialRailText) {
    rules.push(
      `${prefix} ${rootSelector} aside[aria-label="Social media accounts"] a { color: ${tokens.socialRailText} !important; }`
    );
  }

  if (tokens.headingText !== defaults.headingText) {
    rules.push(
      `${prefix} ${rootSelector} main h1, ${prefix} ${rootSelector} main h2, ${prefix} ${rootSelector} main h3 { color: ${tokens.headingText} !important; }`
    );
  }

  if (tokens.bodyText !== defaults.bodyText) {
    rules.push(
      `${prefix} ${rootSelector} main, ${prefix} ${rootSelector} main p, ${prefix} ${rootSelector} main strong, ${prefix} ${rootSelector} main li { color: ${tokens.bodyText}; }`
    );
  }

  if (tokens.mutedText !== defaults.mutedText) {
    rules.push(
      `${prefix} ${rootSelector} main [class*="text-[#666666]"], ${prefix} ${rootSelector} main [class*="text-[#9A9A96]"], ${prefix} ${rootSelector} main [class*="text-[#555555]"], ${prefix} ${rootSelector} main [class*="text-[#6E6E6A]"] { color: ${tokens.mutedText} !important; }`
    );
  }

  if (tokens.linkText !== defaults.linkText) {
    rules.push(
      `${prefix} ${rootSelector} main a:not([class*="rounded-full"]) { color: ${tokens.linkText} !important; text-decoration-color: ${hexToRgba(tokens.linkText, 0.6)} !important; }`
    );
  }

  if (tokens.primaryBtnBg !== defaults.primaryBtnBg || tokens.primaryBtnText !== defaults.primaryBtnText) {
    rules.push(
      `${prefix} ${rootSelector} main a[class*="rounded-full"][class*="bg-[#1A1A1A]"], ${prefix} ${rootSelector} main button[class*="rounded-full"][class*="bg-[#1A1A1A]"], ${prefix} ${rootSelector} main a[class*="rounded-full"][class*="bg-[#F0F0EE]"], ${prefix} ${rootSelector} main button[class*="rounded-full"][class*="bg-[#F0F0EE]"] { background-color: ${tokens.primaryBtnBg} !important; color: ${tokens.primaryBtnText} !important; }`
    );
  }

  if (tokens.secondaryBtnBorder !== defaults.secondaryBtnBorder) {
    rules.push(
      `${prefix} ${rootSelector} main a[class*="rounded-full"][class*="border-"], ${prefix} ${rootSelector} main button[class*="rounded-full"][class*="border-"] { border-color: ${tokens.secondaryBtnBorder} !important; }`
    );
  }

  if (tokens.accentColor !== defaults.accentColor) {
    rules.push(
      `${prefix} ${rootSelector} *:focus-visible { outline-color: ${tokens.accentColor} !important; } ${prefix} ${rootSelector} ::selection { background-color: ${hexToRgba(tokens.accentColor, 0.16)} !important; }`
    );
  }

  if (tokens.ctaBg !== defaults.ctaBg) {
    rules.push(
      `${prefix} ${rootSelector} main section[class*="bg-[#141414]"] { background-color: ${tokens.ctaBg} !important; }`
    );
  }

  if (tokens.ctaHeading !== defaults.ctaHeading) {
    rules.push(
      `${prefix} ${rootSelector} main section[class*="bg-[#141414]"] h2 { color: ${tokens.ctaHeading} !important; }`
    );
  }

  if (tokens.ctaText !== defaults.ctaText) {
    rules.push(
      `${prefix} ${rootSelector} main section[class*="bg-[#141414]"] p { color: ${tokens.ctaText} !important; }`
    );
  }

  if (tokens.footerBg !== defaults.footerBg) {
    rules.push(
      `${prefix} ${rootSelector} footer { background-color: ${tokens.footerBg} !important; }`
    );
  }

  if (tokens.footerHeading !== defaults.footerHeading) {
    rules.push(
      `${prefix} ${rootSelector} footer h2, ${prefix} ${rootSelector} footer ul a { color: ${tokens.footerHeading} !important; }`
    );
  }

  if (tokens.footerText !== defaults.footerText) {
    rules.push(
      `${prefix} ${rootSelector} footer p, ${prefix} ${rootSelector} footer > div > div:last-child a, ${prefix} ${rootSelector} footer > div > div:last-child button { color: ${tokens.footerText} !important; }`
    );
  }

  if (tokens.footerBorder !== defaults.footerBorder) {
    rules.push(
      `${prefix} ${rootSelector} footer, ${prefix} ${rootSelector} footer [class*="border-"] { border-color: ${tokens.footerBorder} !important; }`
    );
  }

  return rules.join('\n');
}

export function buildThemeCss(
  rawTokens: ThemeTokensConfig,
  rootSelector = '[data-portfolio-surface="public"]'
): string {
  const tokens = sanitizeThemeTokens(rawTokens);
  const lightRules = buildModeCssRules(
    tokens.light,
    DEFAULT_LIGHT_TOKENS,
    'html:not(.dark)',
    rootSelector
  );
  const darkRules = buildModeCssRules(
    tokens.dark,
    DEFAULT_DARK_TOKENS,
    'html.dark',
    rootSelector
  );
  return [lightRules, darkRules].filter(Boolean).join('\n');
}
