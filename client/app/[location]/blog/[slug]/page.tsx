import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostPage from '@/components/pages/BlogPostPage';
import { VALID_LOCATIONS, isValidLocation, locationNames, type LocationType } from '@/lib/locations';

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
  params: Promise<{ location: string; slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;

  if (!isValidLocation(resolvedParams.location)) {
    return { title: 'Not Found' };
  }

  const post = await getPost(resolvedParams.slug);
  const locationName = locationNames[resolvedParams.location];

  if (!post) {
    return {
      title: `Post Not Found | Tola Tiles Blog ${locationName}`,
    };
  }

  return {
    title: `${post.effective_meta_title} | Tola Tiles Blog ${locationName}`,
    description: post.effective_meta_description,
    alternates: {
      canonical: post.canonical_url || `https://tolatiles.com/${resolvedParams.location}/blog/${post.slug}`,
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

function generateBlogPostSchema(post: any, location: string) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://tolatiles.com/${location}/blog/${post.slug}`,
    },
    headline: post.title,
    description: post.effective_meta_description || post.excerpt,
    image: post.featured_image || 'https://tolatiles.com/images/logo.webp',
    author: {
      '@type': 'Person',
      name: post.author_name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Tola Tiles',
      logo: {
        '@type': 'ImageObject',
        url: 'https://tolatiles.com/images/logo.webp',
      },
    },
    datePublished: post.publish_date,
    dateModified: post.last_updated,
  };

  return schema;
}

function generateFaqSchema(post: any) {
  if (!post.has_faq_schema || !post.faq_data?.length) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faq_data.map((faq: any) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export default async function BlogPost({ params }: { params: Promise<{ location: string; slug: string }> }) {
  const resolvedParams = await params;

  if (!isValidLocation(resolvedParams.location)) {
    notFound();
  }

  const post = await getPost(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(resolvedParams.slug);
  const blogPostSchema = generateBlogPostSchema(post, resolvedParams.location);
  const faqSchema = generateFaqSchema(post);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <BlogPostPage post={post} relatedPosts={relatedPosts} location={resolvedParams.location} />
    </>
  );
}
