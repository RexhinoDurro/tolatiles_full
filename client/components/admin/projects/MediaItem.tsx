'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
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

  const isVideo = media.media_type === 'video';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100 border border-gray-200"
    >
      {isVideo ? (
        <video
          src={media.file}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <img
          src={media.file}
          alt={media.alt_text || ''}
          className="w-full h-full object-cover"
        />
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

      {/* Video badge */}
      {isVideo && (
        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-xs rounded">
          Video
        </span>
      )}
    </div>
  );
}
