import type { Metadata } from 'next';
import GalleryPage from '@/components/pages/GalleryPage';

export const metadata: Metadata = {
  title: 'Tile Installation Gallery - Premium Tile Work by Tola Tiles',
  description:
    'Browse our complete gallery of tile installation projects including kitchen backsplashes, bathroom renovations, patio installations, and flooring work by Tola Tiles.',
  keywords: 'tile gallery, tile installation examples, kitchen backsplash gallery, bathroom tile gallery, patio tile gallery, flooring gallery',
  alternates: {
    canonical: 'https://tolatiles.com/gallery',
  },
};

export default function Gallery() {
  return <GalleryPage />;
}
