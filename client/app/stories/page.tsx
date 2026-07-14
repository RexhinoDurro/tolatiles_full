import type { Metadata } from 'next';
import ContentIndexPage from '@/components/pages/ContentIndexPage';

export const metadata: Metadata = {
  title: 'Customer Stories - Real Tile Projects Jacksonville & St. Augustine FL | Tola Tiles',
  description: 'Read real customer stories and project stories from Tola Tiles — homeowners we’ve worked with across Jacksonville and St. Augustine FL.',
  keywords: 'tile customer stories florida, tile project stories jacksonville, tola tiles reviews, real tile projects, northeast florida tile stories',
  alternates: {
    canonical: 'https://tolatiles.com/stories',
  },
};

export default function Stories() {
  return <ContentIndexPage contentType="story" location="florida" />;
}
