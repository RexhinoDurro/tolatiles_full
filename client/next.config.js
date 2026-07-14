/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year for immutable images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tolatiles.com',
      },
      {
        protocol: 'https',
        hostname: 'api.tolatiles.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
    ],
  },
  async headers() {
    return [
      {
        // Prevent sitemap.xml from appearing in Google search results
        // while keeping it crawlable for search engine bots
        source: '/sitemap.xml',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex',
          },
        ],
      },
      {
        // Prevent robots.txt from appearing in search results
        source: '/robots.txt',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex',
          },
        ],
      },
      {
        // Private/dynamic routes only — admin console, the customer quotes
        // portal, and per-customer quote/invoice views by reference. These
        // must never be cached. Marketing pages (services, gallery, blog,
        // etc.) are intentionally excluded so they can be cached normally —
        // no-store on every route was forcing a full revalidation round trip
        // on every page view/back-navigation sitewide, a real Core Web
        // Vitals / repeat-visit performance cost with no benefit for content
        // that isn't actually that volatile.
        source: '/admin/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
      {
        source: '/quotes-portal/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
      {
        source: '/quotes/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
      {
        source: '/invoices/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        // Cache static assets for 1 year
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache fonts for 1 year
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache Next.js static files
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Legacy redirect
      {
        source: '/Tola',
        destination: '/',
        permanent: true,
      },

      // /florida/* → root (consolidate equity to root)
      {
        source: '/florida',
        destination: '/',
        permanent: true,
      },
      {
        source: '/florida/services',
        destination: '/services',
        permanent: true,
      },
      {
        source: '/florida/services/:slug',
        destination: '/services/:slug',
        permanent: true,
      },
      {
        source: '/florida/gallery',
        destination: '/gallery',
        permanent: true,
      },
      {
        source: '/florida/gallery/:path*',
        destination: '/gallery/:path*',
        permanent: true,
      },
      {
        source: '/florida/about',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/florida/contact',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/florida/faqs',
        destination: '/faqs',
        permanent: true,
      },
      {
        source: '/florida/blog',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/florida/blog/:path*',
        destination: '/blog/:path*',
        permanent: true,
      },

      // Old service URLs with location suffix to new location-prefixed URLs
      {
        source: '/services/:slug-jacksonville',
        destination: '/jacksonville/services/:slug',
        permanent: true,
      },
      {
        source: '/services/:slug-st-augustine',
        destination: '/st-augustine/services/:slug',
        permanent: true,
      },

      // Service slugs renamed to match each page's actual title/H1 intent
      // (e.g. kitchen-backsplash -> kitchen-backsplash-installation).
      // One rule per service covers root + both cities via the location
      // capture group re-used in the destination.
      {
        source: '/services/kitchen-backsplash',
        destination: '/services/kitchen-backsplash-installation',
        permanent: true,
      },
      {
        source: '/:location(jacksonville|st-augustine)/services/kitchen-backsplash',
        destination: '/:location/services/kitchen-backsplash-installation',
        permanent: true,
      },
      {
        source: '/services/bathroom-tile',
        destination: '/services/bathroom-tile-installation',
        permanent: true,
      },
      {
        source: '/:location(jacksonville|st-augustine)/services/bathroom-tile',
        destination: '/:location/services/bathroom-tile-installation',
        permanent: true,
      },
      {
        source: '/services/floor-tile',
        destination: '/services/floor-tile-installation',
        permanent: true,
      },
      {
        source: '/:location(jacksonville|st-augustine)/services/floor-tile',
        destination: '/:location/services/floor-tile-installation',
        permanent: true,
      },
      {
        source: '/services/patio-tile',
        destination: '/services/patio-tile-installation',
        permanent: true,
      },
      {
        source: '/:location(jacksonville|st-augustine)/services/patio-tile',
        destination: '/:location/services/patio-tile-installation',
        permanent: true,
      },
      {
        source: '/services/fireplace-tile',
        destination: '/services/fireplace-tile-installation',
        permanent: true,
      },
      {
        source: '/:location(jacksonville|st-augustine)/services/fireplace-tile',
        destination: '/:location/services/fireplace-tile-installation',
        permanent: true,
      },
      {
        source: '/services/shower-tile',
        destination: '/services/shower-tile-installation',
        permanent: true,
      },
      {
        source: '/:location(jacksonville|st-augustine)/services/shower-tile',
        destination: '/:location/services/shower-tile-installation',
        permanent: true,
      },

      // /services and /{location}/services are a URL grouping prefix only —
      // no hub page exists there by design. Anything hitting the bare
      // prefix goes to the relevant homepage instead of 404ing.
      {
        source: '/services',
        destination: '/',
        permanent: true,
      },
      {
        source: '/:location(jacksonville|st-augustine)/services',
        destination: '/:location',
        permanent: true,
      },

      // Blog no longer has per-city URLs (avoids duplicate-content across
      // /blog, /jacksonville/blog, /st-augustine/blog) — consolidate to root.
      {
        source: '/jacksonville/blog',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/jacksonville/blog/:path*',
        destination: '/blog/:path*',
        permanent: true,
      },
      {
        source: '/st-augustine/blog',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/st-augustine/blog/:path*',
        destination: '/blog/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
