// src/utils/seoUtils.ts
export const generateSitemap = () => {
  const pages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/services', priority: '0.9', changefreq: 'weekly' },
    { url: '/services/kitchen-backsplash-jacksonville', priority: '0.9', changefreq: 'weekly' },
    { url: '/services/bathroom-tile-jacksonville', priority: '0.9', changefreq: 'weekly' },
    { url: '/services/floor-tiling-jacksonville', priority: '0.9', changefreq: 'weekly' },
    { url: '/services/patio-tile-jacksonville', priority: '0.8', changefreq: 'weekly' },
    { url: '/services/fireplace-tile-jacksonville', priority: '0.8', changefreq: 'weekly' },
    { url: '/services/shower-tile-jacksonville', priority: '0.9', changefreq: 'weekly' },
    { url: '/about', priority: '0.6', changefreq: 'monthly' },
    { url: '/faqs', priority: '0.6', changefreq: 'monthly' },
    { url: '/contact', priority: '0.8', changefreq: 'monthly' }
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>https://tolatiles.com${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
};

export const generateRobotsTxt = () => {
  return `User-agent: *
Allow: /

Sitemap: https://tolatiles.com/sitemap.xml

Disallow: /admin/
Disallow: /api/
Disallow: /.well-known/
Disallow: /private/
Disallow: /temp/

Crawl-delay: 1`;
};

export const optimizeImages = (imageSrc: string, width?: number, height?: number) => {
  const params = new URLSearchParams();
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  params.append('f', 'webp');
  params.append('q', '85');
  
  return imageSrc + (params.toString() ? `?${params.toString()}` : '');
};

export const preloadCriticalResources = () => {
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = '/fonts/inter-var.woff2';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);

  const heroImageLink = document.createElement('link');
  heroImageLink.rel = 'preload';
  heroImageLink.href = '/assets/images/hero-bg.jpg';
  heroImageLink.as = 'image';
  document.head.appendChild(heroImageLink);
};

export const generateBusinessStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://tolatiles.com/#business",
    "name": "Tola Tiles",
    "description": "Premium tile installation services for residential and commercial properties in Jacksonville, FL. Expert kitchen backsplash, bathroom, flooring, and patio tile installation.",
    "url": "https://tolatiles.com",
    "telephone": "+1-904-210-3094",
    "email": "menitola@tolatiles.com",
    "foundingDate": "2008",
    "priceRange": "$8-25 per sq ft",
    "paymentAccepted": "Cash, Check, Credit Card",
    "currenciesAccepted": "USD",
    "openingHours": [
      "Mo-Fr 08:00-18:00",
      "Sa 09:00-16:00"
    ],
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
      "latitude": "29.9511",
      "longitude": "-81.3124"
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Jacksonville",
        "addressRegion": "FL"
      },
      {
        "@type": "City",
        "name": "Saint Augustine",
        "addressRegion": "FL"
      }
    ],
    "logo": "https://tolatiles.com/assets/logo.png",
    "image": [
      "https://tolatiles.com/assets/gallery-preview.jpg"
    ],
    "sameAs": [
      "https://www.facebook.com/tolatiles",
      "https://www.instagram.com/tolatiles",
      "https://www.linkedin.com/company/tolatiles"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    }
  };
};

export const trackWebVitals = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      const reportWebVital = (metric: any) => {
        if (window.gtag) {
          window.gtag('event', metric.name, {
            custom_parameter_1: metric.value,
            custom_parameter_2: metric.rating,
            non_interaction: true,
          });
        }

        if (import.meta.env.DEV) {
          console.log(`${metric.name}: ${metric.value} (${metric.rating})`);
        }
      };

      onCLS(reportWebVital);
      onINP(reportWebVital);
      onFCP(reportWebVital);
      onLCP(reportWebVital);
      onTTFB(reportWebVital);
    }).catch((error) => {
      console.error('Failed to load web-vitals:', error);
    });
  }
};