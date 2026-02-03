'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Edit2, Trash2, Eye, EyeOff, MoreHorizontal, RotateCcw, RotateCw, FlipHorizontal, FlipVertical, Loader2 } from 'lucide-react';
import type { GalleryImage } from '@/types/api';

export type TransformType = 'rotate_left' | 'rotate_right' | 'flip_horizontal' | 'flip_vertical';

interface GalleryGridProps {
  images: GalleryImage[];
  onEdit: (image: GalleryImage) => void;
  onDelete: (image: GalleryImage) => void;
  onToggleActive: (image: GalleryImage) => void;
  onTransform?: (image: GalleryImage, type: TransformType) => Promise<void>;
}

export default function GalleryGrid({ images, onEdit, onDelete, onToggleActive, onTransform }: GalleryGridProps) {
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [transformingId, setTransformingId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const handleTransform = async (image: GalleryImage, type: TransformType) => {
    if (!onTransform) return;
    setActiveMenu(null);
    setTransformingId(image.id);
    try {
      await onTransform(image, type);
    } catch (error) {
      console.error('Transform failed:', error);
    } finally {
      setTransformingId(null);
    }
  };

  const openMenu = (e: React.MouseEvent, imageId: number) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 4,
      left: Math.min(rect.left, window.innerWidth - 180),
    });
    setActiveMenu(imageId);
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-xl">
        <div className="text-gray-400 text-lg">No images found</div>
        <p className="text-gray-500 text-sm mt-2">Click &quot;Add Image&quot; to upload your first image</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className={`relative bg-white rounded-xl shadow-sm overflow-hidden group ${
              !image.is_active ? 'opacity-60' : ''
            }`}
          >
            {/* Image */}
            <div className="relative aspect-square">
              <Image
                src={`${image.image_url || image.image}?t=${new Date(image.updated_at).getTime()}`}
                alt={image.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                className="object-cover"
                quality={75}
              />

              {/* Loading overlay when transforming */}
              {transformingId === image.id && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              )}

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => onEdit(image)}
                  className="p-2 bg-white rounded-full text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onToggleActive(image)}
                  className="p-2 bg-white rounded-full text-gray-700 hover:bg-yellow-100 hover:text-yellow-600 transition-colors"
                  title={image.is_active ? 'Hide' : 'Show'}
                >
                  {image.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => onDelete(image)}
                  className="p-2 bg-white rounded-full text-gray-700 hover:bg-red-100 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {onTransform && (
                  <button
                    onClick={(e) => openMenu(e, image.id)}
                    className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                    title="More options"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status badge */}
              {!image.is_active && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-gray-900/70 text-white text-xs rounded">
                  Hidden
                </div>
              )}

              {/* Category badge */}
              <div className="absolute top-2 right-2 px-2 py-1 bg-blue-600/90 text-white text-xs rounded capitalize">
                {image.category_name}
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="font-medium text-gray-900 truncate">{image.title}</h3>
              <p className="text-sm text-gray-500 truncate">{image.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Transform menu popup - rendered as fixed overlay */}
      {activeMenu !== null && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setActiveMenu(null)}
          />
          <div
            className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 w-44"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            {(() => {
              const image = images.find(img => img.id === activeMenu);
              if (!image) return null;
              return (
                <>
                  <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase">Transform</div>
                  <button
                    onClick={() => handleTransform(image, 'rotate_left')}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Rotate Left
                  </button>
                  <button
                    onClick={() => handleTransform(image, 'rotate_right')}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <RotateCw className="w-4 h-4" />
                    Rotate Right
                  </button>
                  <button
                    onClick={() => handleTransform(image, 'flip_horizontal')}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FlipHorizontal className="w-4 h-4" />
                    Flip Horizontal
                  </button>
                  <button
                    onClick={() => handleTransform(image, 'flip_vertical')}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FlipVertical className="w-4 h-4" />
                    Flip Vertical
                  </button>
                </>
              );
            })()}
          </div>
        </>
      )}
    </>
  );
}
