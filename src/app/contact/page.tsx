import type { Metadata } from 'next';
import { ContactView } from '@/components/views/ContactView';
import { buildBreadcrumbJsonLd, buildSafeJsonLdString } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact Petros Geto for full-stack software engineering, AI-powered product development, freelance builds, or technical collaborations.',
  alternates: {
    canonical: '/contact/',
  },
  openGraph: {
    type: 'website',
    url: '/contact/',
    title: 'Contact Petros Geto | Software Engineer & AI Developer',
    description:
      'Reach Petros Geto via email, GitHub, LinkedIn, Telegram, or WhatsApp for engineering projects and collaborations.',
  },
};

export default function ContactPage() {
  const breadcrumbJsonLd = buildSafeJsonLdString(
    buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Contact', path: '/contact' },
    ])
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }}
      />
      <ContactView />
    </>
  );
}
