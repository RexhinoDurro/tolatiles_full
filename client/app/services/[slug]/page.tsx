import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ServiceDetailPage from '@/components/pages/ServiceDetailPage';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import { services, Service } from '@/data/services';

function generateServiceSchema(service: Service, slug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `https://tolatiles.com/services/${slug}#service`,
    name: `${service.title} Jacksonville FL`,
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
        addressLocality: 'Jacksonville',
        addressRegion: 'FL',
        addressCountry: 'US',
      },
    },
    areaServed: [
      { '@type': 'City', name: 'Jacksonville', addressRegion: 'FL' },
      { '@type': 'City', name: 'St Augustine', addressRegion: 'FL' },
      { '@type': 'City', name: 'Ponte Vedra', addressRegion: 'FL' },
      { '@type': 'City', name: 'Orange Park', addressRegion: 'FL' },
    ],
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

const slugToServiceId: Record<string, string> = {
  'kitchen-backsplash-jacksonville': 'kitchen-backsplash',
  'bathroom-tile-jacksonville': 'bathroom',
  'floor-tiling-jacksonville': 'flooring',
  'patio-tile-jacksonville': 'patio',
  'fireplace-tile-jacksonville': 'fireplace',
  'shower-tile-jacksonville': 'shower',
};

const serviceIdToSlug: Record<string, string> = {
  'kitchen-backsplash': 'kitchen-backsplash-jacksonville',
  bathroom: 'bathroom-tile-jacksonville',
  flooring: 'floor-tiling-jacksonville',
  patio: 'patio-tile-jacksonville',
  fireplace: 'fireplace-tile-jacksonville',
  shower: 'shower-tile-jacksonville',
};

export async function generateStaticParams() {
  return Object.keys(slugToServiceId).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const serviceId = slugToServiceId[resolvedParams.slug];
  const service = services.find((s) => s.id === serviceId);

  if (!service) {
    return {
      title: 'Service Not Found',
    };
  }

  return {
    title: `${service.title} Jacksonville FL - Expert Installation | Tola Tiles`,
    description: service.detailedDescription.substring(0, 160),
    keywords: `${service.title.toLowerCase()}, tile installation jacksonville, ${service.id} jacksonville fl, tile contractor jacksonville`,
    alternates: {
      canonical: `https://tolatiles.com/services/${resolvedParams.slug}`,
    },
  };
}

export default async function ServiceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const serviceId = slugToServiceId[resolvedParams.slug];
  const service = services.find((s) => s.id === serviceId);

  if (!service) {
    notFound();
  }

  const relatedServices = services.filter((s) => s.id !== serviceId).slice(0, 3);
  const serviceSchema = generateServiceSchema(service, resolvedParams.slug);
  const breadcrumbItems = [
    { name: 'Home', url: 'https://tolatiles.com' },
    { name: 'Services', url: 'https://tolatiles.com/services' },
    { name: service.title, url: `https://tolatiles.com/services/${resolvedParams.slug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      <ServiceDetailPage service={service} relatedServices={relatedServices} serviceIdToSlug={serviceIdToSlug} />
    </>
  );
}
