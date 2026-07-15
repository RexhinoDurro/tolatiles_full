import type { Metadata } from 'next';
import ContentIndexPage from '@/components/pages/ContentIndexPage';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import { getContentPosts, getContentCategories } from '@/lib/contentServer';

export const metadata: Metadata = {
  title: 'Customer Stories - Real Tile Projects Jacksonville & St. Augustine FL',
  description: 'Read real customer stories and project stories from Tola Tiles — homeowners we’ve worked with across Jacksonville and St. Augustine FL.',
  keywords: 'tile customer stories florida, tile project stories jacksonville, tola tiles reviews, real tile projects, northeast florida tile stories',
  alternates: {
    canonical: 'https://tolatiles.com/stories',
  },
};

export default async function Stories() {
  const [posts, categories] = await Promise.all([
    getContentPosts('story'),
    getContentCategories(),
  ]);

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://tolatiles.com' },
          { name: 'Stories', url: 'https://tolatiles.com/stories' },
        ]}
      />
      <ContentIndexPage contentType="story" location="florida" initialPosts={posts} initialCategories={categories} />
    </>
  );
}
