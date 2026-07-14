import { MetadataRoute } from 'next';
import { CONTENT_TYPES, CONTENT_TYPE_ROUTE_PREFIX } from '@/lib/contentTypes';

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

interface ContentSitemapPost {
  slug: string;
  location: string;
  content_type: string;
  category_slugs: string[];
  last_updated: string;
  publish_date: string;
}

// Fetch content engine posts (blog/guides/design-ideas/stories) for sitemap
async function getContentSitemapData(): Promise<ContentSitemapPost[]> {
  try {
    const response = await fetch(`${API_BASE}/blog/posts/sitemap_data/`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error('Failed to fetch content sitemap data:', error);
    return [];
  }
}

// Fetch public projects for sitemap
async function getProjectsSitemapData(): Promise<Array<{ id: number; slug: string; updated_at: string }>> {
  try {
    const response = await fetch(`${API_BASE}/projects/public/`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error('Failed to fetch projects sitemap data:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch content engine + projects data
  const [contentPosts, projects] = await Promise.all([
    getContentSitemapData(),
    getProjectsSitemapData(),
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
    // Content engine index pages — one per content type
    ...CONTENT_TYPES.map((type) => ({
      url: `${BASE_URL}/${CONTENT_TYPE_ROUTE_PREFIX[type]}`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    })),
  ];
  for (const loc of locations) {
    locationStaticPages.push(
      { url: `${BASE_URL}/${loc}/about`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.8 },
      { url: `${BASE_URL}/${loc}/contact`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.9 },
      { url: `${BASE_URL}/${loc}/faqs`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.8 }
    );
  }

  // Content post pages — single canonical URL per post, bucketed by content
  // type, regardless of the post's `location` tag (no per-city URLs; see
  // next.config.js redirects for /jacksonville/blog and /st-augustine/blog).
  const contentPostPages: MetadataRoute.Sitemap = contentPosts.map((post) => ({
    url: `${BASE_URL}/${CONTENT_TYPE_ROUTE_PREFIX[post.content_type as keyof typeof CONTENT_TYPE_ROUTE_PREFIX] || 'blog'}/${post.slug}`,
    lastModified: post.last_updated?.split('T')[0] || post.publish_date?.split('T')[0] || currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Projects — single global URLs (not location-prefixed)
  const projectPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/projects`, lastModified: currentDate, changeFrequency: 'weekly' as const, priority: 0.85 },
    ...projects.map((p) => ({
      url: `${BASE_URL}/projects/${p.slug}`,
      lastModified: p.updated_at?.split('T')[0] || currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];

  // Category archive pages — root only, no per-city variants. Only emit a
  // (content type, category) URL if at least one published post actually
  // has it, derived from the posts returned above (no unconditional listing
  // of every category, which would otherwise create empty archive pages).
  const categoryPairs = new Set<string>();
  for (const post of contentPosts) {
    for (const categorySlug of post.category_slugs || []) {
      categoryPairs.add(`${post.content_type}::${categorySlug}`);
    }
  }
  const contentCategoryPages: MetadataRoute.Sitemap = Array.from(categoryPairs).map((pair) => {
    const [contentType, categorySlug] = pair.split('::');
    const prefix = CONTENT_TYPE_ROUTE_PREFIX[contentType as keyof typeof CONTENT_TYPE_ROUTE_PREFIX] || 'blog';
    return {
      url: `${BASE_URL}/${prefix}/category/${categorySlug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    };
  });

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
    ...projectPages,
    ...contentPostPages,
    ...contentCategoryPages,
    ...globalStaticPages,
  ];
}
