// src/components/ServiceSchema.tsx - Updated provider information
import React from 'react';

interface ServiceSchemaProps {
  service: {
    name: string;
    description: string;
    priceRange: string;
    timeline: string;
    features: string[];
  };
}

const ServiceSchema: React.FC<ServiceSchemaProps> = ({ service }) => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.name,
    "description": service.description,
    "provider": {
      "@type": "LocalBusiness",
      "name": "Tola Tiles",
      "telephone": "+1-904-210-3094",
      "email": "Menitola@live.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "445 Hutchinson Ln",
        "addressLocality": "Saint Augustine",
        "addressRegion": "FL",
        "postalCode": "32084",
        "addressCountry": "US"
      }
    },
    "areaServed": {
      "@type": "State",
      "name": "Florida"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": service.name,
      "itemListElement": service.features.map((feature) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": feature
        }
      }))
    },
    "offers": {
      "@type": "Offer",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": service.priceRange,
        "priceCurrency": "USD"
      }
    }
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(schemaData)}
    </script>
  );
};

export default ServiceSchema;