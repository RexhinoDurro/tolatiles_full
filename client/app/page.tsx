import type { Metadata } from 'next';
import HomePage from '@/components/pages/HomePage';
import { DEFAULT_OG_IMAGE } from '@/lib/seo';

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

const rootSchema = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
  '@id': 'https://tolatiles.com/#business',
  name: 'Tola Tiles - Tile Installation Jacksonville & St. Augustine FL',
  description: 'Professional tile installation services in Northeast Florida. Expert tile installers specializing in kitchen backsplashes, bathroom tiles, floor tiling, patios, and fireplace surrounds.',
  url: 'https://tolatiles.com',
  telephone: '+1-904-866-1738',
  email: 'menitola@tolatiles.com',
  priceRange: '$8-25 per sq ft',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '445 Hutchinson Ln',
    addressLocality: 'St Augustine',
    addressRegion: 'FL',
    postalCode: '32084',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '30.1766',
    longitude: '-81.6076',
  },
  areaServed: [
    { '@type': 'City', name: 'Jacksonville', addressRegion: 'FL' },
    { '@type': 'City', name: 'St Augustine', addressRegion: 'FL' },
    { '@type': 'AdministrativeArea', name: 'Duval County', addressRegion: 'FL' },
    { '@type': 'AdministrativeArea', name: 'St Johns County', addressRegion: 'FL' },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '127',
    bestRating: '5',
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(rootSchema) }}
      />
      <HomePage location="florida" />
    </>
  );
}
