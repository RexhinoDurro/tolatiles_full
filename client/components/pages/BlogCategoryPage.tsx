'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowRight, Tag, Phone, ArrowLeft } from 'lucide-react';
import type { BlogCategory, BlogPostListItem } from '@/types/api';

const PHONE_NUMBER = '(904) 866-1738';

interface BlogCategoryPageProps {
  category: BlogCategory;
  posts: BlogPostListItem[];
}

export default function BlogCategoryPage({ category, posts }: BlogCategoryPageProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
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
              <span className="text-white">{category.name}</span>
            </nav>

            <div className="flex items-center gap-3 mb-4">
              <Tag className="w-8 h-8" />
              <h1 className="text-4xl md:text-5xl font-bold">{category.name}</h1>
            </div>

            {category.description && (
              <p className="text-xl text-blue-100 mb-6">{category.description}</p>
            )}

            <p className="text-blue-200">
              {posts.length} {posts.length === 1 ? 'article' : 'articles'} in this category
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No articles in this category yet</p>
              <Link href="/blog" className="text-blue-600 hover:underline">
                Browse all articles
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="relative aspect-video overflow-hidden bg-gray-100">
                      {post.featured_image ? (
                        <Image
                          src={post.featured_image}
                          alt={post.featured_image_alt || post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                          <span className="text-4xl">📝</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      {/* Title */}
                      <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
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
                        <span className="inline-flex items-center gap-2 text-blue-600 font-medium group-hover:gap-3 transition-all">
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

      {/* Back to Blog */}
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>
      </div>

      {/* CTA Section */}
      <section className="bg-blue-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Tile Project?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Contact Tola Tiles today for a free estimate. We serve St. Augustine, Jacksonville,
            and the surrounding North Florida area.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`tel:${PHONE_NUMBER.replace(/[^0-9]/g, '')}`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-900 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Phone className="w-5 h-5" />
              {PHONE_NUMBER}
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-900 transition-colors"
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
