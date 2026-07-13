'use client';

import { useRef, useState } from 'react';
import { Upload, Youtube, Loader2, Check, Trash2, Film } from 'lucide-react';
import { api } from '@/lib/api';
import type { Project } from '@/types/api';

interface MainVideoUploaderProps {
  project: Partial<Project>;
  projectId: number;
  onUpdated: (project: Project) => void;
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

export default function MainVideoUploader({ project, projectId, onUpdated }: MainVideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const saved = await api.uploadMainVideo(projectId, file);
      onUpdated(saved);
    } catch (e: any) {
      setError(e.message || 'Failed to upload video');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleYouTube = async () => {
    if (!extractYouTubeId(url)) {
      setError('Enter a valid YouTube URL');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const saved = await api.setMainVideoUrl(projectId, url.trim());
      onUpdated(saved);
      setUrl('');
    } catch (e: any) {
      setError(e.message || 'Failed to add video');
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    setBusy(true);
    setError('');
    try {
      const saved = await api.removeMainVideo(projectId);
      onUpdated(saved);
    } catch (e: any) {
      setError(e.message || 'Failed to remove video');
    } finally {
      setBusy(false);
    }
  };

  const hasVideo = project.main_video_type === 'video' || project.main_video_type === 'youtube';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">Main Video</h2>
        {hasVideo && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remove
          </button>
        )}
      </div>

      {hasVideo ? (
        <div className="rounded-lg overflow-hidden bg-gray-900 aspect-video">
          {project.main_video_type === 'video' && project.main_video ? (
            <video src={project.main_video} controls playsInline className="w-full h-full object-contain" />
          ) : project.main_video_embed_url ? (
            <iframe
              src={project.main_video_embed_url}
              title="Main video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              <Film className="w-5 h-5 mr-2" /> Video unavailable
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors text-gray-400 hover:text-blue-600 disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
            <span className="text-sm font-medium">Upload video file</span>
            <span className="text-xs">MP4, WebM or MOV</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or paste a YouTube link</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
              <input
                type="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(''); }}
                placeholder="https://youtube.com/watch?v=..."
                onKeyDown={(e) => e.key === 'Enter' && handleYouTube()}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <button
              type="button"
              onClick={handleYouTube}
              disabled={!url.trim() || busy}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Add
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}
