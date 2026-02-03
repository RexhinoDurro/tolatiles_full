import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogCategoryPage from '@/components/pages/BlogCategoryPage';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function getCategory(slug: string) {
  try {
    const response = await fetch(`${API_BASE}/blog/categories/${slug}/`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    return null;
  }
}

async function getCategoryPosts(slug: string) {
  try {
    const response = await fetch(`${API_BASE}/blog/posts/?category=${slug}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : data.results || [];
  } catch (error) {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = await getCategory(params.slug);

  if (!category) {
    return {
      title: 'Category Not Found | Tola Tiles Blog',
    };
  }

  return {
    title: `${category.name} - Tile Tips & Articles | Tola Tiles Blog`,
    description:
      category.description ||
      `Browse ${category.name} articles from Tola Tiles. Expert tips and insights for your tile installation project.`,
    alternates: {
      canonical: `https://tolatiles.com/blog/category/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategory(params.slug);

  if (!category) {
    notFound();
  }

  const posts = await getCategoryPosts(params.slug);

  return <BlogCategoryPage category={category} posts={posts} />;
}
