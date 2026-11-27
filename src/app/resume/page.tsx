import type { Metadata } from 'next';
import { ResumeView } from '@/components/views/ResumeView';
import { buildBreadcrumbJsonLd, buildSafeJsonLdString } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Resume',
  description:
    'Curriculum Vitae and engineering resume of Petros Geto — Software Engineer & AI Developer specializing in Next.js, TypeScript, Node.js, databases, and applied AI.',
  alternates: {
    canonical: '/resume/',
  },
  openGraph: {
    type: 'profile',
    url: '/resume/',
    title: 'Resume — Petros Geto | Software Engineer & AI Developer',
    description:
      'Structured engineering resume covering experience, internships, projects, education, and technical skills of Petros Geto.',
  },
};

export default function ResumePage() {
  const breadcrumbJsonLd = buildSafeJsonLdString(
    buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Resume', path: '/resume' },
    ])
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }}
      />
      <ResumeView />
    </>
  );
}
