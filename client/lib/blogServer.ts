import type { BlogPostListItem } from '@/types/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Server-side fetch for the homepage "From Our Blog" carousel so real posts are
 * present in the initial HTML for crawlers, not injected client-side after
 * hydration. Falls back to an empty array (never fabricated placeholder posts)
 * if the API is unavailable.
 */
export async function getHomepageBlogPosts(): Promise<BlogPostListItem[]> {
  try {
    const res = await fetch(`${API_BASE}/blog/posts/?status=published&ordering=-publish_date&page_size=6`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error('blog posts fetch failed');
    const data = await res.json();
    return Array.isArray(data) ? data : data.results || [];
  } catch {
    return [];
  }
}
