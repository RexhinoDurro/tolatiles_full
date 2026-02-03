import type { Metadata } from 'next';
import HomePage from '@/components/pages/HomePage';

export const metadata: Metadata = {
  title: 'Tile Installer St Augustine FL | Tile Installation & Tile Installers | Tola Tiles',
  description:
    'Looking for tile installers in St Augustine FL? Expert tile installation services - kitchen backsplashes, bathroom tiles, floor tiling, patios & more. Licensed tile installer serving St Augustine, St Johns County. Free estimates! Call (904) 866-1738.',
  keywords:
    'tile installer st augustine fl, tile installers st augustine, tile installation st augustine fl, st augustine tile installer, st augustine tile installation, tile contractor st augustine, bathroom tile installer st augustine, kitchen backsplash st augustine fl, floor tile installation st augustine, tile company st augustine florida, st johns county tile installer, best tile installer st augustine, professional tile installation st augustine fl',
  alternates: {
    canonical: 'https://tolatiles.com/st-augustine',
  },
  openGraph: {
    title: 'Tile Installer St Augustine FL | Professional Tile Installation Services',
    description:
      'Top-rated tile installers in St Augustine FL. Professional tile installation for kitchens, bathrooms, floors & more. Licensed & insured. Free estimates!',
    url: 'https://tolatiles.com/st-augustine',
    type: 'website',
    siteName: 'Tola Tiles',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tile Installer St Augustine FL | Tola Tiles',
    description: 'Expert tile installation services in St Augustine FL. Kitchen backsplashes, bathroom tiles, flooring & more.',
  },
};

const stAugustineSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://tolatiles.com/st-augustine#business',
  name: 'Tola Tiles - Tile Installer St Augustine FL',
  alternateName: ['St Augustine Tile Installer', 'St Augustine Tile Installation', 'Tola Tiles St Augustine'],
  description:
    'Professional tile installer and tile installation services in St Augustine FL. Expert tile installers specializing in kitchen backsplashes, bathroom tiles, floor tiling, patios, and fireplace surrounds. Serving St Augustine, St Johns County and surrounding areas.',
  url: 'https://tolatiles.com/st-augustine',
  telephone: '+1-904-866-1738',
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
    latitude: '29.8946',
    longitude: '-81.3145',
  },
  areaServed: [
    { '@type': 'City', name: 'St Augustine', addressRegion: 'FL' },
    { '@type': 'City', name: 'St Augustine Beach', addressRegion: 'FL' },
    { '@type': 'City', name: 'Vilano Beach', addressRegion: 'FL' },
    { '@type': 'City', name: 'Palm Coast', addressRegion: 'FL' },
    { '@type': 'City', name: 'Ponte Vedra', addressRegion: 'FL' },
    { '@type': 'AdministrativeArea', name: 'St Johns County', addressRegion: 'FL' },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Tile Installation Services St Augustine',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Kitchen Backsplash Installation St Augustine' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Bathroom Tile Installation St Augustine' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Floor Tile Installation St Augustine' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Patio Tile Installation St Augustine' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Fireplace Tile Installation St Augustine' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Shower Tile Installation St Augustine' } },
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

export default function StAugustinePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(stAugustineSchema) }}
      />
      <HomePage location="st-augustine" />
    </>
  );
}
