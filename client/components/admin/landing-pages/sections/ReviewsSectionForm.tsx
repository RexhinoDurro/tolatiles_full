'use client';

import { Plus, Trash2 } from 'lucide-react';

interface Review {
  author?: string;
  text?: string;
  rating?: number;
}

interface ReviewsSectionFormProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export default function ReviewsSectionForm({ config, onChange }: ReviewsSectionFormProps) {
  const quotes: Review[] = config.quotes || [];

  const updateQuote = (index: number, patch: Partial<Review>) => {
    const next = quotes.map((q, i) => (i === index ? { ...q, ...patch } : q));
    onChange({ ...config, quotes: next });
  };

  const addQuote = () => {
    onChange({ ...config, quotes: [...quotes, { author: '', text: '', rating: 5 }] });
  };

  const removeQuote = (index: number) => {
    onChange({ ...config, quotes: quotes.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
        <input
          type="text"
          value={config.heading || ''}
          onChange={(e) => onChange({ ...config, heading: e.target.value })}
          placeholder="What Our Customers Say"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-3">
        {quotes.map((review, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-start gap-2">
              <input
                type="text"
                value={review.author || ''}
                onChange={(e) => updateQuote(index, { author: e.target.value })}
                placeholder="Customer name"
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <select
                value={review.rating || 5}
                onChange={(e) => updateQuote(index, { rating: Number(e.target.value) })}
                className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{r} stars</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeQuote(index)}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={review.text || ''}
              onChange={(e) => updateQuote(index, { text: e.target.value })}
              placeholder="Review text"
              rows={2}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addQuote}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <Plus className="w-4 h-4" />
        Add Review
      </button>
    </div>
  );
}
