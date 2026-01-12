import { MetadataRoute } from 'next';

const BASE_URL = 'https://tolatiles.com';

// Florida (generic) service slugs
const floridaServiceSlugs = [
  'kitchen-backsplash',
  'bathroom-tile',
  'floor-tile',
  'patio-tile',
  'fireplace-tile',
  'shower-tile',
];

// Jacksonville service slugs
const jacksonvilleServiceSlugs = [
  'kitchen-backsplash-jacksonville',
  'bathroom-tile-jacksonville',
  'floor-tile-jacksonville',
  'patio-tile-jacksonville',
  'fireplace-tile-jacksonville',
  'shower-tile-jacksonville',
];

// St Augustine service slugs
const stAugustineServiceSlugs = [
  'kitchen-backsplash-st-augustine',
  'bathroom-tile-st-augustine',
  'floor-tile-st-augustine',
  'patio-tile-st-augustine',
  'fireplace-tile-st-augustine',
  'shower-tile-st-augustine',
];

// Gallery categories
const galleryCategories = [
  'backsplashes',
  'showers',
  'flooring',
  'patios',
  'fireplaces',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/gallery`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/faqs`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms-of-service`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    // Location landing pages
    {
      url: `${BASE_URL}/jacksonville`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/st-augustine`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // Florida service detail pages
  const floridaServicePages: MetadataRoute.Sitemap = floridaServiceSlugs.map((slug) => ({
    url: `${BASE_URL}/services/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  // Jacksonville service detail pages (high priority for local SEO)
  const jacksonvilleServicePages: MetadataRoute.Sitemap = jacksonvilleServiceSlugs.map((slug) => ({
    url: `${BASE_URL}/services/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // St Augustine service detail pages (high priority for local SEO)
  const stAugustineServicePages: MetadataRoute.Sitemap = stAugustineServiceSlugs.map((slug) => ({
    url: `${BASE_URL}/services/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Gallery category pages
  const galleryPages: MetadataRoute.Sitemap = galleryCategories.map((category) => ({
    url: `${BASE_URL}/gallery/${category}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...floridaServicePages,
    ...jacksonvilleServicePages,
    ...stAugustineServicePages,
    ...galleryPages,
  ];
}
