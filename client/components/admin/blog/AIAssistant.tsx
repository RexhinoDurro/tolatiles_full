'use client';

import { useState } from 'react';
import { Sparkles, Loader2, FileText, PenLine, Search, HelpCircle, X, Check, Copy } from 'lucide-react';
import { api } from '@/lib/api';
import type {
  AIGeneratePostResponse,
  AIGenerateSectionResponse,
  AIGenerateSEOResponse,
  FAQItem,
} from '@/types/api';

interface AIAssistantProps {
  currentTitle: string;
  currentContent: string;
  onInsertContent: (content: string) => void;
  onUpdateField: (field: string, value: string | FAQItem[]) => void;
}

type GenerationType = 'full' | 'intro' | 'body' | 'conclusion' | 'faq' | 'seo';

interface PreviewContent {
  type: GenerationType;
  data: AIGeneratePostResponse | AIGenerateSectionResponse | AIGenerateSEOResponse;
}

export default function AIAssistant({
  currentTitle,
  currentContent,
  onInsertContent,
  onUpdateField,
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState<'professional' | 'friendly' | 'informative'>('professional');
  const [preview, setPreview] = useState<PreviewContent | null>(null);

  const handleGenerateFull = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const keywordList = keywords.split(',').map(k => k.trim()).filter(Boolean);
      const response = await api.generateBlogPost({
        topic: topic.trim(),
        keywords: keywordList.length > 0 ? keywordList : undefined,
        tone,
      });

      if (response.error) {
        setError(response.error);
        return;
      }

      setPreview({ type: 'full', data: response });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSection = async (sectionType: 'intro' | 'body' | 'conclusion' | 'faq') => {
    const context = topic.trim() || currentTitle;
    if (!context) {
      setError('Please enter a topic or have a post title');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.generateBlogSection({
        section_type: sectionType,
        context,
        existing_content: currentContent || undefined,
      });

      if (response.error) {
        setError(response.error);
        return;
      }

      setPreview({ type: sectionType, data: response });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate section');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSEO = async () => {
    if (!currentTitle || !currentContent) {
      setError('Post needs a title and content to generate SEO');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.generateBlogSEO({
        title: currentTitle,
        content: currentContent,
      });

      if (response.error) {
        setError(response.error);
        return;
      }

      setPreview({ type: 'seo', data: response });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate SEO');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreview = () => {
    if (!preview) return;

    const { type, data } = preview;

    if (type === 'full') {
      const fullData = data as AIGeneratePostResponse;
      onUpdateField('title', fullData.title);
      onInsertContent(fullData.content);
      onUpdateField('excerpt', fullData.excerpt);
      onUpdateField('meta_title', fullData.meta_title);
      onUpdateField('meta_description', fullData.meta_description);
      if (fullData.faq_data?.length > 0) {
        onUpdateField('faq_data', fullData.faq_data);
        onUpdateField('has_faq_schema', 'true');
      }
    } else if (type === 'seo') {
      const seoData = data as AIGenerateSEOResponse;
      onUpdateField('meta_title', seoData.meta_title);
      onUpdateField('meta_description', seoData.meta_description);
      if (seoData.suggested_slug) {
        onUpdateField('slug', seoData.suggested_slug);
      }
    } else if (type === 'faq') {
      const faqData = data as AIGenerateSectionResponse;
      if (faqData.faq_data) {
        onUpdateField('faq_data', faqData.faq_data);
        onUpdateField('has_faq_schema', 'true');
      }
    } else {
      const sectionData = data as AIGenerateSectionResponse;
      if (sectionData.content) {
        onInsertContent(sectionData.content);
      }
    }

    setPreview(null);
    setTopic('');
    setKeywords('');
  };

  const renderPreviewContent = () => {
    if (!preview) return null;

    const { type, data } = preview;

    if (type === 'full') {
      const fullData = data as AIGeneratePostResponse;
      return (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-1">Title</h4>
            <p className="text-gray-900">{fullData.title}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-1">Content Preview</h4>
            <div
              className="prose prose-sm max-h-60 overflow-y-auto bg-gray-50 p-3 rounded"
              dangerouslySetInnerHTML={{ __html: fullData.content.substring(0, 1000) + '...' }}
            />
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-1">Excerpt</h4>
            <p className="text-sm text-gray-600">{fullData.excerpt}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-1">SEO</h4>
            <p className="text-sm text-blue-600">{fullData.meta_title}</p>
            <p className="text-sm text-gray-600">{fullData.meta_description}</p>
          </div>
          {fullData.faq_data?.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-1">FAQs ({fullData.faq_data.length})</h4>
              <ul className="text-sm text-gray-600 list-disc list-inside">
                {fullData.faq_data.map((faq, i) => (
                  <li key={i}>{faq.question}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    if (type === 'seo') {
      const seoData = data as AIGenerateSEOResponse;
      return (
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-gray-700 mb-1">Meta Title</h4>
            <p className="text-blue-600">{seoData.meta_title}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-1">Meta Description</h4>
            <p className="text-gray-600">{seoData.meta_description}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-1">Suggested Slug</h4>
            <p className="text-green-600">/blog/{seoData.suggested_slug}</p>
          </div>
        </div>
      );
    }

    if (type === 'faq') {
      const faqData = data as AIGenerateSectionResponse;
      return (
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Generated FAQs</h4>
          <div className="space-y-3">
            {faqData.faq_data?.map((faq, i) => (
              <div key={i} className="bg-gray-50 p-3 rounded">
                <p className="font-medium text-gray-900">{faq.question}</p>
                <p className="text-sm text-gray-600 mt-1">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    const sectionData = data as AIGenerateSectionResponse;
    return (
      <div>
        <h4 className="font-medium text-gray-700 mb-2">Generated {type}</h4>
        <div
          className="prose prose-sm max-h-60 overflow-y-auto bg-gray-50 p-3 rounded"
          dangerouslySetInnerHTML={{ __html: sectionData.content || '' }}
        />
      </div>
    );
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-50"
      >
        <Sparkles className="w-5 h-5" />
        AI Assistant
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold">AI Content Assistant</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setPreview(null);
          }}
          className="p-1 hover:bg-white/20 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {preview ? (
          <div className="space-y-4">
            {renderPreviewContent()}
            <div className="flex gap-2 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyPreview}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Apply
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Topic Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Topic / Context
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Tile maintenance tips for Florida homeowners"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="tile care, grout cleaning, St. Augustine"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as typeof tone)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="informative">Informative</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleGenerateFull}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                Generate Full Post
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleGenerateSection('intro')}
                  disabled={loading}
                  className="flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                >
                  <PenLine className="w-3.5 h-3.5" />
                  Intro
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerateSection('body')}
                  disabled={loading}
                  className="flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                >
                  <PenLine className="w-3.5 h-3.5" />
                  Body
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerateSection('conclusion')}
                  disabled={loading}
                  className="flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                >
                  <PenLine className="w-3.5 h-3.5" />
                  Conclusion
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerateSection('faq')}
                  disabled={loading}
                  className="flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  FAQs
                </button>
              </div>

              <button
                type="button"
                onClick={handleGenerateSEO}
                disabled={loading || !currentTitle || !currentContent}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Generate SEO Meta Tags
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
