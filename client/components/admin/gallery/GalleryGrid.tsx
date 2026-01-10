'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Edit2, Trash2, Eye, EyeOff, MoreVertical } from 'lucide-react';
import type { GalleryImage } from '@/types/api';

interface GalleryGridProps {
  images: GalleryImage[];
  onEdit: (image: GalleryImage) => void;
  onDelete: (image: GalleryImage) => void;
  onToggleActive: (image: GalleryImage) => void;
}

export default function GalleryGrid({ images, onEdit, onDelete, onToggleActive }: GalleryGridProps) {
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-xl">
        <div className="text-gray-400 text-lg">No images found</div>
        <p className="text-gray-500 text-sm mt-2">Click &quot;Add Image&quot; to upload your first image</p>
      </div>
    );
  }

  return (
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
              src={image.image_url || image.image}
              alt={image.title}
              fill
              className="object-cover"
            />

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
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{image.title}</h3>
                <p className="text-sm text-gray-500 truncate">{image.description}</p>
              </div>

              {/* Mobile menu */}
              <div className="relative md:hidden">
                <button
                  onClick={() => setActiveMenu(activeMenu === image.id ? null : image.id)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {activeMenu === image.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setActiveMenu(null)}
                    />
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 w-32">
                      <button
                        onClick={() => {
                          setActiveMenu(null);
                          onEdit(image);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setActiveMenu(null);
                          onToggleActive(image);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        {image.is_active ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            Hide
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            Show
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setActiveMenu(null);
                          onDelete(image);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
