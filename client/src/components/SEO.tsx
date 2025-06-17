// src/components/SEO.tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  schemaData?: object;
}

const SEO: React.FC<SEOProps> = ({ 
  title = "Tola Tiles - Premium Tile Installation Services", 
  description = "Expert tile installation for kitchens, bathrooms, patios, and more. 15+ years experience, licensed & insured. Free estimates.",
  keywords = "tile installation, kitchen backsplash, bathroom tiles, patio tiles, flooring, ceramic tiles, porcelain tiles, natural stone, tile contractor",
  image = "https://tolatiles.com/assets/og-image.jpg",
  url = "https://tolatiles.com",
  type = "website",
  schemaData
}) => {
  const fullTitle = title.includes('Tola Tiles') ? title : `${title} | Tola Tiles`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Schema Data */}
      {schemaData && (
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;