'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2, Clock, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import type { BlogCategory } from '@/types/api';
import { format } from 'date-fns';

interface QuickDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onDraftCreated: () => void;
}

export default function QuickDraftModal({
  isOpen,
  onClose,
  selectedDate,
  onDraftCreated,
}: QuickDraftModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [scheduleForDate, setScheduleForDate] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      // Reset form
      setTitle('');
      setSlug('');
      setSelectedCategories([]);
      setScheduleForDate(false);
      setScheduledTime('09:00');
      setError(null);
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      const data = await api.getBlogCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (openEditor: boolean) => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!slug.trim()) {
      setError('Slug is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let scheduledDate: string | undefined;
      let status: 'draft' | 'scheduled' = 'draft';

      if (scheduleForDate && selectedDate) {
        const dateWithTime = new Date(selectedDate);
        const [hours, minutes] = scheduledTime.split(':').map(Number);
        dateWithTime.setHours(hours, minutes, 0, 0);
        scheduledDate = dateWithTime.toISOString();
        status = 'scheduled';
      }

      const draft = await api.createQuickDraft({
        title: title.trim(),
        slug: slug.trim(),
        category_ids: selectedCategories,
        scheduled_publish_date: scheduledDate,
        status,
      });

      onDraftCreated();
      onClose();

      if (openEditor) {
        router.push(`/admin/blog/${draft.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create draft');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-md sm:mx-4 overflow-hidden max-h-[90vh] flex flex-col safe-area-bottom">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Quick Draft</h2>
            {selectedDate && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                {format(selectedDate, 'MMMM d, yyyy')}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 active:bg-gray-200 touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - scrollable */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter post title..."
              className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-sm"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="url-slug"
              className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-base sm:text-sm"
            />
          </div>

          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategories((prev) =>
                        prev.includes(category.id)
                          ? prev.filter((id) => id !== category.id)
                          : [...prev, category.id]
                      );
                    }}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors active:scale-95 touch-manipulation ${
                      selectedCategories.includes(category.id)
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-gray-300 text-gray-700 active:bg-gray-100'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedDate && (
            <div className="pt-3 border-t border-gray-200">
              <label className="flex items-center gap-3 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={scheduleForDate}
                  onChange={(e) => setScheduleForDate(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Schedule for {format(selectedDate, 'MMM d')}
                </span>
              </label>

              {scheduleForDate && (
                <div className="mt-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-sm"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - fixed at bottom */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="order-3 sm:order-1 px-4 py-3 sm:py-2 text-gray-700 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors touch-manipulation"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="order-2 px-4 py-3 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 touch-manipulation"
          >
            Create Draft
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="order-1 sm:order-3 inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 touch-manipulation font-medium"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create & Edit
          </button>
        </div>
      </div>
    </div>
  );
}
