'use client';

import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { Calendar, Clock, User, Tag, Phone, ArrowRight, ArrowLeft, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import type { BlogPost, BlogPostListItem } from '@/types/api';

const PHONE_NUMBER = '(904) 866-1738';
const COMPANY_NAME = 'Tola Tiles';
const COMPANY_ADDRESS = '445 Hutchinson Ln, St. Augustine, FL 32095';

interface BlogPostPageProps {
  post: BlogPost;
  relatedPosts: BlogPostListItem[];
}

export default function BlogPostPage({ post, relatedPosts }: BlogPostPageProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(post.title);

  // BlogPosting Schema
  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://tolatiles.com/blog/${post.slug}`,
    },
    headline: post.title,
    description: post.effective_meta_description,
    image: post.featured_image || 'https://tolatiles.com/images/logo.webp',
    author: {
      '@type': 'Person',
      name: post.author_name,
    },
    publisher: {
      '@type': 'Organization',
      name: COMPANY_NAME,
      logo: {
        '@type': 'ImageObject',
        url: 'https://tolatiles.com/images/logo.webp',
      },
    },
    datePublished: post.publish_date,
    dateModified: post.last_updated,
  };

  // FAQ Schema (if enabled)
  const faqSchema = post.has_faq_schema && post.faq_data?.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faq_data.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : null;

  return (
    <>
      {/* Schema Markup */}
      <Script
        id="blog-posting-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      {faqSchema && (
        <Script
          id="faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <article className="min-h-screen bg-white">
        {/* Hero Section */}
        <header className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 text-blue-200 text-sm mb-6">
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-white">
                  Blog
                </Link>
                <span>/</span>
                <span className="text-white truncate">{post.title}</span>
              </nav>

              {/* Categories */}
              {post.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/blog/category/${cat.slug}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 text-white text-sm rounded-full hover:bg-white/30 transition-colors"
                    >
                      <Tag className="w-3 h-3" />
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-bold mb-6">{post.title}</h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-blue-100">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {post.author_name}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.publish_date)}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {post.reading_time} min read
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="container mx-auto px-4 -mt-8">
            <div className="max-w-4xl mx-auto">
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-xl">
                <Image
                  src={post.featured_image}
                  alt={post.featured_image_alt || post.title}
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3">
                {/* Article Content */}
                <div
                  className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-blue-600 prose-img:rounded-lg"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* FAQ Section */}
                {post.has_faq_schema && post.faq_data?.length > 0 && (
                  <section className="mt-12 pt-8 border-t border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                      {post.faq_data.map((faq, index) => (
                        <details
                          key={index}
                          className="bg-gray-50 rounded-lg overflow-hidden group"
                        >
                          <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-100">
                            {faq.question}
                            <span className="text-blue-600 group-open:rotate-180 transition-transform">
                              ▼
                            </span>
                          </summary>
                          <div className="px-6 pb-4 text-gray-600">{faq.answer}</div>
                        </details>
                      ))}
                    </div>
                  </section>
                )}

                {/* CTA Section */}
                <section className="mt-12 p-8 bg-blue-50 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Ready to Start Your Tile Project?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Contact Tola Tiles today for a free estimate on your next tile installation
                    project.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <a
                      href={`tel:${PHONE_NUMBER.replace(/[^0-9]/g, '')}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      {PHONE_NUMBER}
                    </a>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      Get Free Estimate
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </section>

                {/* Social Sharing */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600 font-medium">Share this article:</span>
                    <div className="flex gap-2">
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        aria-label="Share on Facebook"
                      >
                        <Facebook className="w-5 h-5" />
                      </a>
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                        aria-label="Share on Twitter"
                      >
                        <Twitter className="w-5 h-5" />
                      </a>
                      <a
                        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                        aria-label="Share on LinkedIn"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  {/* Contact Card */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Need Help?</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Our team is ready to help with your tile project.
                    </p>
                    <a
                      href={`tel:${PHONE_NUMBER.replace(/[^0-9]/g, '')}`}
                      className="flex items-center gap-2 text-blue-600 font-semibold hover:underline"
                    >
                      <Phone className="w-4 h-4" />
                      {PHONE_NUMBER}
                    </a>
                  </div>

                  {/* NAP Block */}
                  <div className="bg-gray-50 rounded-xl p-6 text-sm">
                    <h3 className="font-bold text-gray-900 mb-3">{COMPANY_NAME}</h3>
                    <p className="text-gray-600">{COMPANY_ADDRESS}</p>
                    <p className="text-gray-600">{PHONE_NUMBER}</p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-gray-50 py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      href={`/blog/${relatedPost.slug}`}
                      className="flex gap-4 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {relatedPost.featured_image ? (
                        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src={relatedPost.featured_image}
                            alt={relatedPost.featured_image_alt || relatedPost.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 flex-shrink-0 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">📝</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(relatedPost.publish_date)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Back to Blog */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
