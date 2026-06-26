import type { Metadata } from 'next';
import ServicesPage from '@/components/pages/ServicesPage';

export const metadata: Metadata = {
  title: 'Professional Tile Installation Services Jacksonville & St. Augustine FL | Tola Tiles',
  description: 'Expert tile installation services in Jacksonville and St. Augustine, FL for kitchens, bathrooms, patios, and flooring. Licensed professionals with 15+ years experience. Free estimates and 2-year warranty.',
  keywords: 'tile installation services florida, kitchen backsplash jacksonville, bathroom tile installation st augustine, floor tiling northeast florida, tile contractor jacksonville fl, shower tile installation, patio tile florida',
  alternates: {
    canonical: 'https://tolatiles.com/services',
  },
};

export default function Services() {
  return <ServicesPage location="florida" />;
}
