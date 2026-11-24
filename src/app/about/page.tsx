import type { Metadata } from 'next';
import { AboutView } from '@/components/views/AboutView';
import { buildBreadcrumbJsonLd, buildSafeJsonLdString } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'About',
  description:
    'About Petros Geto — Software Engineer & AI Developer in Addis Ababa, Ethiopia. Debre Birhan University B.Sc. Software Engineering, INSA Summer Camp, and full-stack craft.',
  alternates: {
    canonical: '/about/',
  },
  openGraph: {
    type: 'profile',
    url: '/about/',
    title: 'About Petros Geto | Software Engineer & AI Developer',
    description:
      'Background, education, engineering philosophy, and verified full-stack & AI skills of Petros Geto.',
  },
};

export default function AboutPage() {
  const breadcrumbJsonLd = buildSafeJsonLdString(
    buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'About', path: '/about' },
    ])
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }}
      />
      <AboutView />
    </>
  );
}
