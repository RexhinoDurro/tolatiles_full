import type { Metadata } from 'next';
import ContentIndexPage from '@/components/pages/ContentIndexPage';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import { getContentPosts, getContentCategories } from '@/lib/contentServer';

export const metadata: Metadata = {
  title: 'Guides - Tile Installation Guides Jacksonville & St. Augustine FL | Tola Tiles',
  description: 'Step-by-step tile installation guides from Tola Tiles for Jacksonville and St. Augustine FL. Planning, materials, and what to expect from your tile project.',
  keywords: 'tile installation guide florida, tile guides jacksonville, how to tile, tile project planning, northeast florida tile guide',
  alternates: {
    canonical: 'https://tolatiles.com/guides',
  },
};

export default async function Guides() {
  const [posts, categories] = await Promise.all([
    getContentPosts('guide'),
    getContentCategories(),
  ]);

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://tolatiles.com' },
          { name: 'Guides', url: 'https://tolatiles.com/guides' },
        ]}
      />
      <ContentIndexPage contentType="guide" location="florida" initialPosts={posts} initialCategories={categories} />
    </>
  );
}
