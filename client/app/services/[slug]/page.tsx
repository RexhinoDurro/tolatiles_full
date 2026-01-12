import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ServiceDetailPage from '@/components/pages/ServiceDetailPage';
import ServiceDetailPageLocation from '@/components/pages/ServiceDetailPageLocation';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import { services, Service } from '@/data/services';

type LocationType = 'florida' | 'jacksonville' | 'st-augustine';

interface SlugConfig {
  serviceId: string;
  location: LocationType;
}

function generateServiceSchema(service: Service, slug: string, location: LocationType) {
  const locationName = location === 'st-augustine' ? 'St Augustine' : location === 'jacksonville' ? 'Jacksonville' : 'Florida';
  const areaServed = location === 'st-augustine'
    ? [
        { '@type': 'City', name: 'St Augustine', addressRegion: 'FL' },
        { '@type': 'City', name: 'St Augustine Beach', addressRegion: 'FL' },
        { '@type': 'City', name: 'Ponte Vedra', addressRegion: 'FL' },
        { '@type': 'City', name: 'Palm Coast', addressRegion: 'FL' },
      ]
    : location === 'jacksonville'
    ? [
        { '@type': 'City', name: 'Jacksonville', addressRegion: 'FL' },
        { '@type': 'City', name: 'Jacksonville Beach', addressRegion: 'FL' },
        { '@type': 'City', name: 'Orange Park', addressRegion: 'FL' },
        { '@type': 'City', name: 'Mandarin', addressRegion: 'FL' },
      ]
    : [
        { '@type': 'City', name: 'Jacksonville', addressRegion: 'FL' },
        { '@type': 'City', name: 'St Augustine', addressRegion: 'FL' },
        { '@type': 'City', name: 'Ponte Vedra', addressRegion: 'FL' },
        { '@type': 'City', name: 'Orange Park', addressRegion: 'FL' },
      ];

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `https://tolatiles.com/services/${slug}#service`,
    name: `${service.title} ${locationName} FL`,
    description: service.detailedDescription,
    serviceType: service.title,
    provider: {
      '@type': 'LocalBusiness',
      '@id': 'https://tolatiles.com/#business',
      name: 'Tola Tiles',
      telephone: '+1-904-210-3094',
      email: 'menitola@tolatiles.com',
      address: {
        '@type': 'PostalAddress',
        addressLocality: location === 'florida' ? 'Saint Augustine' : locationName,
        addressRegion: 'FL',
        addressCountry: 'US',
      },
    },
    areaServed,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${service.title} Services`,
      itemListElement: service.features.map((feature, index) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: feature,
        },
        position: index + 1,
      })),
    },
  };
}

// Generic Florida slugs (default - no location suffix)
const floridaSlugs: Record<string, SlugConfig> = {
  'kitchen-backsplash': { serviceId: 'kitchen-backsplash', location: 'florida' },
  'bathroom-tile': { serviceId: 'bathroom', location: 'florida' },
  'floor-tile': { serviceId: 'flooring', location: 'florida' },
  'patio-tile': { serviceId: 'patio', location: 'florida' },
  'fireplace-tile': { serviceId: 'fireplace', location: 'florida' },
  'shower-tile': { serviceId: 'shower', location: 'florida' },
};

// Jacksonville slugs
const jacksonvilleSlugs: Record<string, SlugConfig> = {
  'kitchen-backsplash-jacksonville': { serviceId: 'kitchen-backsplash', location: 'jacksonville' },
  'bathroom-tile-jacksonville': { serviceId: 'bathroom', location: 'jacksonville' },
  'floor-tile-jacksonville': { serviceId: 'flooring', location: 'jacksonville' },
  'patio-tile-jacksonville': { serviceId: 'patio', location: 'jacksonville' },
  'fireplace-tile-jacksonville': { serviceId: 'fireplace', location: 'jacksonville' },
  'shower-tile-jacksonville': { serviceId: 'shower', location: 'jacksonville' },
};

// St Augustine slugs
const stAugustineSlugs: Record<string, SlugConfig> = {
  'kitchen-backsplash-st-augustine': { serviceId: 'kitchen-backsplash', location: 'st-augustine' },
  'bathroom-tile-st-augustine': { serviceId: 'bathroom', location: 'st-augustine' },
  'floor-tile-st-augustine': { serviceId: 'flooring', location: 'st-augustine' },
  'patio-tile-st-augustine': { serviceId: 'patio', location: 'st-augustine' },
  'fireplace-tile-st-augustine': { serviceId: 'fireplace', location: 'st-augustine' },
  'shower-tile-st-augustine': { serviceId: 'shower', location: 'st-augustine' },
};

// Combined slug mapping
const slugToConfig: Record<string, SlugConfig> = {
  ...floridaSlugs,
  ...jacksonvilleSlugs,
  ...stAugustineSlugs,
};

// Service ID to slug mappings by location
const serviceIdToSlugFlorida: Record<string, string> = {
  'kitchen-backsplash': 'kitchen-backsplash',
  bathroom: 'bathroom-tile',
  flooring: 'floor-tile',
  patio: 'patio-tile',
  fireplace: 'fireplace-tile',
  shower: 'shower-tile',
};

const serviceIdToSlugJacksonville: Record<string, string> = {
  'kitchen-backsplash': 'kitchen-backsplash-jacksonville',
  bathroom: 'bathroom-tile-jacksonville',
  flooring: 'floor-tile-jacksonville',
  patio: 'patio-tile-jacksonville',
  fireplace: 'fireplace-tile-jacksonville',
  shower: 'shower-tile-jacksonville',
};

const serviceIdToSlugStAugustine: Record<string, string> = {
  'kitchen-backsplash': 'kitchen-backsplash-st-augustine',
  bathroom: 'bathroom-tile-st-augustine',
  flooring: 'floor-tile-st-augustine',
  patio: 'patio-tile-st-augustine',
  fireplace: 'fireplace-tile-st-augustine',
  shower: 'shower-tile-st-augustine',
};

export async function generateStaticParams() {
  return Object.keys(slugToConfig).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const config = slugToConfig[resolvedParams.slug];

  if (!config) {
    return {
      title: 'Service Not Found',
    };
  }

  const service = services.find((s) => s.id === config.serviceId);

  if (!service) {
    return {
      title: 'Service Not Found',
    };
  }

  const locationName = config.location === 'st-augustine' ? 'St Augustine' : config.location === 'jacksonville' ? 'Jacksonville' : 'Northeast Florida';
  const locationKeywords = config.location === 'st-augustine' ? 'st augustine, st johns county' : config.location === 'jacksonville' ? 'jacksonville, jax, duval county' : 'florida, jacksonville, st augustine';

  return {
    title: `${service.title} ${locationName} FL - Expert Installation | Tola Tiles`,
    description: `Professional ${service.title.toLowerCase()} services in ${locationName}, FL. ${service.detailedDescription.substring(0, 120)}`,
    keywords: `${service.title.toLowerCase()}, tile installation ${locationName.toLowerCase()}, ${locationKeywords}, tile contractor florida`,
    alternates: {
      canonical: `https://tolatiles.com/services/${resolvedParams.slug}`,
    },
    openGraph: {
      title: `${service.title} ${locationName} FL | Tola Tiles`,
      description: `Professional ${service.title.toLowerCase()} services in ${locationName}, FL. Free estimates!`,
      url: `https://tolatiles.com/services/${resolvedParams.slug}`,
    },
  };
}

export default async function ServiceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const config = slugToConfig[resolvedParams.slug];

  if (!config) {
    notFound();
  }

  const service = services.find((s) => s.id === config.serviceId);

  if (!service) {
    notFound();
  }

  const relatedServices = services.filter((s) => s.id !== config.serviceId).slice(0, 3);
  const serviceSchema = generateServiceSchema(service, resolvedParams.slug, config.location);

  const serviceIdToSlug = config.location === 'st-augustine'
    ? serviceIdToSlugStAugustine
    : config.location === 'jacksonville'
    ? serviceIdToSlugJacksonville
    : serviceIdToSlugFlorida;

  const homeUrl = config.location === 'st-augustine'
    ? 'https://tolatiles.com/st-augustine'
    : config.location === 'jacksonville'
    ? 'https://tolatiles.com/jacksonville'
    : 'https://tolatiles.com';

  const homeName = config.location === 'st-augustine'
    ? 'St Augustine'
    : config.location === 'jacksonville'
    ? 'Jacksonville'
    : 'Home';

  const breadcrumbItems = [
    { name: homeName, url: homeUrl },
    { name: 'Services', url: config.location === 'florida' ? 'https://tolatiles.com/services' : homeUrl },
    { name: service.title, url: `https://tolatiles.com/services/${resolvedParams.slug}` },
  ];

  // Use generic ServiceDetailPage for Florida, location-specific for others
  if (config.location === 'florida') {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        />
        <BreadcrumbSchema items={breadcrumbItems} />
        <ServiceDetailPage
          service={service}
          relatedServices={relatedServices}
          serviceIdToSlug={serviceIdToSlug}
        />
      </>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      <ServiceDetailPageLocation
        service={service}
        relatedServices={relatedServices}
        serviceIdToSlug={serviceIdToSlug}
        location={config.location}
      />
    </>
  );
}
