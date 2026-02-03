'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Check, Globe, Search } from 'lucide-react';

interface SEOFieldsProps {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  canonicalUrl: string;
  isIndexed: boolean;
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onCanonicalUrlChange: (value: string) => void;
  onIsIndexedChange: (value: boolean) => void;
  title?: string; // Fallback title
}

export default function SEOFields({
  metaTitle,
  metaDescription,
  slug,
  canonicalUrl,
  isIndexed,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onSlugChange,
  onCanonicalUrlChange,
  onIsIndexedChange,
  title,
}: SEOFieldsProps) {
  const [slugEdited, setSlugEdited] = useState(false);

  const metaTitleLength = metaTitle.length;
  const metaDescLength = metaDescription.length;
  const displayTitle = metaTitle || title || 'Your Page Title';
  const displayDesc = metaDescription || 'Your meta description will appear here...';

  const getCharCountColor = (current: number, max: number, min: number = 0) => {
    if (current === 0) return 'text-gray-400';
    if (current < min || current > max) return 'text-red-500';
    if (current > max * 0.9) return 'text-yellow-500';
    return 'text-green-500';
  };

  const generateSlugFromTitle = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Auto-generate slug from title if not manually edited
  useEffect(() => {
    if (!slugEdited && title && !slug) {
      onSlugChange(generateSlugFromTitle(title));
    }
  }, [title, slug, slugEdited, onSlugChange]);

  const handleSlugChange = (value: string) => {
    setSlugEdited(true);
    onSlugChange(value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
  };

  return (
    <div className="space-y-6">
      {/* Search Preview */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Search className="w-4 h-4" />
          Search Preview
        </h4>
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-blue-600 text-lg hover:underline cursor-pointer truncate">
            {displayTitle.substring(0, 60)}
            {displayTitle.length > 60 && '...'}
          </div>
          <div className="text-green-700 text-sm mt-1">
            tolatiles.com/blog/{slug || 'your-post-url'}
          </div>
          <div className="text-gray-600 text-sm mt-1 line-clamp-2">
            {displayDesc.substring(0, 160)}
            {displayDesc.length > 160 && '...'}
          </div>
        </div>
      </div>

      {/* Meta Title */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Meta Title
          </label>
          <span className={`text-sm ${getCharCountColor(metaTitleLength, 60, 30)}`}>
            {metaTitleLength}/60 characters
          </span>
        </div>
        <input
          type="text"
          value={metaTitle}
          onChange={(e) => onMetaTitleChange(e.target.value)}
          placeholder={title || 'Enter meta title'}
          maxLength={70}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Optimal length: 30-60 characters. Falls back to post title if empty.
        </p>
      </div>

      {/* Meta Description */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Meta Description
          </label>
          <span className={`text-sm ${getCharCountColor(metaDescLength, 160, 70)}`}>
            {metaDescLength}/160 characters
          </span>
        </div>
        <textarea
          value={metaDescription}
          onChange={(e) => onMetaDescriptionChange(e.target.value)}
          placeholder="Enter a compelling description for search results..."
          rows={3}
          maxLength={170}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Optimal length: 70-160 characters. Falls back to excerpt if empty.
        </p>
      </div>

      {/* URL Slug */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL Slug
        </label>
        <div className="flex items-center">
          <span className="px-4 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm">
            /blog/
          </span>
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="your-post-url"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          URL-friendly identifier. Use lowercase letters, numbers, and hyphens only.
        </p>
      </div>

      {/* Canonical URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Canonical URL (optional)
        </label>
        <div className="flex items-center">
          <span className="px-4 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500">
            <Globe className="w-4 h-4" />
          </span>
          <input
            type="url"
            value={canonicalUrl}
            onChange={(e) => onCanonicalUrlChange(e.target.value)}
            placeholder="https://example.com/original-post"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Only set if this content originally exists elsewhere.
        </p>
      </div>

      {/* Indexing Toggle */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onIsIndexedChange(!isIndexed)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isIndexed ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isIndexed ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <div>
          <label className="text-sm font-medium text-gray-700">
            Allow Search Engines to Index
          </label>
          <p className="text-xs text-gray-500 mt-0.5">
            {isIndexed
              ? 'This post will appear in search results.'
              : 'This post will be hidden from search engines (noindex).'}
          </p>
        </div>
      </div>
    </div>
  );
}
