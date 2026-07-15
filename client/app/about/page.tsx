import type { Metadata } from 'next';
import AboutPage from '@/components/pages/AboutPage';

export const metadata: Metadata = {
  title: 'About Us - 15+ Years of Expert Tile Installation in Jacksonville & St. Augustine FL',
  description: 'Learn about Tola Tiles - family-owned tile installation company serving Jacksonville and St. Augustine since 2008. Meet our expert team, discover our values, and see why we\'re the premier choice for tile installation in Northeast Florida.',
  keywords: 'about tola tiles, tile installation company jacksonville, tile contractor northeast florida, family owned tile business, expert tile team florida',
  alternates: {
    canonical: 'https://tolatiles.com/about',
  },
};

export default function About() {
  return <AboutPage location="florida" />;
}
