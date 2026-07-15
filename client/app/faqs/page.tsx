import type { Metadata } from 'next';
import FAQsPage from '@/components/pages/FAQsPage';
import { faqs as staticFaqs } from '@/data/faqs';
import { DEFAULT_OG_IMAGE } from '@/lib/seo';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const metadata: Metadata = {
  title: 'Tile Installation FAQs | Common Questions Answered',
  description:
    'Get answers to common tile installation questions in Jacksonville & St. Augustine FL. Pricing, timelines, materials, maintenance, and more — answered by local tile experts.',
  keywords:
    'tile installation FAQ Florida, tile installation cost Jacksonville, how long does tile installation take, tile maintenance tips, ceramic vs porcelain tile, grout sealing FAQ, tile contractor questions northeast florida',
  alternates: {
    canonical: 'https://tolatiles.com/faqs',
  },
  openGraph: {
    title: 'Tile Installation FAQs | Tola Tiles Northeast Florida',
    description: 'Expert answers to your tile installation questions — pricing, materials, timelines, and maintenance for Jacksonville & St. Augustine homeowners.',
    url: 'https://tolatiles.com/faqs',
    type: 'website',
    images: [DEFAULT_OG_IMAGE],
  },
};

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

function generateFAQSchema(faqList: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqList.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

function generateBreadcrumbSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://tolatiles.com' },
      { '@type': 'ListItem', position: 2, name: 'FAQs', item: 'https://tolatiles.com/faqs' },
    ],
  };
}

export default async function FAQs() {
  const faqList = await getFAQs();
  const faqSchema = generateFAQSchema(faqList);
  const breadcrumbSchema = generateBreadcrumbSchema();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <FAQsPage location="florida" initialFAQs={faqList} />
    </>
  );
}
