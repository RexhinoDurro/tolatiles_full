'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowRight, Tag, Phone, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import type { BlogCategory, BlogPostListItem } from '@/types/api';
import { CONTENT_TYPE_ROUTE_PREFIX, CONTENT_TYPE_LABELS_PLURAL, type ContentType } from '@/lib/contentTypes';

const PHONE_NUMBER = '(904) 866-1738';

const ctaDescriptions: Record<string, string> = {
  jacksonville:
    'Contact Tola Tiles today for a free estimate. We serve all of Jacksonville and Duval County, from Riverside and San Marco to Mandarin, Southside, and the Beaches.',
  'st-augustine':
    'Contact Tola Tiles today for a free estimate. We serve all of St. Augustine and St. Johns County, including the Historic District, Vilano Beach, Anastasia Island, Nocatee, and World Golf Village.',
  florida:
    'Contact Tola Tiles today for a free estimate. We serve Jacksonville, St. Augustine, Ponte Vedra, Palm Coast, and the greater Northeast Florida area.',
};

interface ContentCategoryPageProps {
  category: BlogCategory;
  posts: BlogPostListItem[];
  contentType: ContentType;
  location?: string;
}

export default function ContentCategoryPage({ category, posts, contentType, location = 'florida' }: ContentCategoryPageProps) {
  const ctaDescription = ctaDescriptions[location] || ctaDescriptions.florida;
  const prefix = CONTENT_TYPE_ROUTE_PREFIX[contentType];
  const indexLabel = CONTENT_TYPE_LABELS_PLURAL[contentType];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-[var(--navbar-height)]">
      {/* Hero Section */}
      <section className="bg-brand-light text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <span>/</span>
              <Link href={`/${prefix}`} className="hover:text-white">
                {indexLabel}
              </Link>
              <span>/</span>
              <span className="text-white">{category.name}</span>
            </nav>

            <div className="flex items-center gap-3 mb-4">
              <Tag className="w-8 h-8" />
              <h1 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>{category.name}</h1>
            </div>

            {category.description && (
              <p className="text-xl text-white/90 mb-6">{category.description}</p>
            )}

            <p className="text-white/80">
              {posts.length} {posts.length === 1 ? 'article' : 'articles'} in this category
            </p>
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No articles in this category yet</p>
              <Link href={`/${prefix}`} className="text-[#00a8e8] hover:underline">
                Browse all {indexLabel.toLowerCase()}
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <Link href={`/${prefix}/${post.slug}`}>
                    <div className="relative aspect-video overflow-hidden bg-gray-100">
                      {post.featured_image ? (
                        <Image
                          src={post.featured_image}
                          alt={post.featured_image_alt || post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#e6f6fd]">
                          <ImageIcon className="w-10 h-10 text-[#00a8e8]" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      {/* Title */}
                      <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#00a8e8] transition-colors line-clamp-2">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {post.excerpt || 'Read more about this topic...'}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(post.publish_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.reading_time} min read
                        </span>
                      </div>

                      {/* Read More */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <span className="inline-flex items-center gap-2 text-[#00a8e8] font-medium group-hover:gap-3 transition-all">
                          Read More
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Back to index */}
      <div className="container mx-auto px-4 py-8">
        <Link
          href={`/${prefix}`}
          className="inline-flex items-center gap-2 text-[#00a8e8] font-medium hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {indexLabel}
        </Link>
      </div>

      {/* CTA Section */}
      <section className="bg-[#00a8e8] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>Ready to Start Your Tile Project?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {ctaDescription}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`tel:${PHONE_NUMBER.replace(/[^0-9]/g, '')}`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-light text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors shadow-sm border border-transparent hover:border-white"
            >
              <Phone className="w-5 h-5" />
              {PHONE_NUMBER}
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-[#00a8e8] transition-colors"
            >
              Get Free Estimate
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* NAP Block */}
      <section className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-700 font-medium">Tola Tiles</p>
          <p className="text-gray-600">445 Hutchinson Ln, St. Augustine, FL 32095</p>
          <p className="text-gray-600">{PHONE_NUMBER}</p>
        </div>
      </section>
    </div>
  );
}
