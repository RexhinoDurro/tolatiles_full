import type { Metadata } from 'next';
import ContentIndexPage from '@/components/pages/ContentIndexPage';

export const metadata: Metadata = {
  title: 'Guides - Tile Installation Guides Jacksonville & St. Augustine FL | Tola Tiles',
  description: 'Step-by-step tile installation guides from Tola Tiles for Jacksonville and St. Augustine FL. Planning, materials, and what to expect from your tile project.',
  keywords: 'tile installation guide florida, tile guides jacksonville, how to tile, tile project planning, northeast florida tile guide',
  alternates: {
    canonical: 'https://tolatiles.com/guides',
  },
};

export default function Guides() {
  return <ContentIndexPage contentType="guide" location="florida" />;
}
