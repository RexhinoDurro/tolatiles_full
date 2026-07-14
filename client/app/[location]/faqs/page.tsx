import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import FAQsPage from '@/components/pages/FAQsPage';
import { faqs as staticFaqs } from '@/data/faqs';
import { VALID_LOCATIONS, isValidLocation, locationNames, type LocationType } from '@/lib/locations';
import BreadcrumbSchema, { buildCityBreadcrumbs } from '@/components/BreadcrumbSchema';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export function generateStaticParams() {
  return VALID_LOCATIONS.map((location) => ({ location }));
}

export async function generateMetadata({ params }: { params: Promise<{ location: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  if (!isValidLocation(resolvedParams.location)) return { title: 'Not Found' };

  const locationName = locationNames[resolvedParams.location as LocationType];

  return {
    title: `Tile Installation FAQs ${locationName} FL | Tola Tiles`,
    description: `Answers to common tile installation questions in ${locationName} FL — pricing, materials, timelines, and maintenance from local tile experts with 15+ years of experience.`,
    keywords: `tile installation FAQ ${locationName.toLowerCase()} FL, tile contractor questions ${locationName.toLowerCase()}, tile installation cost Florida, how long does tile installation take, grout sealing ${locationName.toLowerCase()}`,
    alternates: {
      canonical: `https://tolatiles.com/${resolvedParams.location}/faqs`,
    },
    openGraph: {
      title: `Tile Installation FAQs | Tola Tiles ${locationName}`,
      description: `Expert answers to tile installation questions for ${locationName} homeowners — pricing, materials, maintenance, and more.`,
      url: `https://tolatiles.com/${resolvedParams.location}/faqs`,
      type: 'website',
    },
  };
}

async function getFAQs() {
  try {
    const res = await fetch(`${API_BASE}/faqs/`, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return Array.isArray(data) ? data : (data.results ?? []);
  } catch {
    return staticFaqs.map((faq, i) => ({ ...faq, id: i + 1, order: i, is_active: true }));
  }
}

function generateFAQSchema(faqList: Array<{ question: string; answer: string }>, location: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqList.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

function buildFaqBreadcrumbs(location: LocationType) {
  const faqCrumb = { name: 'FAQs', url: `https://tolatiles.com/${location}/faqs` };

  if (location === 'florida') {
    return [
      { name: 'Home', url: 'https://tolatiles.com' },
      { name: 'Florida', url: 'https://tolatiles.com' },
      faqCrumb,
    ];
  }

  return buildCityBreadcrumbs(location, [faqCrumb]);
}

export default async function FAQs({ params }: { params: Promise<{ location: string }> }) {
  const resolvedParams = await params;
  if (!isValidLocation(resolvedParams.location)) notFound();

  const location = resolvedParams.location;
  const faqList = await getFAQs();
  const faqSchema = generateFAQSchema(faqList, location);
  const breadcrumbItems = buildFaqBreadcrumbs(location);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <BreadcrumbSchema items={breadcrumbItems} />
      <FAQsPage location={location} initialFAQs={faqList} />
    </>
  );
}
