import type { Metadata } from 'next';
import { ContactView } from '@/components/views/ContactView';

export const metadata: Metadata = {
  title: 'Contact',
};

export default function ContactPage() {
  return <ContactView />;
}
