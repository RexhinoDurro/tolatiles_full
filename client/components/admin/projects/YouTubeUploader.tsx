'use client';

import { useState } from 'react';
import { Youtube, Loader2, Check, X } from 'lucide-react';

interface YouTubeUploaderProps {
  onAdd: (url: string) => Promise<void>;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default function YouTubeUploader({ onAdd }: YouTubeUploaderProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!extractYouTubeId(url)) {
      setError('Enter a valid YouTube URL');
      return;
    }
    setAdding(true);
    setError('');
    try {
      await onAdd(url.trim());
      setUrl('');
      setOpen(false);
    } catch (e: any) {
      setError(e.message || 'Failed to add video');
    } finally {
      setAdding(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="aspect-square flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-red-200 hover:border-red-400 hover:bg-red-50 transition-colors text-gray-400 hover:text-red-600"
      >
        <Youtube className="w-5 h-5" />
        <span className="text-xs font-medium">YouTube</span>
      </button>
    );
  }

  return (
    <div className="col-span-3 sm:col-span-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center gap-1 mb-2">
        <Youtube className="w-4 h-4 text-red-600" />
        <p className="text-xs font-semibold text-red-800">Add YouTube Video</p>
      </div>
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(''); }}
          placeholder="https://youtube.com/watch?v=..."
          className="flex-1 text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          autoFocus
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!url.trim() || adding}
          className="px-3 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1 whitespace-nowrap"
        >
          {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          Add
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setUrl(''); setError(''); }}
          className="p-1.5 text-gray-500 hover:text-gray-700 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
