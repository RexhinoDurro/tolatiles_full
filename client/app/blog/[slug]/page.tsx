import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostPage from '@/components/pages/BlogPostPage';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function getPost(slug: string) {
  try {
    const response = await fetch(`${API_BASE}/blog/posts/${slug}/`, {
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

async function getRelatedPosts(slug: string) {
  try {
    const response = await fetch(`${API_BASE}/blog/posts/${slug}/related/`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return [];
    }

    return response.json();
  } catch (error) {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found | Tola Tiles Blog',
    };
  }

  return {
    title: `${post.effective_meta_title} | Tola Tiles Blog`,
    description: post.effective_meta_description,
    alternates: {
      canonical: post.canonical_url || `https://tolatiles.com/blog/${post.slug}`,
    },
    robots: post.is_indexed ? 'index, follow' : 'noindex, nofollow',
    openGraph: {
      title: post.effective_meta_title,
      description: post.effective_meta_description,
      type: 'article',
      publishedTime: post.publish_date,
      modifiedTime: post.last_updated,
      authors: [post.author_name],
      images: post.featured_image
        ? [
            {
              url: post.featured_image,
              alt: post.featured_image_alt || post.title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.effective_meta_title,
      description: post.effective_meta_description,
      images: post.featured_image ? [post.featured_image] : [],
    },
  };
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(params.slug);

  return <BlogPostPage post={post} relatedPosts={relatedPosts} />;
}
