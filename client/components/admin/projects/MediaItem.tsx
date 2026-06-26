'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Youtube } from 'lucide-react';
import type { ProjectMedia } from '@/types/api';

interface MediaItemProps {
  media: ProjectMedia;
  onDelete: (id: number) => void;
}

export default function MediaItem({ media, onDelete }: MediaItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: media.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isYouTube = media.media_type === 'youtube';
  const isVideo = media.media_type === 'video';

  const thumbSrc = isYouTube
    ? media.youtube_thumbnail
    : isVideo
    ? null
    : media.file;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100 border border-gray-200"
    >
      {isYouTube && media.youtube_thumbnail ? (
        <>
          <img
            src={media.youtube_thumbnail}
            alt={media.alt_text || 'YouTube video'}
            className="w-full h-full object-cover"
          />
          {/* YouTube play overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </>
      ) : isVideo && media.file ? (
        <video
          src={media.file}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
      ) : media.file ? (
        <img
          src={media.file}
          alt={media.alt_text || ''}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No preview</div>
      )}

      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 p-1 bg-black/50 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* Delete button */}
      <button
        onClick={() => onDelete(media.id)}
        className="absolute top-1 right-1 p-1 bg-red-600 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      {/* Type badge */}
      {isYouTube ? (
        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-red-600 text-white text-xs rounded flex items-center gap-0.5">
          <Youtube className="w-2.5 h-2.5" />
          YT
        </span>
      ) : isVideo ? (
        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-xs rounded">
          Video
        </span>
      ) : null}
    </div>
  );
}
