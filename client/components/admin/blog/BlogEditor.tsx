'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Save,
  Eye,
  Clock,
  Tag,
  X,
  AlertTriangle,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { api } from '@/lib/api';
import type {
  BlogPost,
  BlogPostCreate,
  BlogPostUpdate,
  BlogCategory,
  BlogPostStatus,
  BlogLocation,
  FAQItem,
} from '@/types/api';
import { CONTENT_TYPE_LABELS, CONTENT_TYPE_ROUTE_PREFIX, ADMIN_CONTENT_TYPE_ROUTE_PREFIX, RELATED_SERVICE_PAGE_OPTIONS, type ContentType } from '@/lib/contentTypes';
import TipTapEditor from './TipTapEditor';
import SEOFields from './SEOFields';
import FAQEditor from './FAQEditor';
import AIAssistant from './AIAssistant';
import InlineCalendarPicker from './InlineCalendarPicker';
import MediaPlanEditor from './MediaPlanEditor';
import SuggestedLinksPanel from './SuggestedLinksPanel';

interface BlogEditorProps {
  post?: BlogPost;
  isNew?: boolean;
  contentType?: ContentType;
}

export default function BlogEditor({ post, isNew = false, contentType: contentTypeProp }: BlogEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'faq' | 'media'>('content');
  const [slugWarning, setSlugWarning] = useState(false);
  const [originalSlug, setOriginalSlug] = useState(post?.slug || '');
  // Tracks media_plan/suggested_links resolve/accept/reject actions, which
  // mutate the post server-side outside the normal save flow (see
  // serializers.py -- those two fields are deliberately read-only there).
  const [currentPost, setCurrentPost] = useState<BlogPost | undefined>(post);

  // Form state
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [content, setContent] = useState(post?.content || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [authorName, setAuthorName] = useState(post?.author_name || 'Tola Tiles Team');
  const [metaTitle, setMetaTitle] = useState(post?.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(post?.meta_description || '');
  const [canonicalUrl, setCanonicalUrl] = useState(post?.canonical_url || '');
  const [isIndexed, setIsIndexed] = useState(post?.is_indexed ?? true);
  const [hasFaqSchema, setHasFaqSchema] = useState(post?.has_faq_schema ?? false);
  const [faqData, setFaqData] = useState<FAQItem[]>(post?.faq_data || []);
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    post?.categories?.map((c) => c.id) || []
  );
  const [status, setStatus] = useState<BlogPostStatus>(post?.status || 'draft');
  const [location, setLocation] = useState<BlogLocation>(post?.location || 'florida');
  const [contentType, setContentType] = useState<ContentType>(post?.content_type || contentTypeProp || 'blog');
  const [relatedServicePage, setRelatedServicePage] = useState(post?.related_service_page || '');
  const [autoAppended, setAutoAppended] = useState(post?.related_link_auto_appended || false);
  const [scheduledDate, setScheduledDate] = useState(
    post?.scheduled_publish_date
      ? new Date(post.scheduled_publish_date).toISOString().slice(0, 16)
      : ''
  );
  const [featuredImageAlt, setFeaturedImageAlt] = useState(post?.featured_image_alt || '');

  const handlePostUpdated = (updated: BlogPost) => {
    setCurrentPost(updated);
    setContent(updated.content); // a marker in `content` was just replaced server-side
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await api.getBlogCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  // Each category is scoped to a curated set of content types (empty
  // content_types = applies to all four, used for cross-cutting tags like
  // city names). Only offer categories valid for the currently selected
  // Content Type, so writers can't tag a Guide with a Blog-only category
  // (or invent one-off categories that fragment archive pages).
  const availableCategories = categories.filter(
    (category) => !category.content_types?.length || category.content_types.includes(contentType)
  );

  useEffect(() => {
    if (categories.length === 0) return; // categories haven't loaded yet — nothing to prune against
    const availableIds = new Set(availableCategories.map((c) => c.id));
    setSelectedCategories((prev) => prev.filter((id) => availableIds.has(id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentType, categories]);

  const handleSlugChange = (newSlug: string) => {
    if (!isNew && originalSlug && newSlug !== originalSlug) {
      setSlugWarning(true);
    } else {
      setSlugWarning(false);
    }
    setSlug(newSlug);
  };

  const handleSave = async (saveStatus?: BlogPostStatus) => {
    const finalStatus = saveStatus || status;

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!slug.trim()) {
      setError('URL slug is required');
      return;
    }

    if (finalStatus === 'published' && !content.trim()) {
      setError('Content is required to publish');
      return;
    }

    if (finalStatus === 'published' && contentType === 'blog' && !relatedServicePage.trim()) {
      setError('Related Service Page is required to publish a Blog post');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const postData: BlogPostCreate | BlogPostUpdate = {
        title: title.trim(),
        slug: slug.trim(),
        content,
        excerpt: excerpt.trim(),
        author_name: authorName.trim(),
        meta_title: metaTitle.trim(),
        meta_description: metaDescription.trim(),
        canonical_url: canonicalUrl.trim(),
        is_indexed: isIndexed,
        has_faq_schema: hasFaqSchema,
        faq_data: faqData,
        category_ids: selectedCategories,
        location,
        content_type: contentType,
        related_service_page: relatedServicePage,
        status: finalStatus,
        scheduled_publish_date: finalStatus === 'scheduled' ? scheduledDate : null,
      };

      if (featuredImageAlt) {
        postData.featured_image_alt = featuredImageAlt;
      }

      if (isNew) {
        const newPost = await api.createBlogPost(postData as BlogPostCreate);
        setAutoAppended(newPost.related_link_auto_appended);
        router.push(`/admin/${ADMIN_CONTENT_TYPE_ROUTE_PREFIX[contentType]}/${newPost.id}`);
      } else if (post) {
        const updatedPost = await api.updateBlogPost(post.slug, postData as BlogPostUpdate);
        setAutoAppended(updatedPost.related_link_auto_appended);
        // If slug changed, redirect to new URL
        if (slug !== post.slug) {
          router.push(`/admin/${ADMIN_CONTENT_TYPE_ROUTE_PREFIX[contentType]}/${post.id}`);
        }
      }

      setStatus(finalStatus);
      setOriginalSlug(slug);
      setSlugWarning(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleAIUpdateField = (field: string, value: string | FAQItem[]) => {
    switch (field) {
      case 'title':
        setTitle(value as string);
        break;
      case 'excerpt':
        setExcerpt(value as string);
        break;
      case 'meta_title':
        setMetaTitle(value as string);
        break;
      case 'meta_description':
        setMetaDescription(value as string);
        break;
      case 'slug':
        handleSlugChange(value as string);
        break;
      case 'faq_data':
        setFaqData(value as FAQItem[]);
        break;
      case 'has_faq_schema':
        setHasFaqSchema(value === 'true');
        break;
    }
  };

  const handleAIInsertContent = (newContent: string) => {
    setContent((prev) => (prev ? prev + '\n\n' + newContent : newContent));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/admin/${ADMIN_CONTENT_TYPE_ROUTE_PREFIX[contentType]}`)}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              {isNew ? 'New Post' : 'Edit Post'}
            </h1>
            {!isNew && post && (
              <span
                className={`px-2 py-1 text-xs font-medium rounded ${
                  status === 'published'
                    ? 'bg-green-100 text-green-700'
                    : status === 'scheduled'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {status === 'published' && !isNew && (
              <a
                href={`/${CONTENT_TYPE_ROUTE_PREFIX[contentType]}/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Eye className="w-4 h-4" />
                View
              </a>
            )}

            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Save Draft
            </button>

            <div className="relative group">
              <button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Publish
                <ChevronDown className="w-4 h-4" />
              </button>

              <div className="hidden group-hover:block absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-48">
                <button
                  onClick={() => handleSave('published')}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                >
                  Publish Now
                </button>
                <button
                  onClick={() => {
                    setActiveTab('content');
                    setStatus('scheduled');
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Slug Warning */}
      {slugWarning && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Warning: URL Change</p>
              <p className="text-sm mt-1">
                Changing the URL slug will break existing links to this post. The old URL{' '}
                <code className="bg-yellow-100 px-1 rounded">/blog/{originalSlug}</code> will no
                longer work.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Auto-appended CTA Review Banner */}
      {autoAppended && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="p-4 bg-blue-50 text-blue-800 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Review: CTA link auto-appended</p>
              <p className="text-sm mt-1">
                This post&apos;s body didn&apos;t already link to the selected Related Service Page, so a CTA link
                was automatically appended to the end of the content on publish. Consider integrating it more
                naturally into the body copy.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title"
                className="w-full text-3xl font-bold text-gray-900 border-0 focus:ring-0 placeholder-gray-300 p-0"
              />
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                    activeTab === 'content'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Content
                </button>
                <button
                  onClick={() => setActiveTab('seo')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                    activeTab === 'seo'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  SEO
                </button>
                <button
                  onClick={() => setActiveTab('faq')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                    activeTab === 'faq'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  FAQ Schema
                </button>
                <button
                  onClick={() => setActiveTab('media')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                    activeTab === 'media'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Media &amp; Links
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'content' && (
                  <div className="space-y-6">
                    <TipTapEditor
                      content={content}
                      onChange={setContent}
                      placeholder="Start writing your blog post..."
                      mediaPlan={currentPost?.media_plan}
                      suggestedLinks={currentPost?.suggested_links}
                    />

                    {/* Excerpt */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Excerpt
                      </label>
                      <textarea
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="Brief summary for listings..."
                        rows={3}
                        maxLength={300}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {excerpt.length}/300 characters
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'seo' && (
                  <SEOFields
                    metaTitle={metaTitle}
                    metaDescription={metaDescription}
                    slug={slug}
                    canonicalUrl={canonicalUrl}
                    isIndexed={isIndexed}
                    onMetaTitleChange={setMetaTitle}
                    onMetaDescriptionChange={setMetaDescription}
                    onSlugChange={handleSlugChange}
                    onCanonicalUrlChange={setCanonicalUrl}
                    onIsIndexedChange={setIsIndexed}
                    title={title}
                  />
                )}

                {activeTab === 'faq' && (
                  <FAQEditor
                    faqs={faqData}
                    onChange={setFaqData}
                    hasFaqSchema={hasFaqSchema}
                    onToggleSchema={setHasFaqSchema}
                  />
                )}

                {activeTab === 'media' && (
                  <div className="space-y-8">
                    {!currentPost ? (
                      <p className="text-sm text-gray-500 text-center py-8">
                        Save this post first — media/link planning applies to existing posts.
                      </p>
                    ) : (
                      <>
                        <div>
                          <h3 className="font-medium text-gray-900 mb-3">Media Plan</h3>
                          <MediaPlanEditor post={currentPost} onPostUpdated={handlePostUpdated} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 mb-3">Suggested Internal Links</h3>
                          <SuggestedLinksPanel post={currentPost} onPostUpdated={handlePostUpdated} />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            {/* Featured Image -- resolved via the Media & Links tab's picker
                (same AI/Gallery/Web/Paste URL flow as any media_plan image
                placeholder); this is a read-only preview that updates as
                soon as currentPost refreshes from that action. */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Featured Image</h3>
              {currentPost?.featured_image ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={currentPost.featured_image}
                    alt={currentPost.featured_image_alt || 'Featured image'}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-lg bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center px-4 text-center">
                  <p className="text-sm text-gray-500">
                    {currentPost
                      ? 'No featured image yet — resolve one from the Media & Links tab.'
                      : 'Save this post first, then resolve a featured image from the Media & Links tab.'}
                  </p>
                </div>
              )}
              <input
                type="text"
                value={featuredImageAlt}
                onChange={(e) => setFeaturedImageAlt(e.target.value)}
                placeholder="Alt text for image"
                className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Content Type */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Content Type</h3>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContentType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(CONTENT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Which site section this post publishes to: /blog, /guides, /design-ideas, or /stories.
              </p>
            </div>

            {/* Related Service Page */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">
                Related Service Page
                {contentType === 'blog' && <span className="text-red-500 ml-1">*</span>}
              </h3>
              <select
                value={relatedServicePage}
                onChange={(e) => setRelatedServicePage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">— None selected —</option>
                {RELATED_SERVICE_PAGE_OPTIONS.map((group) => (
                  <optgroup key={group.city} label={group.city}>
                    {group.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                {contentType === 'blog'
                  ? 'Required to publish. On publish, we check the body for an existing link to this page; if missing, a CTA link is auto-appended and flagged for review.'
                  : 'Optional for this content type. If set, we’ll still check the body for a link and auto-append a CTA if missing.'}
              </p>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Local Focus</h3>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as BlogLocation)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="florida">Northeast Florida (General)</option>
                <optgroup label="Duval County">
                  <option value="jacksonville">Jacksonville</option>
                </optgroup>
                <optgroup label="St. Johns County">
                  <option value="st-augustine">St. Augustine</option>
                </optgroup>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Tags which area this post targets for local SEO. This is a content tag only —
                every post publishes at /blog/... regardless of the location selected here.
              </p>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Categories
              </h3>
              <div className="space-y-2">
                {availableCategories.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No categories available for {CONTENT_TYPE_LABELS[contentType]} yet — add one
                    under Blog Categories and scope it to this content type.
                  </p>
                ) : (
                  availableCategories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, category.id]);
                          } else {
                            setSelectedCategories(
                              selectedCategories.filter((id) => id !== category.id)
                            );
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{category.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Author */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Author</h3>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Author name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Schedule */}
            {status === 'scheduled' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Schedule
                </h3>
                <InlineCalendarPicker
                  value={scheduledDate}
                  onChange={setScheduledDate}
                  excludePostSlug={post?.slug}
                />
                <p className="text-xs text-gray-500 mt-3">
                  Post will be automatically published at this time.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant
        currentTitle={title}
        currentContent={content}
        onInsertContent={handleAIInsertContent}
        onUpdateField={handleAIUpdateField}
      />

    </div>
  );
}
