// src/utils/seoUtils.ts
export const generateSitemap = () => {
  const pages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/services', priority: '0.9', changefreq: 'weekly' },
    { url: '/gallery', priority: '0.8', changefreq: 'weekly' },
    { url: '/gallery/backsplashes', priority: '0.7', changefreq: 'weekly' },
    { url: '/gallery/patios', priority: '0.7', changefreq: 'weekly' },
    { url: '/gallery/showers', priority: '0.7', changefreq: 'weekly' },
    { url: '/gallery/flooring', priority: '0.7', changefreq: 'weekly' },
    { url: '/gallery/fireplaces', priority: '0.7', changefreq: 'weekly' },
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

// SEO optimization utilities
export const optimizeImages = (imageSrc: string, width?: number, height?: number) => {
  // In a real implementation, you might use a service like Cloudinary or ImageKit
  // For now, we'll return the original image with optimization parameters
  const params = new URLSearchParams();
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  params.append('f', 'webp'); // Use WebP format for better compression
  params.append('q', '85'); // Quality setting
  
  return imageSrc + (params.toString() ? `?${params.toString()}` : '');
};

export const preloadCriticalResources = () => {
  // Preload critical fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = '/fonts/inter-var.woff2';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);

  // Preload critical images
  const heroImageLink = document.createElement('link');
  heroImageLink.rel = 'preload';
  heroImageLink.href = '/assets/images/hero-bg.jpg';
  heroImageLink.as = 'image';
  document.head.appendChild(heroImageLink);
};

// Generate JSON-LD structured data
export const generateBusinessStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://tolatiles.com/#business",
    "name": "Tola Tiles",
    "description": "Premium tile installation services for residential and commercial properties. Expert kitchen backsplash, bathroom, flooring, and patio tile installation.",
    "url": "https://tolatiles.com",
    "telephone": "+1-555-123-4567",
    "email": "info@tolatiles.com",
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
      "streetAddress": "123 Tile Street",
      "addressLocality": "City",
      "addressRegion": "State",
      "postalCode": "12345",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "40.7128",
      "longitude": "-74.0060"
    },
    "areaServed": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": "40.7128",
        "longitude": "-74.0060"
      },
      "geoRadius": "50000"
    },
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

// Performance monitoring with current web-vitals API
export const trackWebVitals = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Track Core Web Vitals using the current API (INP replaced FID in March 2024)
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      const reportWebVital = (metric: any) => {
        // Send to analytics if available
        if (window.gtag) {
          window.gtag('event', metric.name, {
            custom_parameter_1: metric.value,
            custom_parameter_2: metric.rating,
            non_interaction: true,
          });
        }

        // Log in development for debugging
        if (import.meta.env.DEV) {
          console.log(`${metric.name}: ${metric.value} (${metric.rating})`);
        }
      };

      // Current Core Web Vitals metrics
      onCLS(reportWebVital);   // Cumulative Layout Shift
      onINP(reportWebVital);   // Interaction to Next Paint (replaced FID)
      onFCP(reportWebVital);   // First Contentful Paint
      onLCP(reportWebVital);   // Largest Contentful Paint
      onTTFB(reportWebVital);  // Time to First Byte
    }).catch((error) => {
      console.error('Failed to load web-vitals:', error);
    });
  }
};