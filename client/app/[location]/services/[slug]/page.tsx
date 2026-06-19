import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ServiceDetailPage from '@/components/pages/ServiceDetailPage';
import ServiceDetailPageLocation from '@/components/pages/ServiceDetailPageLocation';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import { services, Service } from '@/data/services';
import { VALID_LOCATIONS, isValidLocation, locationNames, geoCoordinates, areaServed, type LocationType } from '@/lib/locations';

// Service slug to service ID mapping
const slugToServiceId: Record<string, string> = {
  'kitchen-backsplash': 'kitchen-backsplash',
  'bathroom-tile': 'bathroom',
  'floor-tile': 'flooring',
  'patio-tile': 'patio',
  'fireplace-tile': 'fireplace',
  'shower-tile': 'shower',
};

const validSlugs = Object.keys(slugToServiceId);

function generateServiceSchema(service: Service, slug: string, location: LocationType) {
  const locationName = locationNames[location];
  const locationContent = service.locations[location];
  const geo = geoCoordinates[location];

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `https://tolatiles.com/${location}/services/${slug}#service`,
    name: `${service.title} ${locationName} FL`,
    description: locationContent.localDescription,
    serviceType: service.title,
    priceRange: '$$',
    provider: {
      '@type': 'LocalBusiness',
      '@id': 'https://tolatiles.com/#business',
      name: 'Tola Tiles',
      telephone: '+1-904-866-1738',
      email: 'menitola@tolatiles.com',
      address: {
        '@type': 'PostalAddress',
        addressLocality: locationName,
        addressRegion: 'FL',
        addressCountry: 'US',
      },
    },
    areaServed: areaServed[location],
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

export function generateStaticParams() {
  const params: { location: string; slug: string }[] = [];

  for (const location of VALID_LOCATIONS) {
    for (const slug of validSlugs) {
      params.push({ location, slug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ location: string; slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;

  if (!isValidLocation(resolvedParams.location)) {
    return { title: 'Not Found' };
  }

  const serviceId = slugToServiceId[resolvedParams.slug];
  if (!serviceId) {
    return { title: 'Service Not Found' };
  }

  const service = services.find((s) => s.id === serviceId);
  if (!service) {
    return { title: 'Service Not Found' };
  }

  const location = resolvedParams.location;
  const locationName = locationNames[location];
  const locationContent = service.locations[location];
  const geo = geoCoordinates[location];

  const baseDescription = `Professional ${service.title.toLowerCase()} services in ${locationName}, FL.`;
  const truncatedLocal = locationContent.localDescription.substring(0, 160 - baseDescription.length - 1);
  const enhancedDescription = `${baseDescription} ${truncatedLocal}...`;

  return {
    title: `${service.title} ${locationName} FL - Expert Installation | Tola Tiles`,
    description: enhancedDescription,
    keywords: [
      ...locationContent.keywords,
      `${service.title.toLowerCase()} ${locationName.toLowerCase()}`,
      'tile installation',
      'tile contractor florida',
    ].join(', '),
    alternates: {
      canonical: `https://tolatiles.com/${location}/services/${resolvedParams.slug}`,
    },
    openGraph: {
      title: `${service.title} ${locationName} FL | Tola Tiles`,
      description: `Professional ${service.title.toLowerCase()} services in ${locationName}, FL. Free estimates! ${locationContent.sellingPoints[0]}`,
      url: `https://tolatiles.com/${location}/services/${resolvedParams.slug}`,
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${service.title} ${locationName} FL | Tola Tiles`,
      description: `Professional ${service.title.toLowerCase()} services in ${locationName}, FL. Free estimates!`,
    },
    other: {
      'geo.region': 'US-FL',
      'geo.placename': locationName,
      'geo.position': `${geo.lat};${geo.lon}`,
      'ICBM': `${geo.lat}, ${geo.lon}`,
    },
  };
}

export default async function ServiceDetail({ params }: { params: Promise<{ location: string; slug: string }> }) {
  const resolvedParams = await params;

  if (!isValidLocation(resolvedParams.location)) {
    notFound();
  }

  const serviceId = slugToServiceId[resolvedParams.slug];
  if (!serviceId) {
    notFound();
  }

  const service = services.find((s) => s.id === serviceId);
  if (!service) {
    notFound();
  }

  const location = resolvedParams.location;
  const locationName = locationNames[location];
  const relatedServices = services.filter((s) => s.id !== serviceId).slice(0, 3);
  const serviceSchema = generateServiceSchema(service, resolvedParams.slug, location);

  // Service ID to slug mapping for this location
  const serviceIdToSlug: Record<string, string> = {
    'kitchen-backsplash': 'kitchen-backsplash',
    bathroom: 'bathroom-tile',
    flooring: 'floor-tile',
    patio: 'patio-tile',
    fireplace: 'fireplace-tile',
    shower: 'shower-tile',
  };

  const breadcrumbItems = [
    { name: locationName, url: `https://tolatiles.com/${location}` },
    { name: 'Services', url: `https://tolatiles.com/${location}/services` },
    { name: service.title, url: `https://tolatiles.com/${location}/services/${resolvedParams.slug}` },
  ];

  // Use generic ServiceDetailPage for Florida, location-specific for others
  if (location === 'florida') {
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
          location={location}
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
        location={location}
      />
    </>
  );
}
