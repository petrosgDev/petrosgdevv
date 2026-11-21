import type { Metadata } from 'next';
import { WorkView } from '@/components/views/WorkView';

export const metadata: Metadata = {
  title: 'Work',
};

export default function WorkPage() {
  return <WorkView />;
}
