import type { BlogPostListItem, BlogCategory } from '@/types/api';
import type { ContentType } from '@/lib/contentTypes';

// INTERNAL_API_URL hits the backend container directly over the Docker network,
// bypassing nginx entirely. Without it, SSR fetches loop back through the public
// domain (hairpin NAT) and share nginx's per-IP rate limit with real visitor
// traffic, causing intermittent 503s under concurrent page renders.
const API_BASE = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Server-side fetch for content-engine index/category pages. Used by the
 * route's page.tsx (a server component) so the default "All Posts" view is
 * present in the initial HTML for crawlers — the client component only
 * re-fetches when a visitor actively switches the category filter.
 */
export async function getContentPosts(contentType: ContentType, category?: string): Promise<BlogPostListItem[]> {
  try {
    const params = new URLSearchParams({ content_type: contentType });
    if (category) params.set('category', category);
    const response = await fetch(`${API_BASE}/blog/posts/?${params.toString()}`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : data.results || [];
  } catch {
    return [];
  }
}

export async function getContentCategories(): Promise<BlogCategory[]> {
  try {
    const response = await fetch(`${API_BASE}/blog/categories/`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : data.results || [];
  } catch {
    return [];
  }
}
