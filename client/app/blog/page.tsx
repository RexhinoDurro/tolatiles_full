import type { Metadata } from 'next';
import BlogIndexPage from '@/components/pages/BlogIndexPage';

export const metadata: Metadata = {
  title: 'Blog - Tile Installation Tips & Ideas | Tola Tiles',
  description:
    'Expert tile installation tips, design ideas, and industry insights from Tola Tiles. Learn about tile care, trends, and get inspiration for your next project.',
  keywords:
    'tile installation blog, tile tips, tile design ideas, tile maintenance, flooring tips, backsplash ideas, bathroom tile, St Augustine tile',
  alternates: {
    canonical: 'https://tolatiles.com/blog',
  },
};

export default function Blog() {
  return <BlogIndexPage />;
}
