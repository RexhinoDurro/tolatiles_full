'use client';

import { useState, useMemo } from 'react';
import { Trash2, Loader2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import CustomerSelect from './CustomerSelect';
import LineItemsEditor, { LineItemData } from '@/components/admin/shared/LineItemsEditor';
import type { Quote, QuoteCreate, LineItem, Customer, CustomerCreate, DiscountType } from '@/types/api';

interface QuoteFormProps {
  quote?: Quote;
  initialCustomer?: Customer;
  dealId?: number;
  onSubmit: (data: QuoteCreate) => Promise<void>;
  isLoading?: boolean;
  onCustomerSearch?: (q: string) => Promise<Customer[]>;
  onCreateCustomer?: (data: CustomerCreate) => Promise<Customer>;
  /** When true, hides the Customer field (e.g. portal new-quote flow). */
  hideCustomerField?: boolean;
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
  return [];
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  error,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {hint && <span className="ml-2 text-xs text-gray-400 font-normal">{hint}</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function QuoteForm({
  quote,
  initialCustomer,
  dealId,
  onSubmit,
  isLoading,
  onCustomerSearch,
  onCreateCustomer,
  hideCustomerField = false,
}: QuoteFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    quote?.customer || initialCustomer || null,
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

  const set = (patch: Partial<typeof formData>) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  const totals = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => {
      const itemTotal = item.is_service
        ? item.unit_price || 0
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
  }, [
    lineItems,
    formData.discount_type,
    formData.discount_percent,
    formData.discount_amount,
    formData.tax_rate,
    formData.shipping_amount,
  ]);

  const fmt = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: formData.currency }).format(
      amount,
    );

  const addTerm = () => {
    if (!newTerm.trim()) return;
    set({ terms: [...formData.terms, newTerm.trim()] });
    setNewTerm('');
  };

  const removeTerm = (index: number) => {
    set({ terms: formData.terms.filter((_, i) => i !== index) });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!hideCustomerField && !selectedCustomer) errs.customer = 'Please select a customer';
    if (!formData.expires_at) errs.expires_at = 'Expiry date is required';
    const hasValidItem = lineItems.some((item) =>
      item.is_service
        ? item.name.trim() && item.unit_price > 0
        : item.name.trim() && (item.quantity || 0) > 0 && item.unit_price > 0,
    );
    if (!hasValidItem)
      errs.line_items = 'At least one line item with name and price is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: QuoteCreate = {
      title: formData.title,
      ...(!hideCustomerField && selectedCustomer ? { customer_id: selectedCustomer.id } : {}),
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
    <form onSubmit={handleSubmit} className="space-y-4 pb-28 sm:pb-10">
      {/* ── Quote Details ──────────────────────────────────────────────── */}
      <Section title="Quote Details">
        <div className="space-y-3">
          <Field label="Title" required error={errors.title}>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => set({ title: e.target.value })}
              className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-400' : 'border-gray-200'
              }`}
              placeholder="e.g. Kitchen Backsplash Installation"
            />
          </Field>

          {!hideCustomerField && (
            <Field label="Customer" required error={errors.customer}>
              <CustomerSelect
                value={selectedCustomer}
                onChange={setSelectedCustomer}
                onSearch={onCustomerSearch}
                onCreateCustomer={onCreateCustomer}
              />
            </Field>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Valid Until" required>
              <input
                type="date"
                value={formData.expires_at}
                onChange={(e) => set({ expires_at: e.target.value })}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.expires_at ? 'border-red-400' : 'border-gray-200'
                }`}
              />
            </Field>

            <Field label="Timeline">
              <select
                value={formData.timeline}
                onChange={(e) => set({ timeline: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1 week">1 week</option>
                <option value="2-3 weeks">2–3 weeks</option>
                <option value="1 month">1 month</option>
                <option value="2 months">2 months</option>
                <option value="3 months">3 months</option>
                <option value="TBD">TBD</option>
              </select>
            </Field>
          </div>

          <Field label="Currency">
            <select
              value={formData.currency}
              onChange={(e) => set({ currency: e.target.value as 'USD' | 'EUR' })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </Field>
        </div>
      </Section>

      {/* ── Summary ────────────────────────────────────────────────────── */}
      <Section title="Summary">
        <textarea
          value={formData.comments_text}
          onChange={(e) => set({ comments_text: e.target.value })}
          rows={3}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Describe the project..."
        />
      </Section>

      {/* ── Products & Services ────────────────────────────────────────── */}
      <Section title="Products & Services">
        {errors.line_items && (
          <p className="text-red-500 text-xs mb-3">{errors.line_items}</p>
        )}
        <LineItemsEditor
          items={lineItems}
          onChange={setLineItems}
          currency={formData.currency}
          showServiceToggle
        />
      </Section>

      {/* ── Pricing ────────────────────────────────────────────────────── */}
      <Section title="Pricing">
        <div className="space-y-3">
          {/* Discount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount</label>
            <div className="flex gap-2 items-start">
              {/* Toggle */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium flex-shrink-0">
                <button
                  type="button"
                  onClick={() => set({ discount_type: 'percent', discount_amount: 0 })}
                  className={`px-3 py-2 transition-colors ${
                    formData.discount_type === 'percent'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => set({ discount_type: 'fixed', discount_percent: 0 })}
                  className={`px-3 py-2 border-l border-gray-200 transition-colors ${
                    formData.discount_type === 'fixed'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  $
                </button>
              </div>

              {formData.discount_type === 'percent' ? (
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={formData.discount_percent}
                    onChange={(e) => set({ discount_percent: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 pr-7 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    %
                  </span>
                </div>
              ) : (
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    value={formData.discount_amount}
                    onChange={(e) => set({ discount_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Tax + Shipping */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tax Rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.tax_rate}
                  onChange={(e) => set({ tax_rate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 pr-7 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Shipping
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  value={formData.shipping_amount}
                  onChange={(e) =>
                    set({ shipping_amount: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 space-y-2 mt-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>{fmt(totals.subtotal)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>
                  Discount
                  {formData.discount_type === 'percent'
                    ? ` (${formData.discount_percent}%)`
                    : ''}
                </span>
                <span>−{fmt(totals.discount)}</span>
              </div>
            )}
            {totals.tax > 0 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>Tax ({formData.tax_rate}%)</span>
                <span>{fmt(totals.tax)}</span>
              </div>
            )}
            {formData.shipping_amount > 0 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span>{fmt(formData.shipping_amount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-200 pt-2">
              <span>Total</span>
              <span>{fmt(totals.total)}</span>
            </div>
          </div>

          {/* Pricing Notes */}
          <Field label="Pricing Notes" hint="shown to customer on the PDF">
            <textarea
              value={formData.payment_terms}
              onChange={(e) => set({ payment_terms: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="e.g. 50% deposit required. Balance due upon completion."
            />
          </Field>
        </div>
      </Section>

      {/* ── Terms & Conditions ─────────────────────────────────────────── */}
      <Section title="Terms & Conditions">
        <div className="space-y-2 mb-3">
          {formData.terms.map((term, index) => (
            <div
              key={index}
              className="flex items-start gap-2 bg-gray-50 px-3 py-2.5 rounded-lg"
            >
              <span className="text-xs text-gray-500 flex-1 min-w-0 break-words leading-relaxed">
                {term}
              </span>
              <button
                type="button"
                onClick={() => removeTerm(index)}
                className="flex-shrink-0 p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
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
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add a term..."
          />
          <button
            type="button"
            onClick={addTerm}
            disabled={!newTerm.trim()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-40 text-sm font-medium transition-colors flex-shrink-0"
          >
            Add
          </button>
        </div>
      </Section>

      {/* ── PDF Version History ────────────────────────────────────────── */}
      {quote && pdfVersions.length > 0 && (
        <Section title="PDF Version History">
          <button
            type="button"
            onClick={() => setVersionsOpen((v) => !v)}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700"
          >
            {pdfVersions.length} version{pdfVersions.length !== 1 ? 's' : ''}
            {versionsOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {versionsOpen && (
            <div className="mt-3 space-y-2">
              {pdfVersions.map((v) => (
                <div
                  key={v.version}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-700">v{v.version}</span>
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
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Download <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* ── Sticky submit bar (mobile) / inline (desktop) ─────────────── */}
      <div className="fixed bottom-0 left-0 right-0 sm:relative sm:bottom-auto z-30 bg-white sm:bg-transparent border-t border-gray-200 sm:border-0 px-4 py-3 sm:p-0 sm:pt-2">
        <div className="max-w-2xl mx-auto flex items-center gap-3 sm:justify-end">
          {/* Total preview on mobile */}
          <div className="sm:hidden flex-1 min-w-0">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-base font-bold text-gray-900 truncate">{fmt(totals.total)}</p>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-shrink-0 sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors text-sm font-semibold shadow-sm"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {quote ? 'Update Quote' : 'Create Quote'}
          </button>
        </div>
      </div>
    </form>
  );
}
