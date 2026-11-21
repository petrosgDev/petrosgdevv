import type { Metadata } from 'next';
import { PROJECT_SLUGS } from '@/data/portfolioVault';
import { ProjectDetailView } from '@/components/views/ProjectDetailView';

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return PROJECT_SLUGS.map((slug) => ({ slug }));
}

export const metadata: Metadata = {
  title: 'Case Study',
};

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  return <ProjectDetailView slug={slug} />;
}
