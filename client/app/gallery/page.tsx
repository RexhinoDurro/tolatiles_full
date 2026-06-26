import type { Metadata } from 'next';
import GalleryPage from '@/components/pages/GalleryPage';

export const metadata: Metadata = {
  title: 'Tile Installation Gallery Jacksonville & St. Augustine FL | Tola Tiles',
  description:
    'Browse our complete portfolio of tile installation projects across Northeast Florida — kitchen backsplashes, bathroom renovations, custom showers, patio and pool deck tile, floor tile, and fireplace surrounds by Tola Tiles.',
  keywords:
    'tile installation gallery jacksonville fl, tile gallery st augustine fl, kitchen backsplash gallery northeast florida, bathroom tile gallery florida, shower tile examples, patio tile portfolio, floor tile installation florida, fireplace tile gallery, tola tiles portfolio',
  alternates: {
    canonical: 'https://tolatiles.com/gallery',
  },
  openGraph: {
    title: 'Tile Installation Gallery — Tola Tiles Jacksonville & St. Augustine FL',
    description:
      'Real tile installation projects completed across Northeast Florida. Browse by category: backsplashes, showers, flooring, patios, and fireplaces.',
    url: 'https://tolatiles.com/gallery',
    type: 'website',
    siteName: 'Tola Tiles',
  },
};

// ImageGallery structured data for rich Google results
const gallerySchema = {
  '@context': 'https://schema.org',
  '@type': 'ImageGallery',
  name: 'Tola Tiles Project Gallery — Tile Installation Portfolio',
  description:
    'Complete portfolio of professional tile installation projects across Northeast Florida including Jacksonville, St. Augustine, Ponte Vedra, and surrounding areas.',
  url: 'https://tolatiles.com/gallery',
  author: {
    '@type': 'LocalBusiness',
    '@id': 'https://tolatiles.com/#business',
    name: 'Tola Tiles',
    telephone: '+1-904-866-1738',
    url: 'https://tolatiles.com',
  },
  about: [
    { '@type': 'Thing', name: 'Kitchen Backsplash Tile Installation' },
    { '@type': 'Thing', name: 'Bathroom Tile Installation' },
    { '@type': 'Thing', name: 'Custom Shower Tile' },
    { '@type': 'Thing', name: 'Floor Tile Installation' },
    { '@type': 'Thing', name: 'Patio and Pool Deck Tile' },
    { '@type': 'Thing', name: 'Fireplace Tile Surround' },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://tolatiles.com' },
    { '@type': 'ListItem', position: 2, name: 'Gallery', item: 'https://tolatiles.com/gallery' },
  ],
};

export default function Gallery() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(gallerySchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <GalleryPage location="florida" />
    </>
  );
}
