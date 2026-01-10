import type { Metadata } from 'next';
import AboutPage from '@/components/pages/AboutPage';

export const metadata: Metadata = {
  title: 'About Tola Tiles - 15+ Years of Expert Tile Installation | Our Story & Team',
  description:
    "Learn about Tola Tiles - family-owned tile installation company since 2008. Meet our expert team, discover our values, and see why we're the premier choice for tile installation.",
  keywords: 'about tola tiles, tile installation company, tile contractor history, expert tile team, family owned business, tile installation experience',
  alternates: {
    canonical: 'https://tolatiles.com/about',
  },
};

export default function About() {
  return <AboutPage />;
}
