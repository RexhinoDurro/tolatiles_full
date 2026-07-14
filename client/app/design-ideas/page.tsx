import type { Metadata } from 'next';
import ContentIndexPage from '@/components/pages/ContentIndexPage';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import { getContentPosts, getContentCategories } from '@/lib/contentServer';

export const metadata: Metadata = {
  title: 'Design Ideas - Tile Design Inspiration Jacksonville & St. Augustine FL | Tola Tiles',
  description: 'Browse tile design ideas from Tola Tiles for Jacksonville and St. Augustine FL — kitchen backsplashes, bathrooms, floors, and outdoor spaces.',
  keywords: 'tile design ideas florida, tile inspiration jacksonville, kitchen backsplash ideas, bathroom tile ideas, northeast florida tile design',
  alternates: {
    canonical: 'https://tolatiles.com/design-ideas',
  },
};

export default async function DesignIdeas() {
  const [posts, categories] = await Promise.all([
    getContentPosts('design_idea'),
    getContentCategories(),
  ]);

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://tolatiles.com' },
          { name: 'Design Ideas', url: 'https://tolatiles.com/design-ideas' },
        ]}
      />
      <ContentIndexPage contentType="design_idea" location="florida" initialPosts={posts} initialCategories={categories} />
    </>
  );
}
