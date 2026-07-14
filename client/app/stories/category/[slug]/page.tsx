import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ContentCategoryPage from '@/components/pages/ContentCategoryPage';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function getCategory(slug: string) {
  try {
    const response = await fetch(`${API_BASE}/blog/categories/${slug}/`, { next: { revalidate: 60 } });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

async function getCategoryPosts(slug: string) {
  try {
    const response = await fetch(`${API_BASE}/blog/posts/?category=${slug}&content_type=story`, { next: { revalidate: 60 } });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : data.results || [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) return { title: 'Category Not Found | Tola Tiles Stories' };

  return {
    title: `${category.name} - Customer Stories Jacksonville & St. Augustine FL | Tola Tiles`,
    description: category.description || `Browse ${category.name} stories from Tola Tiles for Jacksonville and St. Augustine FL.`,
    alternates: {
      canonical: `https://tolatiles.com/stories/category/${category.slug}`,
    },
  };
}

export default async function StoryCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) notFound();

  const posts = await getCategoryPosts(slug);

  return <ContentCategoryPage category={category} posts={posts} contentType="story" location="florida" />;
}
