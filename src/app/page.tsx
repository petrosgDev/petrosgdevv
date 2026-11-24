import type { Metadata } from 'next';
import { HomeView } from '@/components/views/HomeView';
import { SEO_CONFIG } from '@/lib/seo';

export const metadata: Metadata = {
  title: {
    absolute: SEO_CONFIG.defaultTitle,
  },
  description: SEO_CONFIG.defaultDescription,
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return <HomeView />;
}
