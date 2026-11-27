import type { MetadataRoute } from 'next';
import { getDefaultPortfolioBundle } from '@/data/portfolio';
import { buildCanonicalUrl, resolveSiteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = resolveSiteUrl();
  const projects = getDefaultPortfolioBundle().PROJECTS;
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: buildCanonicalUrl('/', siteUrl),
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: buildCanonicalUrl('/work', siteUrl),
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: buildCanonicalUrl('/blog', siteUrl),
      lastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: buildCanonicalUrl('/resume', siteUrl),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: buildCanonicalUrl('/contact', siteUrl),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: buildCanonicalUrl(`/work/${project.slug}`, siteUrl),
    lastModified,
    changeFrequency: 'monthly',
    priority: project.featured ? 0.85 : 0.75,
  }));

  return [...staticRoutes, ...projectRoutes];
}
