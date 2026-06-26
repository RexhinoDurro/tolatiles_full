import type { Metadata } from 'next';
import BlogIndexPage from '@/components/pages/BlogIndexPage';

export const metadata: Metadata = {
  title: 'Blog - Tile Installation Tips & Ideas Jacksonville & St. Augustine FL | Tola Tiles',
  description: 'Expert tile installation tips, design ideas, and industry insights from Tola Tiles for Jacksonville and St. Augustine FL. Learn about tile care, trends, and get inspiration for your next project.',
  keywords: 'tile installation blog florida, tile tips jacksonville, tile design ideas, tile maintenance, flooring tips, backsplash ideas, bathroom tile northeast florida',
  alternates: {
    canonical: 'https://tolatiles.com/blog',
  },
};

export default function Blog() {
  return <BlogIndexPage location="florida" />;
}
