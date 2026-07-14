import type { Metadata } from 'next';
import ContentIndexPage from '@/components/pages/ContentIndexPage';

export const metadata: Metadata = {
  title: 'Design Ideas - Tile Design Inspiration Jacksonville & St. Augustine FL | Tola Tiles',
  description: 'Browse tile design ideas from Tola Tiles for Jacksonville and St. Augustine FL — kitchen backsplashes, bathrooms, floors, and outdoor spaces.',
  keywords: 'tile design ideas florida, tile inspiration jacksonville, kitchen backsplash ideas, bathroom tile ideas, northeast florida tile design',
  alternates: {
    canonical: 'https://tolatiles.com/design-ideas',
  },
};

export default function DesignIdeas() {
  return <ContentIndexPage contentType="design_idea" location="florida" />;
}
