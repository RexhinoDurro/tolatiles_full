// src/components/FAQSchema.tsx
import React from 'react';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

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
    <script type="application/ld+json">
      {JSON.stringify(schemaData)}
    </script>
  );
};

export default FAQSchema;