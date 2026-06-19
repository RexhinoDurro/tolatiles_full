import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogCategoryPage from '@/components/pages/BlogCategoryPage';
import { VALID_LOCATIONS, isValidLocation, locationNames, type LocationType } from '@/lib/locations';

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

async function getCategoryPosts(slug: string, location?: string) {
  try {
    let url = `${API_BASE}/blog/posts/?category=${slug}`;
    if (location) {
      url += `&location=${location}`;
    }

    const response = await fetch(url, {
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
  params: Promise<{ location: string; slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;

  if (!isValidLocation(resolvedParams.location)) {
    return { title: 'Not Found' };
  }

  const category = await getCategory(resolvedParams.slug);
  const locationName = locationNames[resolvedParams.location];

  if (!category) {
    return {
      title: `Category Not Found | Tola Tiles Blog ${locationName}`,
    };
  }

  return {
    title: `${category.name} - Tile Tips & Articles ${locationName} | Tola Tiles Blog`,
    description:
      category.description ||
      `Browse ${category.name} articles from Tola Tiles for ${locationName}. Expert tips and insights for your tile installation project.`,
    alternates: {
      canonical: `https://tolatiles.com/${resolvedParams.location}/blog/category/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ location: string; slug: string }> }) {
  const resolvedParams = await params;

  if (!isValidLocation(resolvedParams.location)) {
    notFound();
  }

  const category = await getCategory(resolvedParams.slug);

  if (!category) {
    notFound();
  }

  const posts = await getCategoryPosts(resolvedParams.slug, resolvedParams.location);

  return <BlogCategoryPage category={category} posts={posts} location={resolvedParams.location} />;
}
