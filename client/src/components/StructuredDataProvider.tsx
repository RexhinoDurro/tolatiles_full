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
    "telephone": "+1-904-210-3094",
    "email": "menitola@tolatiles.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "445 Hutchinson Ln",
      "addressLocality": "Saint Augustine",
      "addressRegion": "FL",
      "postalCode": "32084",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "29.901244",
      "longitude": "-81.312434"
    },
    "openingHours": [
      "Mo-Fr 08:00-18:00",
      "Sa 09:00-16:00"
    ],
    "serviceArea": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": "29.901244",
        "longitude": "-81.312434"
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