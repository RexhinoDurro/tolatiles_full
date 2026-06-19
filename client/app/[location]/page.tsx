import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import HomePage from '@/components/pages/HomePage';
import { VALID_LOCATIONS, isValidLocation, locationNames, type LocationType } from '@/lib/locations';

// Location-specific metadata
const locationMetadata: Record<LocationType, {
  title: string;
  description: string;
  keywords: string;
}> = {
  florida: {
    title: 'Tola Tiles - Tile Installers in Jacksonville and Saint Augustine, Florida',
    description: 'Bath & Kitchen Remodeling Company, Tile Installation Services in Jacksonville, Ponte Vedra, and Saint Augustine Florida, Tile Contractors, Flooring Installers, Tile Installers',
    keywords: 'tile installers jacksonville FL, tile installers Saint Augustine FL, backsplash jacksonville fl, backsplash saint augustine fl, bathroom tiles jacksonville fl, patio tiles, flooring installer, ceramic tiles, porcelain tiles, natural stone, tile contractor, tile installer jacksonville fl, tile installer saint augustine fl, home renovation',
  },
  jacksonville: {
    title: 'Tile Installer Jacksonville FL | Tile Installation & Tile Installers Jax | Tola Tiles',
    description: 'Looking for tile installers in Jacksonville FL? Expert tile installation services in Jax - kitchen backsplashes, bathroom tiles, floor tiling, patios & more. Licensed tile installer serving Jacksonville, Duval County. Free estimates! Call (904) 866-1738.',
    keywords: 'tile installer jacksonville fl, tile installers jacksonville, tile installation jacksonville fl, jacksonville tile installer, jax tile installer, jax tile installation, tile contractor jacksonville, bathroom tile installer jacksonville, kitchen backsplash jacksonville fl, floor tile installation jacksonville, tile company jacksonville florida, duval county tile installer, best tile installer jacksonville, professional tile installation jacksonville fl, jax tile services',
  },
  'st-augustine': {
    title: 'Tile Installer St Augustine FL | Tile Installation & Tile Installers | Tola Tiles',
    description: 'Looking for tile installers in St Augustine FL? Expert tile installation services - kitchen backsplashes, bathroom tiles, floor tiling, patios & more. Licensed tile installer serving St Augustine, St Johns County. Free estimates! Call (904) 866-1738.',
    keywords: 'tile installer st augustine fl, tile installers st augustine, tile installation st augustine fl, st augustine tile installer, st augustine tile installation, tile contractor st augustine, bathroom tile installer st augustine, kitchen backsplash st augustine fl, floor tile installation st augustine, tile company st augustine florida, st johns county tile installer, best tile installer st augustine, professional tile installation st augustine fl',
  },
};

// Schema data for each location
const locationSchemas: Record<LocationType, object> = {
  florida: {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://tolatiles.com/florida#business',
    name: 'Tola Tiles - Tile Installation Florida',
    description: 'Professional tile installation services in Northeast Florida. Expert tile installers specializing in kitchen backsplashes, bathroom tiles, floor tiling, patios, and fireplace surrounds.',
    url: 'https://tolatiles.com/florida',
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
      latitude: '30.1766',
      longitude: '-81.6076',
    },
  },
  jacksonville: {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://tolatiles.com/jacksonville#business',
    name: 'Tola Tiles - Tile Installer Jacksonville FL',
    alternateName: ['Jacksonville Tile Installer', 'Jax Tile Installation', 'Tola Tiles Jacksonville', 'Jax Tile Installer'],
    description: 'Professional tile installer and tile installation services in Jacksonville FL and Jax area. Expert tile installers specializing in kitchen backsplashes, bathroom tiles, floor tiling, patios, and fireplace surrounds. Serving Jacksonville, Duval County and surrounding areas.',
    url: 'https://tolatiles.com/jacksonville',
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
  },
  'st-augustine': {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://tolatiles.com/st-augustine#business',
    name: 'Tola Tiles - Tile Installer St Augustine FL',
    alternateName: ['St Augustine Tile Installer', 'St Augustine Tile Installation', 'Tola Tiles St Augustine'],
    description: 'Professional tile installer and tile installation services in St Augustine FL. Expert tile installers specializing in kitchen backsplashes, bathroom tiles, floor tiling, patios, and fireplace surrounds. Serving St Augustine, St Johns County and surrounding areas.',
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
  },
};

export function generateStaticParams() {
  return VALID_LOCATIONS.map((location) => ({
    location,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ location: string }> }): Promise<Metadata> {
  const resolvedParams = await params;

  if (!isValidLocation(resolvedParams.location)) {
    return { title: 'Not Found' };
  }

  const meta = locationMetadata[resolvedParams.location];
  const canonicalPath = resolvedParams.location === 'florida' ? '/florida' : `/${resolvedParams.location}`;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical: `https://tolatiles.com${canonicalPath}`,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://tolatiles.com${canonicalPath}`,
      type: 'website',
      siteName: 'Tola Tiles',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
  };
}

export default async function LocationHomePage({ params }: { params: Promise<{ location: string }> }) {
  const resolvedParams = await params;

  if (!isValidLocation(resolvedParams.location)) {
    notFound();
  }

  const location = resolvedParams.location;
  const schema = locationSchemas[location];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <HomePage location={location} />
    </>
  );
}
