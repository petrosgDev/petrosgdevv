import type { Metadata } from 'next';
import { PROJECTS } from '@/data/portfolio';
import { PROJECT_SLUGS } from '@/data/portfolioVault';
import { getProjectBySlug } from '@/lib/portfolioLogic';
import {
  buildProjectJsonLd,
  buildSafeJsonLdString,
  toAbsoluteAssetUrl,
} from '@/lib/seo';
import { ProjectDetailView } from '@/components/views/ProjectDetailView';

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return PROJECT_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(PROJECTS, slug);

  if (!project) {
    return {
      title: 'Case Study',
      alternates: {
        canonical: `/work/${slug}/`,
      },
    };
  }

  const description = `${project.title} by Petros Geto — ${project.subtitle}. Built with ${project.technologies.slice(0, 4).join(', ')}.`.slice(
    0,
    160
  );
  const heroImageUrl = toAbsoluteAssetUrl(project.heroImage.src);

  return {
    title: `${project.title} — Case Study`,
    description,
    keywords: [
      project.title,
      'Petros Geto',
      project.category,
      ...project.technologies.slice(0, 6),
    ],
    alternates: {
      canonical: `/work/${project.slug}/`,
    },
    openGraph: {
      type: 'article',
      url: `/work/${project.slug}/`,
      title: `${project.title} | Petros Geto`,
      description,
      images: [
        {
          url: heroImageUrl,
          alt: project.heroImage.alt || `${project.title} — Petros Geto`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} | Petros Geto`,
      description,
      images: [heroImageUrl],
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(PROJECTS, slug);
  const projectJsonLd = project ? buildSafeJsonLdString(buildProjectJsonLd(project)) : null;

  return (
    <>
      {projectJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: projectJsonLd }}
        />
      ) : null}
      <ProjectDetailView slug={slug} />
    </>
  );
}
