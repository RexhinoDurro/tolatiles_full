'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { api } from '@/lib/api';
import type { Customer, Estimate, EstimateCreate, EstimateLineItem, VisitStatus, EstimateFinancialStatus, EstimatePhoto } from '@/types/api';

interface EstimateFormProps {
  estimate?: Estimate;
  defaultCustomerId?: number;
  onSubmit: (data: EstimateCreate) => Promise<void>;
  isLoading: boolean;
  onPhotoUpload?: (file: File, caption: string) => Promise<void>;
  onPhotoDelete?: (photoId: number) => Promise<void>;
}

interface LineItemRow {
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  order: number;
}

const visitStatusOptions: { value: VisitStatus; label: string }[] = [
  { value: 'not_scheduled', label: 'Not Scheduled' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const financialStatusOptions: { value: EstimateFinancialStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function EstimateForm({
  estimate,
  defaultCustomerId,
  onSubmit,
  isLoading,
  onPhotoUpload,
  onPhotoDelete,
}: EstimateFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState<number>(
    estimate?.customer?.id ?? defaultCustomerId ?? 0
  );
  const [title, setTitle] = useState(estimate?.title ?? '');
  const [scheduledDate, setScheduledDate] = useState(
    estimate?.scheduled_date ? estimate.scheduled_date.slice(0, 16) : ''
  );
  const [visitStatus, setVisitStatus] = useState<VisitStatus>(estimate?.visit_status ?? 'not_scheduled');
  const [jobAddress, setJobAddress] = useState(estimate?.job_address ?? '');
  const [visitNotes, setVisitNotes] = useState(estimate?.visit_notes ?? '');
  const [financialStatus, setFinancialStatus] = useState<EstimateFinancialStatus>(estimate?.financial_status ?? 'draft');
  const [discountAmount, setDiscountAmount] = useState(estimate?.discount_amount ?? 0);
  const [taxRate, setTaxRate] = useState(estimate?.tax_rate ?? 0);
  const [lineItems, setLineItems] = useState<LineItemRow[]>(
    estimate?.line_items?.map((item) => ({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      order: item.order,
    })) ?? [{ name: '', description: '', quantity: 1, unit_price: 0, order: 0 }]
  );
  const [photoCaption, setPhotoCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Computed totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * (taxRate / 100);
  const total = afterDiscount + taxAmount;

  useEffect(() => {
    api.getCustomers().then(setCustomers).catch(() => {});
  }, []);

  const addLineItem = () => {
    setLineItems([...lineItems, { name: '', description: '', quantity: 1, unit_price: 0, order: lineItems.length }]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof LineItemRow, value: string | number) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onPhotoUpload) return;
    await onPhotoUpload(file, photoCaption);
    setPhotoCaption('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !title) return;

    await onSubmit({
      title,
      customer_id: customerId,
      scheduled_date: scheduledDate || null,
      visit_status: visitStatus,
      job_address: jobAddress,
      visit_notes: visitNotes,
      financial_status: financialStatus,
      discount_amount: discountAmount,
      tax_rate: taxRate,
      line_items: lineItems
        .filter((item) => item.name)
        .map((item, idx) => ({ ...item, order: idx })),
    });
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section 1: Visit Details */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Visit Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Kitchen Tile Estimate"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer <span className="text-red-500">*</span></label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date & Time</label>
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visit Status</label>
            <select
              value={visitStatus}
              onChange={(e) => setVisitStatus(e.target.value as VisitStatus)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {visitStatusOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Address</label>
            <textarea
              value={jobAddress}
              onChange={(e) => setJobAddress(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Property address for this job..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Visit Notes</label>
            <textarea
              value={visitNotes}
              onChange={(e) => setVisitNotes(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Notes from the site visit..."
            />
          </div>
        </div>

        {/* Photo upload (only for existing estimates) */}
        {estimate && onPhotoUpload && (
          <div className="mt-4 pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
            {estimate.photos && estimate.photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                {estimate.photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img src={photo.image_url} alt={photo.caption} className="w-full h-24 object-cover rounded-lg" />
                    {photo.caption && <p className="text-xs text-gray-500 mt-1 truncate">{photo.caption}</p>}
                    {onPhotoDelete && (
                      <button
                        type="button"
                        onClick={() => onPhotoDelete(photo.id)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
                placeholder="Caption (optional)"
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                <Upload className="w-4 h-4" /> Upload Photo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Cost Breakdown */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h2>

        {/* Line Items */}
        <div className="space-y-3 mb-4">
          {lineItems.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-5">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateLineItem(index, 'name', e.target.value)}
                  placeholder="Item name"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                  placeholder="Qty"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  value={item.unit_price}
                  onChange={(e) => updateLineItem(index, 'unit_price', Number(e.target.value))}
                  placeholder="Unit Price"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-1 py-2 text-right text-sm text-gray-700">
                {formatCurrency(item.quantity * item.unit_price)}
              </div>
              <div className="col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={() => removeLineItem(index)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addLineItem}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add Line Item
        </button>

        {/* Totals */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-500 flex-1">Discount ($)</label>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  min="0"
                  step="0.01"
                  className="w-24 px-2 py-1 border rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-500 flex-1">Tax Rate (%)</label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-24 px-2 py-1 border rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Status */}
        <div className="mt-4 pt-4 border-t">
          <label className="block text-sm font-medium text-gray-700 mb-1">Financial Status</label>
          <select
            value={financialStatus}
            onChange={(e) => setFinancialStatus(e.target.value as EstimateFinancialStatus)}
            className="w-full sm:w-48 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {financialStatusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={isLoading || !title || !customerId}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {isLoading ? 'Saving...' : estimate ? 'Update Estimate' : 'Create Estimate'}
        </button>
      </div>
    </form>
  );
}
