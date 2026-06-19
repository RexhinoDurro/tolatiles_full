'use client';

import { useState, useMemo } from 'react';
import { Trash2, Loader2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import CustomerSelect from './CustomerSelect';
import LineItemsEditor, { LineItemData } from '@/components/admin/shared/LineItemsEditor';
import type { Quote, QuoteCreate, LineItem, Customer, DiscountType } from '@/types/api';

interface QuoteFormProps {
  quote?: Quote;
  initialCustomer?: Customer;
  dealId?: number;
  onSubmit: (data: QuoteCreate) => Promise<void>;
  isLoading?: boolean;
}

const defaultTerms = [
  'Quote valid for 30 days from the date issued.',
  'Final payment is due upon completion.',
  'All prices include materials and labor unless otherwise noted.',
];

function getDefaultExpiryDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split('T')[0];
}

function toLineItemData(item: LineItem, idx: number): LineItemData {
  return {
    id: `existing-${item.id}-${idx}`,
    name: item.name,
    description: item.description || '',
    is_service: item.is_service || false,
    quantity: item.quantity,
    unit_price: Number(item.unit_price),
    detail_lines: item.detail_lines || [],
    order: item.order,
  };
}

function getInitialLineItems(quote?: Quote): LineItemData[] {
  if (quote?.line_items && quote.line_items.length > 0) {
    return quote.line_items.map(toLineItemData);
  }
  return [
    {
      id: `new-${Date.now()}-0`,
      name: '',
      description: '',
      is_service: false,
      quantity: 1,
      unit_price: 0,
      detail_lines: [],
      order: 0,
    },
  ];
}

export default function QuoteForm({ quote, initialCustomer, dealId, onSubmit, isLoading }: QuoteFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    quote?.customer || initialCustomer || null
  );

  const [formData, setFormData] = useState({
    title: quote?.title || '',
    expires_at: quote?.expires_at || getDefaultExpiryDate(),
    timeline: quote?.timeline || '2-3 weeks',
    currency: (quote?.currency || 'USD') as 'USD' | 'EUR',
    comments_text: quote?.comments_text || '',
    terms: quote?.terms || [...defaultTerms],
    discount_type: (quote?.discount_type || 'percent') as DiscountType,
    discount_percent: quote?.discount_percent ?? 0,
    discount_amount: quote?.discount_amount ?? 0,
    tax_rate: quote?.tax_rate ?? 0,
    shipping_amount: quote?.shipping_amount ?? 0,
    payment_terms: quote?.payment_terms ?? '',
  });

  const [lineItems, setLineItems] = useState<LineItemData[]>(() => getInitialLineItems(quote));
  const [newTerm, setNewTerm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [versionsOpen, setVersionsOpen] = useState(false);

  const totals = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => {
      const itemTotal = item.is_service
        ? (item.unit_price || 0)
        : (item.quantity || 0) * (item.unit_price || 0);
      return sum + itemTotal;
    }, 0);
    const discount =
      formData.discount_type === 'percent'
        ? subtotal * ((formData.discount_percent || 0) / 100)
        : formData.discount_amount || 0;
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * ((formData.tax_rate || 0) / 100);
    const total = afterDiscount + tax + (formData.shipping_amount || 0);
    return { subtotal, discount, afterDiscount, tax, total };
  }, [lineItems, formData.discount_type, formData.discount_percent, formData.discount_amount, formData.tax_rate, formData.shipping_amount]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: formData.currency }).format(amount);

  const addTerm = () => {
    if (!newTerm.trim()) return;
    setFormData({ ...formData, terms: [...formData.terms, newTerm.trim()] });
    setNewTerm('');
  };

  const removeTerm = (index: number) => {
    setFormData({ ...formData, terms: formData.terms.filter((_, i) => i !== index) });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!selectedCustomer) newErrors.customer = 'Please select a customer';
    if (!formData.expires_at) newErrors.expires_at = 'Expiry date is required';
    const hasValidItem = lineItems.some((item) =>
      item.is_service ? item.name.trim() && item.unit_price > 0 : item.name.trim() && (item.quantity || 0) > 0 && item.unit_price > 0
    );
    if (!hasValidItem) newErrors.line_items = 'At least one line item with name and price is required';
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
      discount_type: formData.discount_type,
      discount_percent: formData.discount_type === 'percent' ? formData.discount_percent : 0,
      discount_amount: formData.discount_type === 'fixed' ? formData.discount_amount : 0,
      tax_rate: formData.tax_rate,
      shipping_amount: formData.shipping_amount,
      payment_terms: formData.payment_terms,
      line_items: lineItems
        .filter((item) => item.name.trim())
        .map((item, index) => ({
          name: item.name,
          description: item.description,
          is_service: item.is_service,
          quantity: item.is_service ? 1 : item.quantity,
          unit_price: item.unit_price,
          detail_lines: item.detail_lines,
          order: index,
        })),
      ...(dealId ? { deal_id: dealId } : {}),
    };

    await onSubmit(data);
  };

  const pdfVersions = quote?.pdf_versions ?? [];

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
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : ''}`}
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
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.expires_at ? 'border-red-500' : ''}`}
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
              onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'USD' | 'EUR' })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Summary</h2>
        <textarea
          value={formData.comments_text}
          onChange={(e) => setFormData({ ...formData, comments_text: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe the project summary..."
        />
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Products &amp; Services</h2>
        {errors.line_items && (
          <p className="text-red-500 text-sm mb-3">{errors.line_items}</p>
        )}
        <LineItemsEditor
          items={lineItems}
          onChange={setLineItems}
          currency={formData.currency}
          showServiceToggle
        />
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Discount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount</label>
            {/* Toggle */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden mb-2 w-fit">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, discount_type: 'percent', discount_amount: 0 })}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  formData.discount_type === 'percent'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                % Percent
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, discount_type: 'fixed', discount_percent: 0 })}
                className={`px-3 py-1.5 text-sm font-medium transition-colors border-l border-gray-300 ${
                  formData.discount_type === 'fixed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                $ Fixed
              </button>
            </div>
            {formData.discount_type === 'percent' ? (
              <div className="relative">
                <input
                  type="number"
                  value={formData.discount_percent}
                  onChange={(e) => setFormData({ ...formData, discount_percent: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 pr-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
              </div>
            ) : (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  value={formData.discount_amount}
                  onChange={(e) => setFormData({ ...formData, discount_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-7 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            )}
          </div>

          {/* Tax */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
            <div className="relative">
              <input
                type="number"
                value={formData.tax_rate}
                onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 pr-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
          </div>

          {/* Shipping */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Shipping</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={formData.shipping_amount}
                onChange={(e) => setFormData({ ...formData, shipping_amount: parseFloat(e.target.value) || 0 })}
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
              <span>
                Discount{' '}
                {formData.discount_type === 'percent'
                  ? `(${formData.discount_percent}%)`
                  : '(fixed)'}
              </span>
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

        {/* Pricing notes */}
        <div className="mt-4 pt-4 border-t">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pricing Notes
            <span className="ml-2 text-xs text-gray-400 font-normal">shown to customer on the PDF</span>
          </label>
          <textarea
            value={formData.payment_terms}
            onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="e.g., 50% deposit required. Balance due upon completion. Prices valid for 30 days."
          />
        </div>
      </div>

      {/* Terms */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Terms &amp; Conditions</h2>
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

      {/* PDF Version History (edit mode only) */}
      {quote && pdfVersions.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <button
            type="button"
            onClick={() => setVersionsOpen((v) => !v)}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-semibold">PDF Version History</h2>
            {versionsOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {versionsOpen && (
            <div className="mt-4 space-y-2">
              {pdfVersions.map((v) => (
                <div key={v.version} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Version {v.version}</span>
                    {v.generated_at && (
                      <span className="ml-2 text-xs text-gray-400">
                        {new Date(v.generated_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <a
                    href={`/media/${v.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Download <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
