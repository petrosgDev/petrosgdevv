import type { Metadata } from 'next';
import { PROJECTS } from '@/data/portfolio';
import { WorkView } from '@/components/views/WorkView';
import { buildSafeJsonLdString, buildWorkCollectionJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Projects & Work',
  description:
    'Explore software engineering case studies by Petros Geto — Aman Pay, Event Hub, LOCK IN, Ethio Massage, Wende Dubai, Raman Caffe, and native Java & C++ systems.',
  alternates: {
    canonical: '/work/',
  },
  openGraph: {
    type: 'website',
    url: '/work/',
    title: 'Projects & Work | Petros Geto',
    description:
      'Full-stack web platforms, AI-powered applications, mobile apps, and desktop systems engineered by Petros Geto.',
  },
};

export default function WorkPage() {
  const collectionJsonLd = buildSafeJsonLdString(buildWorkCollectionJsonLd(PROJECTS));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: collectionJsonLd }}
      />
      <WorkView />
    </>
  );
}
