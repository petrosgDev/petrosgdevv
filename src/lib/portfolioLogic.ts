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
