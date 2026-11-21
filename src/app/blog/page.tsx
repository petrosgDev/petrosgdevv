import type { Metadata } from 'next';
import { BlogView } from '@/components/views/BlogView';

export const metadata: Metadata = {
  title: 'Blog',
};

export default function BlogPage() {
  return <BlogView />;
}
