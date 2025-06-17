import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  schemaData?: object | object[];
  noindex?: boolean;
}

const SEO: React.FC<SEOProps> = ({ 
  title = "Tola Tiles - Premium Tile Installation Services", 
  description = "Expert tile installation for kitchens, bathrooms, patios, and more. 15+ years experience, licensed & insured. Free estimates.",
  keywords = "tile installation, kitchen backsplash, bathroom tiles, patio tiles, flooring, ceramic tiles, porcelain tiles, natural stone, tile contractor",
  image = "https://tolatiles.com/assets/og-image.jpg",
  url = "https://tolatiles.com",
  type = "website",
  schemaData,
  noindex = false
}) => {
  const fullTitle = title.includes('Tola Tiles') ? title : `${title} | Tola Tiles`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;
    
    // Update meta tags
    const updateMeta = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const updateProperty = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Update meta tags
    updateMeta('description', description);
    updateMeta('keywords', keywords);
    updateMeta('robots', noindex ? 'noindex,nofollow' : 'index,follow');
    
    // Update Open Graph tags
    updateProperty('og:title', fullTitle);
    updateProperty('og:description', description);
    updateProperty('og:image', image);
    updateProperty('og:url', url);
    updateProperty('og:type', type);
    
    // Update Twitter tags
    updateProperty('twitter:title', fullTitle);
    updateProperty('twitter:description', description);
    updateProperty('twitter:image', image);
    updateProperty('twitter:card', 'summary_large_image');

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // Add schema data
    if (schemaData) {
      const schemaId = 'dynamic-schema';
      let existingSchema = document.getElementById(schemaId);
      if (existingSchema) {
        existingSchema.remove();
      }
      
      const script = document.createElement('script');
      script.id = schemaId;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(Array.isArray(schemaData) ? schemaData : [schemaData]);
      document.head.appendChild(script);
    }
  }, [fullTitle, description, keywords, image, url, type, noindex, schemaData]);

  return null; // This component doesn't render anything
};

export default SEO;