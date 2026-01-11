'use client';

import { useState, useMemo } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import CustomerSelect from '../quotes/CustomerSelect';
import type { Invoice, InvoiceCreate, Customer } from '@/types/api';

interface LineItem {
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  order?: number;
}

interface InvoiceFormProps {
  invoice?: Invoice;
  onSubmit: (data: InvoiceCreate) => Promise<void>;
  isLoading?: boolean;
}

function getDefaultDueDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split('T')[0];
}

function createEmptyLineItem(order: number = 0): LineItem {
  return {
    name: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    order,
  };
}

function getInitialLineItems(invoice?: Invoice): LineItem[] {
  if (invoice?.line_items && invoice.line_items.length > 0) {
    return invoice.line_items.map((item) => ({
      name: item.name,
      description: item.description || '',
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      order: item.order,
    }));
  }
  return [createEmptyLineItem(0)];
}

export default function InvoiceForm({ invoice, onSubmit, isLoading }: InvoiceFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    invoice?.customer || null
  );

  const [formData, setFormData] = useState({
    title: invoice?.title || '',
    due_date: invoice?.due_date || getDefaultDueDate(),
    currency: invoice?.currency || 'USD' as 'USD' | 'EUR',
    notes: invoice?.notes || '',
    payment_terms: invoice?.payment_terms || '',
    discount_amount: Number(invoice?.discount_amount) || 0,
    tax_rate: Number(invoice?.tax_rate) || 0,
    shipping_amount: Number(invoice?.shipping_amount) || 0,
  });

  const [lineItems, setLineItems] = useState<LineItem[]>(() => getInitialLineItems(invoice));
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = lineItems.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.unit_price || 0),
      0
    );
    const discount = formData.discount_amount || 0;
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * ((formData.tax_rate || 0) / 100);
    const total = afterDiscount + tax + (formData.shipping_amount || 0);

    return { subtotal, discount, afterDiscount, tax, total };
  }, [lineItems, formData.discount_amount, formData.tax_rate, formData.shipping_amount]);

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

  const updateLineItem = (index: number, field: keyof LineItem, value: unknown) => {
    setLineItems(
      lineItems.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!selectedCustomer) {
      newErrors.customer = 'Please select a customer';
    }

    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required';
    }

    const hasValidLineItem = lineItems.some(
      (item) => item.name.trim() && item.quantity > 0 && item.unit_price > 0
    );
    if (!hasValidLineItem) {
      newErrors.line_items = 'At least one line item with name, quantity, and price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
      discount_amount: formData.discount_amount,
      tax_rate: formData.tax_rate,
      shipping_amount: formData.shipping_amount,
      line_items: lineItems
        .filter((item) => item.name.trim())
        .map((item, index) => ({ ...item, order: index })),
    };

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
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
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.due_date ? 'border-red-500' : ''
              }`}
            />
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

      {/* Notes */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Notes</h2>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Additional notes for the customer..."
        />
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Line Items</h2>
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
                    {formatCurrency((item.quantity || 0) * (item.unit_price || 0))}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={formData.discount_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discount_amount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full pl-7 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>
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
              <span>Discount</span>
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

      {/* Payment Terms */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Payment Terms</h2>
        <textarea
          value={formData.payment_terms}
          onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Payment due within 30 days of invoice date..."
        />
      </div>

      {/* Submit */}
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
