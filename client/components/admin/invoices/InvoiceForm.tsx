'use client';

import { useState, useMemo } from 'react';
import { Plus, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import CustomerSelect from '../quotes/CustomerSelect';
import LineItemsEditor, { type LineItemData } from '../shared/LineItemsEditor';
import type { Invoice, InvoiceCreate, Customer, DiscountType } from '@/types/api';

// ── Local types ───────────────────────────────────────────────────────────────

interface LocalInstallment {
  clientId: string;
  title: string;
  start_date: string;
  due_date: string;
  notes: string;
  lineItems: LineItemData[];
}

interface InvoiceFormProps {
  invoice?: Invoice;
  initialCustomer?: Customer;
  dealId?: number;
  onSubmit: (data: InvoiceCreate) => Promise<void>;
  isLoading?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDefaultDueDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split('T')[0];
}

function uid() {
  return `inst-${Date.now()}-${Math.random()}`;
}

function toLineItemData(items: Invoice['installments'][0]['line_items']): LineItemData[] {
  return items.map((item, idx) => ({
    id: `existing-${item.id ?? idx}`,
    name: item.name,
    description: item.description ?? '',
    quantity: Number(item.quantity),
    unit_price: Number(item.unit_price),
    order: item.order,
  }));
}

function getInitialInstallments(invoice?: Invoice): LocalInstallment[] {
  if (invoice?.installments && invoice.installments.length > 0) {
    return invoice.installments.map((inst, idx) => ({
      clientId: uid(),
      title: inst.title,
      start_date: inst.start_date ?? '',
      due_date: inst.due_date ?? '',
      notes: inst.notes ?? '',
      lineItems: toLineItemData(inst.line_items),
    }));
  }
  return [
    {
      clientId: uid(),
      title: 'Installment 1',
      start_date: '',
      due_date: getDefaultDueDate(),
      notes: '',
      lineItems: [],
    },
  ];
}

function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function InvoiceForm({
  invoice,
  initialCustomer,
  dealId,
  onSubmit,
  isLoading,
}: InvoiceFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    invoice?.customer || initialCustomer || null,
  );

  const [formData, setFormData] = useState({
    title: invoice?.title ?? '',
    due_date: invoice?.due_date ?? getDefaultDueDate(),
    currency: (invoice?.currency ?? 'USD') as 'USD' | 'EUR',
    notes: invoice?.notes ?? '',
    payment_terms: invoice?.payment_terms ?? '',
    discount_type: (invoice?.discount_type ?? 'fixed') as DiscountType,
    discount_amount: Number(invoice?.discount_amount) || 0,
    discount_percent: Number(invoice?.discount_percent) || 0,
    tax_rate: Number(invoice?.tax_rate) || 0,
    shipping_amount: Number(invoice?.shipping_amount) || 0,
  });

  const [installments, setInstallments] = useState<LocalInstallment[]>(() =>
    getInitialInstallments(invoice),
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // ── Totals ──────────────────────────────────────────────────────────────────

  const totals = useMemo(() => {
    const subtotal = installments.reduce(
      (sum, inst) =>
        sum + inst.lineItems.reduce((s, item) => s + (item.quantity || 0) * (item.unit_price || 0), 0),
      0,
    );
    const discountAmt =
      formData.discount_type === 'percent'
        ? subtotal * ((formData.discount_percent || 0) / 100)
        : formData.discount_amount || 0;
    const afterDiscount = subtotal - discountAmt;
    const tax = afterDiscount * ((formData.tax_rate || 0) / 100);
    const total = afterDiscount + tax + (formData.shipping_amount || 0);
    return { subtotal, discountAmt, afterDiscount, tax, total };
  }, [installments, formData]);

  // ── Installment helpers ─────────────────────────────────────────────────────

  function addInstallment() {
    setInstallments(prev => [
      ...prev,
      {
        clientId: uid(),
        title: `Installment ${prev.length + 1}`,
        start_date: '',
        due_date: getDefaultDueDate(),
        notes: '',
        lineItems: [],
      },
    ]);
  }

  function removeInstallment(clientId: string) {
    setInstallments(prev => prev.filter(i => i.clientId !== clientId));
  }

  function updateInstallmentField(clientId: string, field: keyof LocalInstallment, value: unknown) {
    setInstallments(prev =>
      prev.map(i => (i.clientId === clientId ? { ...i, [field]: value } : i)),
    );
  }

  function toggleCollapsed(clientId: string) {
    setCollapsed(prev => ({ ...prev, [clientId]: !prev[clientId] }));
  }

  // ── Validation ──────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!selectedCustomer) newErrors.customer = 'Please select a customer';
    if (!formData.due_date) newErrors.due_date = 'Due date is required';

    const allItems = installments.flatMap(i => i.lineItems);
    const hasValid = allItems.some(item => item.name.trim() && item.unit_price > 0);
    if (!hasValid) newErrors.line_items = 'At least one installment must have a named item with a price';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: InvoiceCreate = {
      title: formData.title,
      customer_id: selectedCustomer!.id,
      due_date: formData.due_date,
      currency: formData.currency,
      notes: formData.notes,
      payment_terms: formData.payment_terms,
      discount_type: formData.discount_type,
      discount_amount: formData.discount_type === 'fixed' ? formData.discount_amount : 0,
      discount_percent: formData.discount_type === 'percent' ? formData.discount_percent : 0,
      tax_rate: formData.tax_rate,
      shipping_amount: formData.shipping_amount,
      installments: installments.map((inst, instIdx) => ({
        title: inst.title,
        order: instIdx,
        start_date: inst.start_date || null,
        due_date: inst.due_date || null,
        notes: inst.notes,
        line_items: inst.lineItems
          .filter(item => item.name.trim())
          .map((item, idx) => ({
            name: item.name,
            description: item.description || '',
            quantity: item.quantity,
            unit_price: item.unit_price,
            order: idx,
          })),
      })),
      ...(dealId ? { deal_id: dealId } : {}),
    };

    await onSubmit(data);
  };

  const set = (field: string, value: unknown) => setFormData(prev => ({ ...prev, [field]: value }));

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* ── Basic Info ── */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Invoice Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e => set('title', e.target.value)}
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
              Invoice Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={e => set('due_date', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.due_date ? 'border-red-500' : ''}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              value={formData.currency}
              onChange={e => set('currency', e.target.value as 'USD' | 'EUR')}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Installments ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Installments
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({installments.length})
            </span>
          </h2>
        </div>

        {errors.line_items && (
          <p className="text-red-500 text-sm">{errors.line_items}</p>
        )}

        {installments.map((inst, instIdx) => {
          const instTotal = inst.lineItems.reduce(
            (s, item) => s + (item.quantity || 0) * (item.unit_price || 0),
            0,
          );
          const isCollapsed = !!collapsed[inst.clientId];

          return (
            <div key={inst.clientId} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    type="button"
                    onClick={() => toggleCollapsed(inst.clientId)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                  </button>
                  <input
                    type="text"
                    value={inst.title}
                    onChange={e => updateInstallmentField(inst.clientId, 'title', e.target.value)}
                    className="text-base font-semibold bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1 py-0.5 min-w-0 flex-1"
                    placeholder="Installment title"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">
                    {formatCurrency(instTotal, formData.currency)}
                  </span>
                  {installments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInstallment(inst.clientId)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove installment"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Dates row */}
              {!isCollapsed && (
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={inst.start_date}
                      onChange={e => updateInstallmentField(inst.clientId, 'start_date', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={inst.due_date}
                      onChange={e => updateInstallmentField(inst.clientId, 'due_date', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs text-gray-500 mb-1">Notes</label>
                    <input
                      type="text"
                      value={inst.notes}
                      onChange={e => updateInstallmentField(inst.clientId, 'notes', e.target.value)}
                      placeholder="Optional note for this installment"
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Line items editor */}
              {!isCollapsed && (
                <div className="px-6 py-4">
                  <LineItemsEditor
                    items={inst.lineItems}
                    onChange={items => updateInstallmentField(inst.clientId, 'lineItems', items)}
                    currency={formData.currency}
                    showServiceToggle={true}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Add installment */}
        <button
          type="button"
          onClick={addInstallment}
          className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:border-blue-400 hover:text-blue-600 w-full justify-center transition-colors"
        >
          <Plus size={16} />
          Add Installment
        </button>
      </div>

      {/* ── Pricing / Totals ── */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Pricing</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Discount toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount</label>
            <div className="flex rounded-lg overflow-hidden border border-gray-300 mb-2">
              <button
                type="button"
                onClick={() => set('discount_type', 'percent')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  formData.discount_type === 'percent'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                % Percent
              </button>
              <button
                type="button"
                onClick={() => set('discount_type', 'fixed')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
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
                  onChange={e => set('discount_percent', parseFloat(e.target.value) || 0)}
                  className="w-full pl-4 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
              </div>
            ) : (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  value={formData.discount_amount}
                  onChange={e => set('discount_amount', parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
            <input
              type="number"
              value={formData.tax_rate}
              onChange={e => set('tax_rate', parseFloat(e.target.value) || 0)}
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
                onChange={e => set('shipping_amount', parseFloat(e.target.value) || 0)}
                className="w-full pl-7 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Totals summary */}
        <div className="border-t pt-4 space-y-2 max-w-sm ml-auto">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatCurrency(totals.subtotal, formData.currency)}</span>
          </div>
          {totals.discountAmt > 0 && (
            <div className="flex justify-between text-green-600">
              <span>
                Discount
                {formData.discount_type === 'percent' && ` (${formData.discount_percent}%)`}
              </span>
              <span>-{formatCurrency(totals.discountAmt, formData.currency)}</span>
            </div>
          )}
          {totals.tax > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Tax ({formData.tax_rate}%)</span>
              <span>{formatCurrency(totals.tax, formData.currency)}</span>
            </div>
          )}
          {formData.shipping_amount > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{formatCurrency(formData.shipping_amount, formData.currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-2">
            <span>Total</span>
            <span>{formatCurrency(totals.total, formData.currency)}</span>
          </div>
        </div>
      </div>

      {/* ── Notes & Payment Terms ── */}
      <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            value={formData.notes}
            onChange={e => set('notes', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Additional notes for the customer..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
          <textarea
            value={formData.payment_terms}
            onChange={e => set('payment_terms', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Payment due within 30 days of invoice date..."
          />
        </div>
      </div>

      {/* ── Submit ── */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {invoice ? 'Update Invoice' : 'Create Invoice'}
        </button>
      </div>
    </form>
  );
}
