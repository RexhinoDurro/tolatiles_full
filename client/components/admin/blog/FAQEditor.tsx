'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import type { FAQItem } from '@/types/api';

interface FAQEditorProps {
  faqs: FAQItem[];
  onChange: (faqs: FAQItem[]) => void;
  hasFaqSchema: boolean;
  onToggleSchema: (enabled: boolean) => void;
}

export default function FAQEditor({ faqs, onChange, hasFaqSchema, onToggleSchema }: FAQEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleAdd = () => {
    onChange([...faqs, { question: '', answer: '' }]);
    setExpandedIndex(faqs.length);
  };

  const handleRemove = (index: number) => {
    const newFaqs = faqs.filter((_, i) => i !== index);
    onChange(newFaqs);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    }
  };

  const handleUpdate = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    onChange(newFaqs);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newFaqs = [...faqs];
    [newFaqs[index - 1], newFaqs[index]] = [newFaqs[index], newFaqs[index - 1]];
    onChange(newFaqs);
    setExpandedIndex(index - 1);
  };

  const handleMoveDown = (index: number) => {
    if (index === faqs.length - 1) return;
    const newFaqs = [...faqs];
    [newFaqs[index], newFaqs[index + 1]] = [newFaqs[index + 1], newFaqs[index]];
    onChange(newFaqs);
    setExpandedIndex(index + 1);
  };

  return (
    <div className="space-y-4">
      {/* Schema Toggle */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
        <button
          type="button"
          onClick={() => onToggleSchema(!hasFaqSchema)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            hasFaqSchema ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              hasFaqSchema ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <div>
          <label className="text-sm font-medium text-gray-700">
            Enable FAQ Schema Markup
          </label>
          <p className="text-xs text-gray-500 mt-0.5">
            {hasFaqSchema
              ? 'FAQ schema will be added to this post for rich search results.'
              : 'Enable to add FAQ schema markup for enhanced search visibility.'}
          </p>
        </div>
      </div>

      {/* FAQ List */}
      {hasFaqSchema && (
        <div className="space-y-3">
          {faqs.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-3">No FAQs added yet</p>
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add FAQ
              </button>
            </div>
          ) : (
            <>
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* Header */}
                  <div
                    className="flex items-center gap-2 px-4 py-3 bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  >
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <span className="flex-1 font-medium text-gray-900 truncate">
                      {faq.question || `FAQ ${index + 1}`}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveUp(index);
                        }}
                        disabled={index === 0}
                        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveDown(index);
                        }}
                        disabled={index === faqs.length - 1}
                        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(index);
                        }}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedIndex === index && (
                    <div className="p-4 space-y-3 border-t border-gray-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Question
                        </label>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => handleUpdate(index, 'question', e.target.value)}
                          placeholder="Enter the question..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Answer
                        </label>
                        <textarea
                          value={faq.answer}
                          onChange={(e) => handleUpdate(index, 'answer', e.target.value)}
                          placeholder="Enter the answer..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={handleAdd}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Another FAQ
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
