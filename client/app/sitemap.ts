import { MetadataRoute } from 'next';

const BASE_URL = 'https://tolatiles.com';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Use date-only format (YYYY-MM-DD) instead of full ISO timestamp
// This reduces signal noise from timestamps changing on every build
const currentDate = new Date().toISOString().split('T')[0];

// Static dates for truly static pages
const STATIC_PAGE_DATE = '2024-01-15';

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

// Fetch blog posts for sitemap
async function getBlogSitemapData(): Promise<Array<{ slug: string; last_updated: string; publish_date: string }>> {
  try {
    const response = await fetch(`${API_BASE}/blog/posts/sitemap_data/`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error('Failed to fetch blog sitemap data:', error);
    return [];
  }
}

// Fetch blog categories for sitemap
async function getBlogCategories(): Promise<Array<{ slug: string }>> {
  try {
    const response = await fetch(`${API_BASE}/blog/categories/`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : data.results || [];
  } catch (error) {
    console.error('Failed to fetch blog categories:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch blog data
  const [blogPosts, blogCategories] = await Promise.all([
    getBlogSitemapData(),
    getBlogCategories(),
  ]);

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
      url: `${BASE_URL}/blog`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: STATIC_PAGE_DATE,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms-of-service`,
      lastModified: STATIC_PAGE_DATE,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    // Location landing pages - increased priority for local SEO
    {
      url: `${BASE_URL}/jacksonville`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/st-augustine`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.95,
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

  // Blog post pages
  const blogPostPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.last_updated?.split('T')[0] || post.publish_date?.split('T')[0] || currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Blog category pages
  const blogCategoryPages: MetadataRoute.Sitemap = blogCategories.map((category) => ({
    url: `${BASE_URL}/blog/category/${category.slug}`,
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
    ...blogPostPages,
    ...blogCategoryPages,
  ];
}
