import type { ProjectCategory, ProjectItem } from '../data/portfolio';

export type CategoryFilter = 'All' | ProjectCategory;

export function filterProjects(
  projects: readonly ProjectItem[],
  category: CategoryFilter,
  searchQuery: string
): ProjectItem[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return projects.filter((project) => {
    const matchesCategory = category === 'All' || project.category === category;
    if (!matchesCategory) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchableText = [
      project.title,
      project.subtitle,
      project.summary,
      project.category,
      project.originalTag,
      project.role,
      ...project.technologies,
    ]
      .join(' ')
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}

export function getCategoryCounts(
  projects: readonly ProjectItem[]
): Record<CategoryFilter, number> {
  const counts: Record<CategoryFilter, number> = {
    All: projects.length,
    'Web Applications': 0,
    'Brand & Hospitality': 0,
    'Desktop & Systems': 0,
    Mobile: 0,
  };

  for (const project of projects) {
    counts[project.category] += 1;
  }

  return counts;
}

export function getProjectBySlug(
  projects: readonly ProjectItem[],
  slug: string
): ProjectItem | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getAdjacentProjects(
  projects: readonly ProjectItem[],
  currentSlug: string
): { previous: ProjectItem | null; next: ProjectItem | null } {
  if (projects.length <= 1) {
    return { previous: null, next: null };
  }

  const index = projects.findIndex((project) => project.slug === currentSlug);
  if (index === -1) {
    return { previous: null, next: null };
  }

  const prevIndex = (index - 1 + projects.length) % projects.length;
  const nextIndex = (index + 1) % projects.length;

  return {
    previous: projects[prevIndex],
    next: projects[nextIndex],
  };
}

export function getRelatedProjects(
  projects: readonly ProjectItem[],
  currentSlug: string,
  limit = 2
): ProjectItem[] {
  const current = getProjectBySlug(projects, currentSlug);
  if (!current) {
    return [];
  }

  const others = projects.filter((project) => project.slug !== currentSlug);
  const sameCategory = others.filter((project) => project.category === current.category);
  const differentCategory = others.filter((project) => project.category !== current.category);

  return [...sameCategory, ...differentCategory].slice(0, limit);
}

export function getFeaturedProjects(projects: readonly ProjectItem[]): ProjectItem[] {
  return projects.filter((project) => project.featured);
}

export interface ExperiencePosition {
  id: string;
  top: number;
}

export function getActiveExperienceId(
  positions: readonly ExperiencePosition[],
  activationOffset = 240,
  isAtBottom = false
): string | null {
  if (positions.length === 0) {
    return null;
  }

  if (isAtBottom) {
    return positions[positions.length - 1].id;
  }

  let activeId = positions[0].id;
  for (const entry of positions) {
    if (entry.top <= activationOffset) {
      activeId = entry.id;
    } else {
      break;
    }
  }

  return activeId;
}

export interface IframePreviewMetrics {
  scale: number;
  iframeWidth: number;
  iframeHeight: number;
}

export function computeIframePreviewMetrics(
  containerWidth: number,
  containerHeight: number,
  virtualWidth = 1440
): IframePreviewMetrics {
  const safeVirtualWidth = Math.max(320, Math.round(virtualWidth));

  if (containerWidth <= 0 || containerHeight <= 0) {
    return {
      scale: 1,
      iframeWidth: safeVirtualWidth,
      iframeHeight: 900,
    };
  }

  const rawScale = containerWidth / safeVirtualWidth;
  const scale = Number(Math.min(1, Math.max(0.1, rawScale)).toFixed(4));
  const iframeWidth = safeVirtualWidth;
  const iframeHeight = Math.max(240, Math.ceil(containerHeight / scale));

  return {
    scale,
    iframeWidth,
    iframeHeight,
  };
}

export function formatLiveHost(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    return '';
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./i, '');
    const path = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname.replace(/\/+$/, '') : '';
    return `${host}${path}`;
  } catch {
    return trimmed.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/+$/, '');
  }
}

export interface SplashSkipOptions {
  search: string;
  sessionSeen: boolean;
  prefersReducedMotion: boolean;
}

export function shouldSkipSplash({
  search,
  sessionSeen,
  prefersReducedMotion,
}: SplashSkipOptions): boolean {
  if (sessionSeen || prefersReducedMotion) {
    return true;
  }

  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  return params.get('nosplash') === '1' || params.get('autostart') === '1';
}

