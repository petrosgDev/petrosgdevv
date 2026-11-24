import type { Metadata } from 'next';
import { BlogView } from '@/components/views/BlogView';
import { buildBreadcrumbJsonLd, buildSafeJsonLdString } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Tech Blog & Notes',
  description:
    'Engineering notes, AI updates, and software dispatches by Petros Geto synced live from Abyssinia Tech (@abysiniyatech).',
  alternates: {
    canonical: '/blog/',
  },
  openGraph: {
    type: 'website',
    url: '/blog/',
    title: 'Tech Blog & Notes | Petros Geto',
    description:
      'Live engineering notes, AI insights, and technology updates curated by Petros Geto.',
  },
};

export default function BlogPage() {
  const breadcrumbJsonLd = buildSafeJsonLdString(
    buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog' },
    ])
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }}
      />
      <BlogView />
    </>
  );
}
