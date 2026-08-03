'use client';

import { useState } from 'react';
import { ImageIcon, Loader2, Check } from 'lucide-react';
import type { BlogPost, MediaPlanEntry } from '@/types/api';
import { api } from '@/lib/api';

interface ImageSeoPanelProps {
  post: BlogPost;
  onPostUpdated: (updated: BlogPost) => void;
}

const FEATURED_IMAGE_ROW_ID = 0;

function basenameNoExt(url: string | null | undefined): string {
  if (!url) return '';
  const withoutQuery = url.split('?')[0];
  const base = withoutQuery.substring(withoutQuery.lastIndexOf('/') + 1);
  const dot = base.lastIndexOf('.');
  return dot > 0 ? base.substring(0, dot) : base;
}

interface RowProps {
  thumbnailUrl: string | null;
  label: string;
  nameEditable: boolean;
  initialName: string;
  initialAlt: string;
  onSave: (name: string, altText: string) => Promise<void>;
}

function ImageMetaRow({ thumbnailUrl, label, nameEditable, initialName, initialAlt, onSave }: RowProps) {
  const [name, setName] = useState(initialName);
  const [altText, setAltText] = useState(initialAlt);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = name !== initialName || altText !== initialAlt;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await onSave(name, altText);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnailUrl} alt="" className="w-14 h-14 rounded object-cover shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded bg-gray-100 flex items-center justify-center shrink-0">
            <ImageIcon className="w-5 h-5 text-gray-400" />
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-2">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!nameEditable}
                placeholder={nameEditable ? 'e.g. walk-in-shower-tile' : 'Resolve the image first'}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Alt Text</label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe the image"
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className="shrink-0 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <Check className="w-4 h-4" />
          ) : (
            'Save'
          )}
        </button>
      </div>
    </div>
  );
}

export default function ImageSeoPanel({ post, onPostUpdated }: ImageSeoPanelProps) {
  const imageEntries = (post.media_plan || []).filter((entry) => entry.type === 'image');

  if (!post.featured_image && imageEntries.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-sm">No images on this post yet.</p>
      </div>
    );
  }

  const handleSaveFeatured = async (name: string, altText: string) => {
    const updated = await api.updateFeaturedImageMeta(post.slug, { name, alt_text: altText });
    onPostUpdated(updated);
  };

  const handleSaveEntry = (entry: MediaPlanEntry) => async (name: string, altText: string) => {
    const updated = await api.updateMediaMeta(post.slug, { media_id: entry.id, name, alt_text: altText });
    onPostUpdated(updated);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        Set a descriptive file name and alt text for every image on this post — both help with
        image search rankings and accessibility.
      </p>

      {post.featured_image && (
        <ImageMetaRow
          key={FEATURED_IMAGE_ROW_ID}
          thumbnailUrl={post.featured_image}
          label="Featured image"
          nameEditable
          initialName={basenameNoExt(post.featured_image)}
          initialAlt={post.featured_image_alt || ''}
          onSave={handleSaveFeatured}
        />
      )}

      {imageEntries.map((entry) => (
        <ImageMetaRow
          key={entry.id}
          thumbnailUrl={entry.resolved_url || null}
          label={entry.status === 'resolved' ? `Image #${entry.id}` : `Image #${entry.id} (unresolved)`}
          nameEditable={entry.status === 'resolved'}
          initialName={basenameNoExt(entry.resolved_url)}
          initialAlt={entry.alt_text || ''}
          onSave={handleSaveEntry(entry)}
        />
      ))}
    </div>
  );
}
