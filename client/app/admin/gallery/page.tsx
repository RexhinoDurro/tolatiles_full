'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import CategoryTabs from '@/components/admin/gallery/CategoryTabs';
import GalleryGrid from '@/components/admin/gallery/GalleryGrid';
import ImageUploadModal from '@/components/admin/gallery/ImageUploadModal';
import DeleteConfirmModal from '@/components/admin/gallery/DeleteConfirmModal';
import { api } from '@/lib/api';
import type { GalleryImage, Category } from '@/types/api';

interface DisplayCategory {
  id: string;
  label: string;
  count: number;
  apiId: number;
}

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<DisplayCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryImage | null>(null);

  // Category name mapping for API
  const categoryNameMap: Record<string, string> = {
    backsplashes: 'backsplash',
    patios: 'patio',
    showers: 'shower',
    flooring: 'flooring',
    fireplaces: 'fireplace',
  };

  const reverseCategoryMap: Record<string, string> = {
    backsplash: 'backsplashes',
    patio: 'patios',
    shower: 'showers',
    flooring: 'flooring',
    fireplace: 'fireplaces',
  };

  const fetchData = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Fetch categories
      const categoryData = await api.getCategories();
      const formattedCategories: DisplayCategory[] = categoryData.map((cat) => ({
        id: reverseCategoryMap[cat.name] || cat.name,
        label: cat.label,
        count: cat.image_count,
        apiId: cat.id,
      }));
      setCategories(formattedCategories);

      // Fetch images based on selected category
      const apiCategory = selectedCategory === 'all' ? undefined : categoryNameMap[selectedCategory];
      let imageData: GalleryImage[];

      if (selectedCategory === 'all') {
        imageData = await api.getAllGalleryImages();
      } else {
        imageData = await api.getGalleryImages(apiCategory);
      }

      setImages(imageData);
    } catch (err) {
      console.error('Failed to fetch gallery data:', err);
      setError('Failed to load gallery data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle image upload/edit
  const handleImageSubmit = async (formData: FormData) => {
    const id = formData.get('id');
    formData.delete('id');

    if (id) {
      // Update existing image
      await api.updateGalleryImage(Number(id), formData);
    } else {
      // Create new image
      await api.createGalleryImage(formData);
    }

    // Refresh the list
    await fetchData(true);
  };

  // Handle image delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.deleteGalleryImage(deleteTarget.id);
    setDeleteTarget(null);
    await fetchData(true);
  };

  // Handle toggle active status
  const handleToggleActive = async (image: GalleryImage) => {
    const formData = new FormData();
    formData.append('is_active', String(!image.is_active));
    await api.updateGalleryImage(image.id, formData);
    await fetchData(true);
  };

  // Edit handler
  const handleEdit = (image: GalleryImage) => {
    setEditingImage(image);
    setShowUploadModal(true);
  };

  // Close modal and reset editing state
  const handleCloseModal = () => {
    setShowUploadModal(false);
    setEditingImage(null);
  };

  // Get categories for the modal (with API IDs)
  const modalCategories = categories.map((cat) => ({
    id: cat.apiId,
    name: categoryNameMap[cat.id] || cat.id,
    label: cat.label,
    description: '',
    image_count: cat.count,
    created_at: '',
  }));

  return (
    <AdminLayout title="Gallery Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-gray-600">
              Manage your gallery images across all categories
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchData(true)}
              disabled={isRefreshing}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                setEditingImage(null);
                setShowUploadModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Image
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        {!isLoading && categories.length > 0 && (
          <CategoryTabs
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button
              onClick={() => fetchData()}
              className="ml-2 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          /* Gallery Grid */
          <GalleryGrid
            images={images}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
            onToggleActive={handleToggleActive}
          />
        )}

        {/* Image count */}
        {!isLoading && images.length > 0 && (
          <div className="text-center text-sm text-gray-500">
            Showing {images.length} image{images.length !== 1 ? 's' : ''}
            {selectedCategory !== 'all' && ` in ${categories.find((c) => c.id === selectedCategory)?.label}`}
          </div>
        )}
      </div>

      {/* Upload/Edit Modal */}
      <ImageUploadModal
        isOpen={showUploadModal}
        onClose={handleCloseModal}
        onSubmit={handleImageSubmit}
        categories={modalCategories}
        editingImage={editingImage}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Image"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
}
