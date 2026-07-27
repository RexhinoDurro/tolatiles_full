'use client';

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useState, useCallback } from 'react';
import { Video } from 'lucide-react';

/** Recognizes a YouTube or Vimeo URL and extracts (provider, videoId).
 * No official Vimeo TipTap extension exists, so this node handles both
 * providers itself rather than mixing an official YouTube-only extension
 * with a bespoke Vimeo one. */
function parseVideoUrl(url: string): { provider: 'youtube' | 'vimeo'; videoId: string } | null {
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (youtubeMatch) return { provider: 'youtube', videoId: youtubeMatch[1] };
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return { provider: 'vimeo', videoId: vimeoMatch[1] };
  return null;
}

export default function VideoEmbedNodeView({ node, updateAttributes, selected }: NodeViewProps) {
  const { provider, videoId } = node.attrs as { provider: string | null; videoId: string | null };
  const [inputValue, setInputValue] = useState('');

  const handleSetUrl = useCallback(() => {
    const parsed = parseVideoUrl(inputValue.trim());
    if (!parsed) {
      alert(
        'Could not recognize a YouTube or Vimeo URL. Paste a link like ' +
        'https://youtube.com/watch?v=... or https://vimeo.com/...'
      );
      return;
    }
    updateAttributes({ provider: parsed.provider, videoId: parsed.videoId });
  }, [inputValue, updateAttributes]);

  if (!provider || !videoId) {
    return (
      <NodeViewWrapper contentEditable={false} className="my-2">
        <div
          className={`rounded-lg border-2 border-dashed p-4 ${
            selected ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
            <Video className="w-4 h-4" /> Paste a YouTube or Vimeo URL
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
            />
            <button
              type="button"
              onClick={handleSetUrl}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Embed
            </button>
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  const embedSrc =
    provider === 'youtube'
      ? `https://www.youtube.com/embed/${videoId}`
      : `https://player.vimeo.com/video/${videoId}`;

  return (
    <NodeViewWrapper contentEditable={false} className="my-2">
      <div
        className={`relative overflow-hidden rounded-lg ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
        style={{ paddingBottom: '56.25%', height: 0 }}
      >
        <iframe
          src={embedSrc}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          frameBorder="0"
          allowFullScreen
        />
      </div>
    </NodeViewWrapper>
  );
}
