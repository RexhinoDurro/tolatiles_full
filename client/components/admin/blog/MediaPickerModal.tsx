'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { MediaCandidate, MediaPlanEntry, MediaResolvedSource } from '@/types/api';

interface MediaPickerModalProps {
  entry: MediaPlanEntry;
  onClose: () => void;
  onResolve: (source: MediaResolvedSource, url: string) => void | Promise<void>;
}

type ImageTab = 'ai' | 'gallery' | 'web' | 'manual';

const IMAGE_TABS: { key: ImageTab; label: string }[] = [
  { key: 'ai', label: 'AI Generated' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'web', label: 'Web' },
  { key: 'manual', label: 'Paste URL' },
];

function parseVideoUrl(url: string): { provider: 'youtube' | 'vimeo'; videoId: string } | null {
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (youtubeMatch) return { provider: 'youtube', videoId: youtubeMatch[1] };
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return { provider: 'vimeo', videoId: vimeoMatch[1] };
  return null;
}

export default function MediaPickerModal({ entry, onClose, onResolve }: MediaPickerModalProps) {
  const [activeTab, setActiveTab] = useState<ImageTab>('ai');
  const [manualUrl, setManualUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isVideo = entry.type === 'video';
  const candidatesForTab: MediaCandidate[] =
    activeTab === 'manual' ? [] : entry.candidates?.[activeTab] || [];

  const handleUseCandidate = async (candidate: MediaCandidate) => {
    setResolving(true);
    setError(null);
    try {
      const source: MediaResolvedSource = activeTab as MediaResolvedSource;
      await onResolve(source, candidate.full_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve placeholder');
    } finally {
      setResolving(false);
    }
  };

  const handleUseManualUrl = async () => {
    if (!manualUrl.trim()) return;
    setResolving(true);
    setError(null);
    try {
      // The server downloads and saves this locally before it's ever
      // inserted into content -- never hotlinked to wherever it came from.
      await onResolve('manual_url', manualUrl.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve placeholder');
    } finally {
      setResolving(false);
    }
  };

  const handleUseVideoUrl = async () => {
    const parsed = parseVideoUrl(videoUrl.trim());
    if (!parsed) {
      setError('Could not recognize a YouTube or Vimeo URL.');
      return;
    }
    setResolving(true);
    setError(null);
    try {
      await onResolve('manual_url', videoUrl.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve placeholder');
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Resolve {isVideo ? 'Video' : 'Image'} Placeholder #{entry.id}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5 italic">&quot;{entry.prompt}&quot;</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        {isVideo ? (
          <div className="p-6 space-y-3">
            <label className="block text-sm font-medium text-gray-700">Paste a YouTube or Vimeo URL</label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleUseVideoUrl}
              disabled={resolving || !videoUrl.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {resolving && <Loader2 className="w-4 h-4 animate-spin" />}
              Use This Video
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-1 px-6 pt-4 border-b border-gray-200">
              {IMAGE_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 text-sm rounded-t-lg ${
                    activeTab === tab.key
                      ? 'bg-blue-50 text-blue-700 border border-b-0 border-gray-200'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {activeTab === 'manual' ? (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Paste an image URL</label>
                  <p className="text-xs text-gray-500">
                    The image is downloaded and saved to this site&apos;s own storage before it&apos;s used
                    &mdash; it won&apos;t hotlink to wherever you found it.
                  </p>
                  <input
                    type="text"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={handleUseManualUrl}
                    disabled={resolving || !manualUrl.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {resolving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Use This URL
                  </button>
                </div>
              ) : (
                <>
                  {activeTab === 'web' && candidatesForTab.length === 0 && (
                    <p className="text-xs text-gray-500 mb-4">
                      Web images aren&apos;t searched automatically &mdash; they show up here once someone
                      has actually found and saved one for this placeholder (via the
                      add_web_image_candidate command). Use &quot;Paste URL&quot; if you already have one.
                    </p>
                  )}

                  {candidatesForTab.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">No candidates from this source yet.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {candidatesForTab.map((candidate, i) => (
                        <button
                          key={i}
                          onClick={() => handleUseCandidate(candidate)}
                          disabled={resolving}
                          className="group relative aspect-video rounded-lg overflow-hidden border border-gray-200 hover:ring-2 hover:ring-blue-500 disabled:opacity-50"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={candidate.thumbnail_url}
                            alt={candidate.title || candidate.credit || 'candidate'}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium">
                              Use this
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
