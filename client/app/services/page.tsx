import type { Metadata } from 'next';
import ServicesPage from '@/components/pages/ServicesPage';

export const metadata: Metadata = {
  title: 'Professional Tile Installation Services Jacksonville FL | Kitchen, Bathroom & Flooring',
  description:
    'Expert tile installation services in Jacksonville, FL for kitchens, bathrooms, patios, and flooring. Licensed professionals with 15+ years experience. Free estimates and 2-year warranty.',
  keywords:
    'tile installation jacksonville fl, kitchen backsplash jacksonville, bathroom tile installation jacksonville, floor tiling jacksonville, tile contractor jacksonville fl, ceramic tile installation jacksonville',
  alternates: {
    canonical: 'https://tolatiles.com/services',
  },
};

export default function Services() {
  return <ServicesPage />;
}
