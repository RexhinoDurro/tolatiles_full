// src/components/FAQSchema.tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import type { FAQ } from '../data/faqs';

interface FAQSchemaProps {
  faqs: FAQ[];
}

const FAQSchema: React.FC<FAQSchemaProps> = ({ faqs }) => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
};

export default FAQSchema;