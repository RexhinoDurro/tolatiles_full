import type { Metadata } from 'next';
import HomePage from '@/components/pages/HomePage';
import { DEFAULT_OG_IMAGE } from '@/lib/seo';
import { getHomepageBlogPosts } from '@/lib/blogServer';

// The canonical LocalBusiness JSON-LD for https://tolatiles.com/#business lives in
// app/layout.tsx (rendered on every page). A second, contradicting copy used to be
// defined here — removed to stop shipping two LocalBusiness blocks with the same @id.

export const metadata: Metadata = {
  title: 'Tile Installer Jacksonville & St. Augustine FL | Expert Installation | Tola Tiles',
  description: 'Expert tile installation services in Jacksonville and St. Augustine, FL. Kitchen backsplashes, bathroom tiles, floor tiling, patios & more. Licensed tile installer serving Northeast Florida. Free estimates! Call (904) 866-1738.',
  keywords: 'tile installer jacksonville fl, tile installer st augustine fl, tile installation florida, tile contractor northeast florida, kitchen backsplash jacksonville, bathroom tile st augustine, floor tile installation, patio tile florida',
  alternates: {
    canonical: 'https://tolatiles.com/',
  },
  openGraph: {
    title: 'Tile Installer Jacksonville & St. Augustine FL | Tola Tiles',
    description: 'Expert tile installation in Jacksonville and St. Augustine FL. Kitchen backsplashes, bathroom tiles, floor tiling, and patios. Free estimates!',
    url: 'https://tolatiles.com/',
    type: 'website',
    siteName: 'Tola Tiles',
    images: [DEFAULT_OG_IMAGE],
  },
};

export default async function Home() {
  const initialBlogPosts = await getHomepageBlogPosts();
  return <HomePage location="florida" initialBlogPosts={initialBlogPosts} />;
}
