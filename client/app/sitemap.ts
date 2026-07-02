import { MetadataRoute } from 'next';

const BASE_URL = 'https://tolatiles.com';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Use date-only format (YYYY-MM-DD) instead of full ISO timestamp
// This reduces signal noise from timestamps changing on every build
const currentDate = new Date().toISOString().split('T')[0];

// Static dates for truly static pages
const STATIC_PAGE_DATE = '2024-01-15';

// City-specific locations only (florida content lives at root now)
const locations = ['jacksonville', 'st-augustine'];

// Service slugs (same for all locations now)
const serviceSlugs = [
  'kitchen-backsplash',
  'bathroom-tile',
  'floor-tile',
  'patio-tile',
  'fireplace-tile',
  'shower-tile',
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
async function getBlogSitemapData(): Promise<Array<{ slug: string; location: string; last_updated: string; publish_date: string }>> {
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

  // Root homepage (Florida content) + city pages
  const locationHomePages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    ...locations.map((loc) => ({
      url: `${BASE_URL}/${loc}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    })),
  ];

  // Service pages — root level + city pages
  const servicePages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/services`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    ...serviceSlugs.map((slug) => ({
      url: `${BASE_URL}/services/${slug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
  ];
  for (const loc of locations) {
    servicePages.push({
      url: `${BASE_URL}/${loc}/services`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    });
    for (const slug of serviceSlugs) {
      servicePages.push({
        url: `${BASE_URL}/${loc}/services/${slug}`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      });
    }
  }

  // Gallery pages — root level + city pages
  const galleryPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/gallery`, lastModified: currentDate, changeFrequency: 'weekly' as const, priority: 0.85 },
    ...galleryCategories.map((cat) => ({
      url: `${BASE_URL}/gallery/${cat}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
  for (const loc of locations) {
    galleryPages.push({
      url: `${BASE_URL}/${loc}/gallery`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    });
    for (const category of galleryCategories) {
      galleryPages.push({
        url: `${BASE_URL}/${loc}/gallery/${category}`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      });
    }
  }

  // Static pages — root level + city pages
  const locationStaticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/about`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${BASE_URL}/faqs`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${BASE_URL}/blog`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.9 },
  ];
  for (const loc of locations) {
    locationStaticPages.push(
      { url: `${BASE_URL}/${loc}/about`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.8 },
      { url: `${BASE_URL}/${loc}/contact`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.9 },
      { url: `${BASE_URL}/${loc}/faqs`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.8 }
    );
  }

  // Blog post pages — single canonical URL per post regardless of the
  // post's `location` tag (blog has no per-city URLs; see next.config.js
  // redirects for /jacksonville/blog and /st-augustine/blog).
  const blogPostPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.last_updated?.split('T')[0] || post.publish_date?.split('T')[0] || currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Blog category pages — root only, no per-city variants.
  const blogCategoryPages: MetadataRoute.Sitemap = blogCategories.map((category) => ({
    url: `${BASE_URL}/blog/category/${category.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Global static pages (not location-specific)
  const globalStaticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: STATIC_PAGE_DATE,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms-of-service`,
      lastModified: STATIC_PAGE_DATE,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];

  return [
    ...locationHomePages,
    ...servicePages,
    ...galleryPages,
    ...locationStaticPages,
    ...blogPostPages,
    ...blogCategoryPages,
    ...globalStaticPages,
  ];
}
