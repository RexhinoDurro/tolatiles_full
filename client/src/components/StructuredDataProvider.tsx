// src/components/StructuredDataProvider.tsx
import React from 'react';

const StructuredDataProvider: React.FC = () => {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Tola Tiles",
    "url": "https://tolatiles.com",
    "description": "Premium tile installation services for residential and commercial properties.",
    "publisher": {
      "@type": "Organization",
      "name": "Tola Tiles"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://tolatiles.com/gallery?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Tola Tiles",
    "image": "https://tolatiles.com/assets/logo.png",
    "telephone": "+1-555-123-4567",
    "email": "info@tolatiles.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Tile Street",
      "addressLocality": "City",
      "addressRegion": "State",
      "postalCode": "12345",
      "addressCountry": "US"
    },
    "openingHours": [
      "Mo-Fr 08:00-18:00",
      "Sa 09:00-16:00"
    ],
    "serviceArea": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": "40.7128",
        "longitude": "-74.0060"
      },
      "geoRadius": "50000"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Tile Installation Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Kitchen Backsplash Installation"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Bathroom Tile Installation"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Floor Tile Installation"
          }
        }
      ]
    }
  };

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
    </>
  );
};

export default StructuredDataProvider;