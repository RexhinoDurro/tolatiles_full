import type { Metadata } from 'next';
import HomePage from '@/components/pages/HomePage';

export const metadata: Metadata = {
  title: 'Tile Installer Jacksonville FL | Tile Installation & Tile Installers Jax | Tola Tiles',
  description:
    'Looking for tile installers in Jacksonville FL? Expert tile installation services in Jax - kitchen backsplashes, bathroom tiles, floor tiling, patios & more. Licensed tile installer serving Jacksonville, Duval County. Free estimates! Call (904) 210-3094.',
  keywords:
    'tile installer jacksonville fl, tile installers jacksonville, tile installation jacksonville fl, jacksonville tile installer, jax tile installer, jax tile installation, tile contractor jacksonville, bathroom tile installer jacksonville, kitchen backsplash jacksonville fl, floor tile installation jacksonville, tile company jacksonville florida, duval county tile installer, best tile installer jacksonville, professional tile installation jacksonville fl, jax tile services',
  alternates: {
    canonical: 'https://tolatiles.com/jacksonville',
  },
  openGraph: {
    title: 'Tile Installer Jacksonville FL | Professional Tile Installation Services Jax',
    description:
      'Top-rated tile installers in Jacksonville FL & Jax area. Professional tile installation for kitchens, bathrooms, floors & more. Licensed & insured. Free estimates!',
    url: 'https://tolatiles.com/jacksonville',
    type: 'website',
    siteName: 'Tola Tiles',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tile Installer Jacksonville FL | Tola Tiles',
    description: 'Expert tile installation services in Jacksonville FL. Kitchen backsplashes, bathroom tiles, flooring & more.',
  },
};

const jacksonvilleSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://tolatiles.com/jacksonville#business',
  name: 'Tola Tiles - Tile Installer Jacksonville FL',
  alternateName: ['Jacksonville Tile Installer', 'Jax Tile Installation', 'Tola Tiles Jacksonville', 'Jax Tile Installer'],
  description:
    'Professional tile installer and tile installation services in Jacksonville FL and Jax area. Expert tile installers specializing in kitchen backsplashes, bathroom tiles, floor tiling, patios, and fireplace surrounds. Serving Jacksonville, Duval County and surrounding areas.',
  url: 'https://tolatiles.com/jacksonville',
  telephone: '+1-904-210-3094',
  priceRange: '$8-25 per sq ft',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '445 Hutchinson Ln',
    addressLocality: 'Jacksonville',
    addressRegion: 'FL',
    postalCode: '32084',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '30.3322',
    longitude: '-81.6557',
  },
  areaServed: [
    { '@type': 'City', name: 'Jacksonville', addressRegion: 'FL' },
    { '@type': 'City', name: 'Jacksonville Beach', addressRegion: 'FL' },
    { '@type': 'City', name: 'Neptune Beach', addressRegion: 'FL' },
    { '@type': 'City', name: 'Atlantic Beach', addressRegion: 'FL' },
    { '@type': 'City', name: 'Orange Park', addressRegion: 'FL' },
    { '@type': 'City', name: 'Mandarin', addressRegion: 'FL' },
    { '@type': 'AdministrativeArea', name: 'Duval County', addressRegion: 'FL' },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Tile Installation Services Jacksonville',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Kitchen Backsplash Installation Jacksonville' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Bathroom Tile Installation Jacksonville' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Floor Tile Installation Jacksonville' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Patio Tile Installation Jacksonville' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Fireplace Tile Installation Jacksonville' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Shower Tile Installation Jacksonville' } },
    ],
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '89',
    bestRating: '5',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '09:00',
      closes: '16:00',
    },
  ],
  sameAs: [
    'https://www.facebook.com/TolaTiles',
    'https://www.instagram.com/tolatiles',
  ],
};

export default function JacksonvillePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jacksonvilleSchema) }}
      />
      <HomePage location="jacksonville" />
    </>
  );
}
