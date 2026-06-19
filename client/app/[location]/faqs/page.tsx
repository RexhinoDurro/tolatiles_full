import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import FAQsPage from '@/components/pages/FAQsPage';
import { faqs } from '@/data/faqs';
import { VALID_LOCATIONS, isValidLocation, locationNames, type LocationType } from '@/lib/locations';

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

  const locationName = locationNames[resolvedParams.location];

  return {
    title: `Frequently Asked Questions - Tile Installation FAQs ${locationName} FL | Tola Tiles`,
    description: `Find answers to common questions about tile installation in ${locationName} FL. Get expert advice on pricing, materials, maintenance, and our tile services.`,
    keywords: `tile installation FAQ ${locationName.toLowerCase()} FL, tile questions ${locationName.toLowerCase()}, tile installation cost, tile maintenance, tile materials, tile contractor questions Florida`,
    alternates: {
      canonical: `https://tolatiles.com/${resolvedParams.location}/faqs`,
    },
  };
}

function generateFAQSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export default async function FAQs({ params }: { params: Promise<{ location: string }> }) {
  const resolvedParams = await params;

  if (!isValidLocation(resolvedParams.location)) {
    notFound();
  }

  const faqSchema = generateFAQSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FAQsPage location={resolvedParams.location} />
    </>
  );
}
