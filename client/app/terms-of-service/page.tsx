import type { Metadata } from 'next';
import TermsOfServicePage from '@/components/pages/TermsOfServicePage';

export const metadata: Metadata = {
  title: 'Terms of Service | Tola Tiles - Tile Installation Services',
  description:
    'Terms of Service for Tola Tiles. Read our terms and conditions for tile installation services in Jacksonville and surrounding areas.',
  keywords: 'terms of service, terms and conditions, tola tiles terms, service agreement',
  alternates: {
    canonical: 'https://tolatiles.com/terms-of-service',
  },
};

export default function TermsOfService() {
  return <TermsOfServicePage />;
}
