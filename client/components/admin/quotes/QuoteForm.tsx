'use client';

import { useState, useMemo } from 'react';
import { Plus, Trash2, Loader2, GripVertical } from 'lucide-react';
import CustomerSelect from './CustomerSelect';
import type { Quote, QuoteCreate, LineItemCreate, Customer } from '@/types/api';

interface QuoteFormProps {
  quote?: Quote;
  onSubmit: (data: QuoteCreate) => Promise<void>;
  isLoading?: boolean;
}

const defaultTerms = [
  'Quote valid for 30 days from the date issued.',
  'A 50% deposit is required to begin work.',
  'Final payment is due upon completion.',
  'All prices include materials and labor unless otherwise noted.',
];

function getDefaultExpiryDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split('T')[0];
}

function createEmptyLineItem(order: number = 0): LineItemCreate {
  return {
    name: '',
    description: '',
    is_service: false,
    quantity: 1,
    unit_price: 0,
    detail_lines: [],
    order,
  };
}

function getInitialLineItems(quote?: Quote): LineItemCreate[] {
  if (quote?.line_items && quote.line_items.length > 0) {
    return quote.line_items.map((item) => ({
      name: item.name,
      description: item.description || '',
      is_service: item.is_service || false,
      quantity: item.quantity,
      unit_price: Number(item.unit_price),
      detail_lines: item.detail_lines || [],
      order: item.order,
    }));
  }
  return [createEmptyLineItem(0)];
}

export default function QuoteForm({ quote, onSubmit, isLoading }: QuoteFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    quote?.customer || null
  );

  const [formData, setFormData] = useState({
    title: quote?.title || '',
    expires_at: quote?.expires_at || getDefaultExpiryDate(),
    timeline: quote?.timeline || '2-3 weeks',
    currency: quote?.currency || 'USD' as 'USD' | 'EUR',
    comments_text: quote?.comments_text || '',
    terms: quote?.terms || [...defaultTerms],
    discount_percent: quote?.discount_percent || 0,
    tax_rate: quote?.tax_rate || 0,
    shipping_amount: quote?.shipping_amount || 0,
  });

  const [lineItems, setLineItems] = useState<LineItemCreate[]>(() => getInitialLineItems(quote));

  const [newTerm, setNewTerm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => {
      // For services, just use the unit_price; for products, multiply by quantity
      const itemTotal = item.is_service
        ? (item.unit_price || 0)
        : (item.quantity || 0) * (item.unit_price || 0);
      return sum + itemTotal;
    }, 0);
    const discount = subtotal * ((formData.discount_percent || 0) / 100);
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * ((formData.tax_rate || 0) / 100);
    const total = afterDiscount + tax + (formData.shipping_amount || 0);

    return { subtotal, discount, afterDiscount, tax, total };
  }, [lineItems, formData.discount_percent, formData.tax_rate, formData.shipping_amount]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: formData.currency,
    }).format(amount);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, createEmptyLineItem(lineItems.length)]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof LineItemCreate, value: unknown) => {
    setLineItems(
      lineItems.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addTerm = () => {
    if (!newTerm.trim()) return;
    setFormData({ ...formData, terms: [...formData.terms, newTerm.trim()] });
    setNewTerm('');
  };

  const removeTerm = (index: number) => {
    setFormData({
      ...formData,
      terms: formData.terms.filter((_, i) => i !== index),
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!selectedCustomer) {
      newErrors.customer = 'Please select a customer';
    }

    if (!formData.expires_at) {
      newErrors.expires_at = 'Expiry date is required';
    }

    const hasValidLineItem = lineItems.some((item) => {
      if (item.is_service) {
        return item.name.trim() && item.unit_price > 0;
      }
      return item.name.trim() && (item.quantity || 0) > 0 && item.unit_price > 0;
    });
    if (!hasValidLineItem) {
      newErrors.line_items = 'At least one line item with name and price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const data: QuoteCreate = {
      title: formData.title,
      customer_id: selectedCustomer!.id,
      expires_at: formData.expires_at,
      timeline: formData.timeline,
      currency: formData.currency,
      comments_text: formData.comments_text,
      terms: formData.terms,
      discount_percent: formData.discount_percent,
      tax_rate: formData.tax_rate,
      shipping_amount: formData.shipping_amount,
      line_items: lineItems
        .filter((item) => item.name.trim())
        .map((item, index) => ({
          ...item,
          order: index,
          // For services, set quantity to 1
          quantity: item.is_service ? 1 : item.quantity,
        })),
    };

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Quote Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quote Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : ''
              }`}
              placeholder="e.g., Kitchen Backsplash Installation"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer <span className="text-red-500">*</span>
            </label>
            <CustomerSelect value={selectedCustomer} onChange={setSelectedCustomer} />
            {errors.customer && <p className="text-red-500 text-sm mt-1">{errors.customer}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valid Until <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.expires_at}
              onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.expires_at ? 'border-red-500' : ''
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timeline</label>
            <select
              value={formData.timeline}
              onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1 week">1 week</option>
              <option value="2-3 weeks">2-3 weeks</option>
              <option value="1 month">1 month</option>
              <option value="2 months">2 months</option>
              <option value="3 months">3 months</option>
              <option value="TBD">TBD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              value={formData.currency}
              onChange={(e) =>
                setFormData({ ...formData, currency: e.target.value as 'USD' | 'EUR' })
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scope / Comments */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Scope of Work</h2>
        <textarea
          value={formData.comments_text}
          onChange={(e) => setFormData({ ...formData, comments_text: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe the scope of work, materials to be used, timeline, etc..."
        />
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Products & Services</h2>
          <button
            type="button"
            onClick={addLineItem}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
        {errors.line_items && (
          <p className="text-red-500 text-sm mb-4">{errors.line_items}</p>
        )}

        <div className="space-y-4">
          {/* Header Row */}
          <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 px-2">
            <div className="col-span-5">Item</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-right">Unit Price</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-1"></div>
          </div>

          {lineItems.map((item, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="grid grid-cols-12 gap-4 items-start">
                <div className="col-span-12 md:col-span-5">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateLineItem(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Item name"
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  {item.is_service ? (
                    <div className="px-3 py-2 text-center text-gray-400 bg-gray-50 rounded-lg border">
                      —
                    </div>
                  ) : (
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                      placeholder="Qty"
                    />
                  )}
                </div>
                <div className="col-span-4 md:col-span-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) =>
                        updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)
                      }
                      className="w-full pl-7 pr-3 py-2 border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="col-span-3 md:col-span-2 flex items-center justify-end">
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(
                      item.is_service
                        ? (item.unit_price || 0)
                        : (item.quantity || 0) * (item.unit_price || 0)
                    )}
                  </span>
                </div>
                <div className="col-span-1 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    disabled={lineItems.length === 1}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.is_service || false}
                    onChange={(e) => updateLineItem(index, 'is_service', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span>Service (no quantity)</span>
                </label>
              </div>
              <div className="mt-3">
                <textarea
                  value={item.description || ''}
                  onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Description (optional)"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals & Adjustments */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
            <input
              type="number"
              value={formData.discount_percent}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discount_percent: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
            <input
              type="number"
              value={formData.tax_rate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tax_rate: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Shipping</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={formData.shipping_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shipping_amount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full pl-7 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatCurrency(totals.subtotal)}</span>
          </div>
          {totals.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount ({formData.discount_percent}%)</span>
              <span>-{formatCurrency(totals.discount)}</span>
            </div>
          )}
          {totals.tax > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Tax ({formData.tax_rate}%)</span>
              <span>{formatCurrency(totals.tax)}</span>
            </div>
          )}
          {formData.shipping_amount > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{formatCurrency(formData.shipping_amount)}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-2">
            <span>Total</span>
            <span>{formatCurrency(totals.total)}</span>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Terms & Conditions</h2>
        <div className="space-y-3 mb-4">
          {formData.terms.map((term, index) => (
            <div key={index} className="flex items-start gap-3 bg-gray-50 px-4 py-3 rounded-lg">
              <span className="text-gray-600 flex-1">{term}</span>
              <button
                type="button"
                onClick={() => removeTerm(index)}
                className="p-1 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTerm}
            onChange={(e) => setNewTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTerm())}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add a new term..."
          />
          <button
            type="button"
            onClick={addTerm}
            disabled={!newTerm.trim()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {quote ? 'Update Quote' : 'Create Quote'}
        </button>
      </div>
    </form>
  );
}
