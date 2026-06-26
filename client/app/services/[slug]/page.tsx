import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ServiceDetailPage from '@/components/pages/ServiceDetailPage';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import { services, Service } from '@/data/services';
import { serviceDetailsMap } from '@/data/serviceDetails';
import { geoCoordinates, areaServed } from '@/lib/locations';

const slugToServiceId: Record<string, string> = {
  'kitchen-backsplash': 'kitchen-backsplash',
  'bathroom-tile': 'bathroom',
  'floor-tile': 'flooring',
  'patio-tile': 'patio',
  'fireplace-tile': 'fireplace',
  'shower-tile': 'shower',
};

const validSlugs = Object.keys(slugToServiceId);

const serviceIdToSlug: Record<string, string> = {
  'kitchen-backsplash': 'kitchen-backsplash',
  bathroom: 'bathroom-tile',
  flooring: 'floor-tile',
  patio: 'patio-tile',
  fireplace: 'fireplace-tile',
  shower: 'shower-tile',
};

export function generateStaticParams() {
  return validSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const serviceId = slugToServiceId[slug];
  if (!serviceId) return { title: 'Service Not Found' };

  const service = services.find((s) => s.id === serviceId);
  if (!service) return { title: 'Service Not Found' };

  const details = serviceDetailsMap[serviceId];
  const locationContent = service.locations['florida'];

  // Use keyword base for a more specific, high-intent title
  const metaTitle = details
    ? `${details.keywordBase} Jacksonville & St. Augustine FL | Tola Tiles`
    : `${service.title} Jacksonville & St. Augustine FL | Tola Tiles`;

  // Build a rich meta description using the service's local description
  const baseDesc = `Professional ${service.title.toLowerCase()} services in Jacksonville & St. Augustine, FL.`;
  const remainder = locationContent.localDescription.substring(0, 155 - baseDesc.length - 1);
  const metaDescription = `${baseDesc} ${remainder}…`;

  const keywords = [
    ...locationContent.keywords,
    `${service.title.toLowerCase()} jacksonville fl`,
    `${service.title.toLowerCase()} st augustine fl`,
    'tile installation florida',
    'tile contractor northeast florida',
    ...(details ? [details.keywordBase.toLowerCase()] : []),
  ].join(', ');

  return {
    title: metaTitle,
    description: metaDescription,
    keywords,
    alternates: {
      canonical: `https://tolatiles.com/services/${slug}`,
    },
    openGraph: {
      title: metaTitle,
      description: `${baseDesc} Free estimates! ${locationContent.sellingPoints[0]}`,
      url: `https://tolatiles.com/services/${slug}`,
      type: 'website',
      locale: 'en_US',
      siteName: 'Tola Tiles',
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: `${baseDesc} Free estimates! ${locationContent.sellingPoints[0]}`,
    },
  };
}

export default async function ServiceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const serviceId = slugToServiceId[slug];
  if (!serviceId) notFound();

  const service = services.find((s) => s.id === serviceId);
  if (!service) notFound();

  const relatedServices = services.filter((s) => s.id !== serviceId).slice(0, 3);
  const geo = geoCoordinates['florida'];
  const details = serviceDetailsMap[serviceId];

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `https://tolatiles.com/services/${slug}#service`,
    name: details
      ? `${details.keywordBase} Jacksonville & St. Augustine FL`
      : `${service.title} Jacksonville & St. Augustine FL`,
    description: service.locations['florida'].localDescription,
    serviceType: service.title,
    priceRange: '$$',
    provider: {
      '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
      '@id': 'https://tolatiles.com/#business',
      name: 'Tola Tiles',
      telephone: '+1-904-866-1738',
      email: 'menitola@tolatiles.com',
    },
    areaServed: areaServed['florida'],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${service.title} Services`,
      itemListElement: service.features.map((feature, index) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: feature },
        position: index + 1,
      })),
    },
  };

  // FAQPage schema for rich results in Google Search
  const faqSchema = details?.faqs?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: details.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }
    : null;

  const breadcrumbItems = [
    { name: 'Home', url: 'https://tolatiles.com' },
    { name: 'Services', url: 'https://tolatiles.com/services' },
    { name: service.title, url: `https://tolatiles.com/services/${slug}` },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      <BreadcrumbSchema items={breadcrumbItems} />
      <ServiceDetailPage
        service={service}
        relatedServices={relatedServices}
        serviceIdToSlug={serviceIdToSlug}
        location="florida"
      />
    </>
  );
}
