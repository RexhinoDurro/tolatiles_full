import { MetadataRoute } from 'next';

const BASE_URL = 'https://tolatiles.com';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Use date-only format (YYYY-MM-DD) instead of full ISO timestamp
// This reduces signal noise from timestamps changing on every build
const currentDate = new Date().toISOString().split('T')[0];

// Static dates for truly static pages
const STATIC_PAGE_DATE = '2024-01-15';

// Locations
const locations = ['florida', 'jacksonville', 'st-augustine'];

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

  // Location home pages - ALL city pages get equal priority for local SEO
  // Do NOT give Florida higher priority - this causes Google to prefer it over city pages
  const locationHomePages: MetadataRoute.Sitemap = locations.map((loc) => ({
    url: `${BASE_URL}/${loc}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 1.0, // All locations get top priority
  }));

  // Service pages for all locations
  const servicePages: MetadataRoute.Sitemap = [];
  for (const loc of locations) {
    // Services index page
    servicePages.push({
      url: `${BASE_URL}/${loc}/services`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    });

    // Individual service pages
    for (const slug of serviceSlugs) {
      servicePages.push({
        url: `${BASE_URL}/${loc}/services/${slug}`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: loc === 'florida' ? 0.85 : 0.9,
      });
    }
  }

  // Gallery pages for all locations
  const galleryPages: MetadataRoute.Sitemap = [];
  for (const loc of locations) {
    // Gallery index page
    galleryPages.push({
      url: `${BASE_URL}/${loc}/gallery`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    });

    // Gallery category pages
    for (const category of galleryCategories) {
      galleryPages.push({
        url: `${BASE_URL}/${loc}/gallery/${category}`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      });
    }
  }

  // Static pages for all locations
  const locationStaticPages: MetadataRoute.Sitemap = [];
  for (const loc of locations) {
    locationStaticPages.push(
      {
        url: `${BASE_URL}/${loc}/about`,
        lastModified: currentDate,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/${loc}/contact`,
        lastModified: currentDate,
        changeFrequency: 'monthly' as const,
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/${loc}/faqs`,
        lastModified: currentDate,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/${loc}/blog`,
        lastModified: currentDate,
        changeFrequency: 'daily' as const,
        priority: 0.9,
      }
    );
  }

  // Blog post pages (use post's location)
  const blogPostPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/${post.location || 'florida'}/blog/${post.slug}`,
    lastModified: post.last_updated?.split('T')[0] || post.publish_date?.split('T')[0] || currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Blog category pages for all locations
  const blogCategoryPages: MetadataRoute.Sitemap = [];
  for (const loc of locations) {
    for (const category of blogCategories) {
      blogCategoryPages.push({
        url: `${BASE_URL}/${loc}/blog/category/${category.slug}`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      });
    }
  }

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
