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
        source: '/:path((?!_next|images|fonts|api).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
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
        destination: '/florida',
        permanent: true,
      },

      // Root to Florida
      {
        source: '/',
        destination: '/florida',
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

      // Florida services (no location suffix) to /florida/services
      {
        source: '/services/:slug',
        destination: '/florida/services/:slug',
        permanent: true,
      },
      {
        source: '/services',
        destination: '/florida/services',
        permanent: true,
      },

      // Global pages to /florida
      {
        source: '/gallery/:path*',
        destination: '/florida/gallery/:path*',
        permanent: true,
      },
      {
        source: '/gallery',
        destination: '/florida/gallery',
        permanent: true,
      },
      {
        source: '/about',
        destination: '/florida/about',
        permanent: true,
      },
      {
        source: '/blog/:path*',
        destination: '/florida/blog/:path*',
        permanent: true,
      },
      {
        source: '/blog',
        destination: '/florida/blog',
        permanent: true,
      },
      {
        source: '/faqs',
        destination: '/florida/faqs',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/florida/contact',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
