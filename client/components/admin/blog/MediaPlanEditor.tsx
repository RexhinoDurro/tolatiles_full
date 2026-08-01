'use client';

import { useState } from 'react';
import { ImageIcon, Video, CheckCircle2, XCircle, HelpCircle, Loader2 } from 'lucide-react';
import type { BlogPost, MediaPlanEntry, MediaResolvedSource } from '@/types/api';
import { api } from '@/lib/api';
import MediaPickerModal from './MediaPickerModal';

interface MediaPlanEditorProps {
  post: BlogPost;
  onPostUpdated: (updated: BlogPost) => void;
}

// Sentinel id for the featured image's synthesized MediaPlanEntry -- never a
// real media_plan id (those are assigned starting at 1 at draft time).
const FEATURED_IMAGE_ENTRY_ID = 0;

export default function MediaPlanEditor({ post, onPostUpdated }: MediaPlanEditorProps) {
  const [pickerEntryId, setPickerEntryId] = useState<number | null>(null);
  const [skippingId, setSkippingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaPlan = post.media_plan || [];
  const featuredPlan = post.featured_image_plan || {};
  const featuredEntry: MediaPlanEntry = {
    id: FEATURED_IMAGE_ENTRY_ID,
    type: 'image',
    placement_hint: '',
    prompt: featuredPlan.prompt || '',
    status: featuredPlan.status || 'unresolved',
    resolved_source: featuredPlan.resolved_source ?? null,
    resolved_url: featuredPlan.resolved_url ?? null,
    candidates: featuredPlan.candidates,
  };

  const activeEntry =
    pickerEntryId === FEATURED_IMAGE_ENTRY_ID
      ? featuredEntry
      : mediaPlan.find((item) => item.id === pickerEntryId);

  const handleResolve = async (mediaId: number, source: MediaResolvedSource, url: string) => {
    const updated =
      mediaId === FEATURED_IMAGE_ENTRY_ID
        ? await api.resolveFeaturedImage(post.slug, { resolved_source: source, resolved_url: url })
        : await api.resolveMediaPlaceholder(post.slug, {
            media_id: mediaId,
            resolved_source: source,
            resolved_url: url,
          });
    onPostUpdated(updated);
    setPickerEntryId(null);
  };

  const handleSkip = async (mediaId: number) => {
    setSkippingId(mediaId);
    setError(null);
    try {
      const updated =
        mediaId === FEATURED_IMAGE_ENTRY_ID
          ? await api.resolveFeaturedImage(post.slug, { status: 'skipped' })
          : await api.resolveMediaPlaceholder(post.slug, { media_id: mediaId, status: 'skipped' });
      onPostUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to skip placeholder');
    } finally {
      setSkippingId(null);
    }
  };

  return (
    <div className="space-y-3">
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      {/* Featured image -- pinned above the media_plan list, resolved through
          the same picker/candidate flow as any other image placeholder. */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
        <div className="flex items-start gap-3">
          {post.featured_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.featured_image}
              alt={post.featured_image_alt || 'Featured image'}
              className="w-12 h-12 rounded object-cover shrink-0"
            />
          ) : (
            <ImageIcon className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">Featured image (thumbnail)</span>
              {featuredEntry.status === 'resolved' && (
                <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Resolved ({featuredEntry.resolved_source})
                </span>
              )}
              {featuredEntry.status === 'skipped' && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  <XCircle className="w-3 h-3" /> Skipped
                </span>
              )}
              {featuredEntry.status === 'unresolved' && (
                <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  <HelpCircle className="w-3 h-3" /> Needs attention
                </span>
              )}
            </div>
            {featuredEntry.prompt ? (
              <p className="text-sm text-gray-700 italic mt-1">&quot;{featuredEntry.prompt}&quot;</p>
            ) : (
              <p className="text-sm text-gray-500 mt-1">No prompt yet — pick a candidate or paste a URL.</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setPickerEntryId(FEATURED_IMAGE_ENTRY_ID)}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {featuredEntry.status === 'resolved' ? 'Change' : 'Resolve'}
            </button>
            {featuredEntry.status !== 'skipped' && (
              <button
                onClick={() => handleSkip(FEATURED_IMAGE_ENTRY_ID)}
                disabled={skippingId === FEATURED_IMAGE_ENTRY_ID}
                className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {skippingId === FEATURED_IMAGE_ENTRY_ID ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Skip'}
              </button>
            )}
          </div>
        </div>
      </div>

      {mediaPlan.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-sm">
            No media plan for this post — image/video placeholders are planned when the post is
            drafted (Obsidian + the import pipeline), not created here.
          </p>
        </div>
      )}

      {mediaPlan.map((entry) => (
        <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            {entry.type === 'video' ? (
              <Video className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
            ) : (
              <ImageIcon className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {entry.type === 'video' ? 'Video' : 'Image'} #{entry.id}
                </span>
                {entry.status === 'resolved' && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Resolved ({entry.resolved_source})
                  </span>
                )}
                {entry.status === 'skipped' && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    <XCircle className="w-3 h-3" /> Skipped
                  </span>
                )}
                {entry.status === 'unresolved' && (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    <HelpCircle className="w-3 h-3" /> Needs attention
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">{entry.placement_hint}</p>
              <p className="text-sm text-gray-700 italic mt-1">&quot;{entry.prompt}&quot;</p>
              {entry.resolved_url && (
                <p className="text-xs text-gray-400 mt-1 truncate">{entry.resolved_url}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setPickerEntryId(entry.id)}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {entry.status === 'resolved' ? 'Change' : 'Resolve'}
              </button>
              {entry.status !== 'skipped' && (
                <button
                  onClick={() => handleSkip(entry.id)}
                  disabled={skippingId === entry.id}
                  className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  {skippingId === entry.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Skip'}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {activeEntry && (
        <MediaPickerModal
          entry={activeEntry}
          onClose={() => setPickerEntryId(null)}
          onResolve={(source, url) => handleResolve(activeEntry.id, source, url)}
        />
      )}
    </div>
  );
}
