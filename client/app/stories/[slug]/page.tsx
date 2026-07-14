import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ContentDetailPage from '@/components/pages/ContentDetailPage';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function getPost(slug: string) {
  try {
    const response = await fetch(`${API_BASE}/blog/posts/${slug}/`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    const post = await response.json();
    if (post.content_type !== 'story') return null;
    return post;
  } catch {
    return null;
  }
}

async function getRelatedPosts(slug: string) {
  try {
    const response = await fetch(`${API_BASE}/blog/posts/${slug}/related/`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: 'Story Not Found | Tola Tiles' };
  }

  return {
    title: `${post.effective_meta_title} | Tola Tiles Stories`,
    description: post.effective_meta_description,
    alternates: {
      canonical: post.canonical_url || `https://tolatiles.com/stories/${post.slug}`,
    },
    robots: post.is_indexed ? 'index, follow' : 'noindex, nofollow',
    openGraph: {
      title: post.effective_meta_title,
      description: post.effective_meta_description,
      type: 'article',
      publishedTime: post.publish_date,
      modifiedTime: post.last_updated,
      authors: [post.author_name],
      images: post.featured_image ? [{ url: post.featured_image, alt: post.featured_image_alt || post.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.effective_meta_title,
      description: post.effective_meta_description,
      images: post.featured_image ? [post.featured_image] : [],
    },
  };
}

export default async function Story({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const relatedPosts = await getRelatedPosts(slug);

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://tolatiles.com' },
          { name: 'Stories', url: 'https://tolatiles.com/stories' },
          { name: post.title, url: `https://tolatiles.com/stories/${post.slug}` },
        ]}
      />
      <ContentDetailPage post={post} relatedPosts={relatedPosts} contentType="story" location="florida" />
    </>
  );
}
