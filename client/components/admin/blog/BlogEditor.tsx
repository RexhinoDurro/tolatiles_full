'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Save,
  Eye,
  Clock,
  Tag,
  Image as ImageIcon,
  X,
  AlertTriangle,
  Loader2,
  ChevronDown,
  Upload,
  Sparkles,
} from 'lucide-react';
import { api } from '@/lib/api';
import type {
  BlogPost,
  BlogPostCreate,
  BlogPostUpdate,
  BlogCategory,
  BlogPostStatus,
  FAQItem,
} from '@/types/api';
import TipTapEditor from './TipTapEditor';
import SEOFields from './SEOFields';
import FAQEditor from './FAQEditor';
import AIAssistant from './AIAssistant';
import AIImageGenerator from './AIImageGenerator';
import InlineCalendarPicker from './InlineCalendarPicker';

interface BlogEditorProps {
  post?: BlogPost;
  isNew?: boolean;
}

export default function BlogEditor({ post, isNew = false }: BlogEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'faq'>('content');
  const [slugWarning, setSlugWarning] = useState(false);
  const [originalSlug, setOriginalSlug] = useState(post?.slug || '');

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
  const [scheduledDate, setScheduledDate] = useState(
    post?.scheduled_publish_date
      ? new Date(post.scheduled_publish_date).toISOString().slice(0, 16)
      : ''
  );
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(
    post?.featured_image || null
  );
  const [featuredImageAlt, setFeaturedImageAlt] = useState(post?.featured_image_alt || '');
  const [showFeaturedImageAI, setShowFeaturedImageAI] = useState(false);

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

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImage(file);
      setFeaturedImagePreview(URL.createObjectURL(file));
    }
  };

  const removeFeaturedImage = () => {
    setFeaturedImage(null);
    setFeaturedImagePreview(null);
  };

  const handleAIFeaturedImage = async (imageUrl: string) => {
    try {
      // Fetch the AI-generated image and convert to File
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'ai_featured_image.png', { type: 'image/png' });

      // Set as featured image
      setFeaturedImage(file);
      // Use blob URL for preview to avoid Next.js Image optimization issues
      setFeaturedImagePreview(URL.createObjectURL(blob));
      setShowFeaturedImageAI(false);
    } catch (err) {
      console.error('Failed to set AI image as featured:', err);
    }
  };

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
        status: finalStatus,
        scheduled_publish_date: finalStatus === 'scheduled' ? scheduledDate : null,
      };

      if (featuredImage) {
        postData.featured_image = featuredImage;
      }
      if (featuredImageAlt) {
        postData.featured_image_alt = featuredImageAlt;
      }

      if (isNew) {
        const newPost = await api.createBlogPost(postData as BlogPostCreate);
        router.push(`/admin/blog/${newPost.id}`);
      } else if (post) {
        await api.updateBlogPost(post.slug, postData as BlogPostUpdate);
        // If slug changed, redirect to new URL
        if (slug !== post.slug) {
          router.push(`/admin/blog/${post.id}`);
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
              onClick={() => router.push('/admin/blog')}
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
                href={`/blog/${slug}`}
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
              </div>

              <div className="p-6">
                {activeTab === 'content' && (
                  <div className="space-y-6">
                    <TipTapEditor
                      content={content}
                      onChange={setContent}
                      placeholder="Start writing your blog post..."
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
              </div>
            </div>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            {/* Featured Image */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Featured Image</h3>
              {featuredImagePreview ? (
                <div className="relative">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={featuredImagePreview}
                      alt={featuredImageAlt || 'Featured image'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    onClick={removeFeaturedImage}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={featuredImageAlt}
                    onChange={(e) => setFeaturedImageAlt(e.target.value)}
                    placeholder="Alt text for image"
                    className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Upload option */}
                  <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFeaturedImageChange}
                      className="hidden"
                    />
                  </label>

                  {/* Divider */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 border-t border-gray-300" />
                    <span className="text-xs text-gray-400">or</span>
                    <div className="flex-1 border-t border-gray-300" />
                  </div>

                  {/* AI Generate button */}
                  <button
                    onClick={() => setShowFeaturedImageAI(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-medium transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate with AI
                  </button>
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Categories
              </h3>
              <div className="space-y-2">
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500">No categories available</p>
                ) : (
                  categories.map((category) => (
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

      {/* AI Image Generator Modal for Featured Images */}
      {showFeaturedImageAI && (
        <AIImageGenerator
          onClose={() => setShowFeaturedImageAI(false)}
          onImageGenerated={handleAIFeaturedImage}
          currentContent={title + ' ' + content}
          defaultAspectRatio="16:9"
          insertButtonText="Use as Featured Image"
          showAspectRatioSelector={false}
        />
      )}
    </div>
  );
}
