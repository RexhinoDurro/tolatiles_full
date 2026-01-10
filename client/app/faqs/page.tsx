import type { Metadata } from 'next';
import FAQsPage from '@/components/pages/FAQsPage';
import { faqs } from '@/data/faqs';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions - Tile Installation FAQs Jacksonville FL | Tola Tiles',
  description:
    'Find answers to common questions about tile installation in Jacksonville FL and St Augustine. Get expert advice on pricing, materials, maintenance, and our tile services.',
  keywords: 'tile installation FAQ Jacksonville FL, tile questions St Augustine, tile installation cost, tile maintenance, tile materials, tile contractor questions Florida',
  alternates: {
    canonical: 'https://tolatiles.com/faqs',
  },
};

// Generate FAQ Schema for SEO
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

export default function FAQs() {
  const faqSchema = generateFAQSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FAQsPage />
    </>
  );
}
