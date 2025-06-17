// src/components/ServiceSchema.tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';

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
      "telephone": "+1-555-123-4567",
      "email": "info@tolatiles.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "123 Tile Street",
        "addressLocality": "City",
        "addressRegion": "State",
        "postalCode": "12345",
        "addressCountry": "US"
      }
    },
    "areaServed": {
      "@type": "State",
      "name": "State"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": service.name,
      "itemListElement": service.features.map((feature, index) => ({
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
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
};

export default ServiceSchema;