'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Category } from '@/types/api';

interface GallerySectionFormProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export default function GallerySectionForm({ config, onChange }: GallerySectionFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
        <input
          type="text"
          value={config.heading || ''}
          onChange={(e) => onChange({ ...config, heading: e.target.value })}
          placeholder="Our Recent Work"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Gallery Category</label>
        <select
          value={config.gallery_category || ''}
          onChange={(e) => onChange({ ...config, gallery_category: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a category...</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.label}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Shows all active photos from this category in the existing /admin/gallery portfolio.
        </p>
      </div>
    </div>
  );
}
