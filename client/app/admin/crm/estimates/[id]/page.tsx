'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, FileDown, Send, CheckCircle, Trash2, Edit, Eye, RefreshCw, FileText } from 'lucide-react';
import CrmLayout from '@/components/admin/crm/CrmLayout';
import EstimateForm from '@/components/admin/crm/estimates/EstimateForm';
import { api } from '@/lib/api';
import type { Estimate, EstimateCreate } from '@/types/api';

export default function EstimateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const estimateId = Number(params.id);

  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => { fetchEstimate(); }, [estimateId]);

  const fetchEstimate = async () => {
    setIsLoading(true);
    try {
      const data = await api.getEstimate(estimateId);
      setEstimate(data);
    } catch {
      setError('Failed to load estimate');
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleUpdate = async (data: EstimateCreate) => {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await api.updateEstimate(estimateId, data);
      setEstimate(updated);
      setIsEditing(false);
      showSuccess('Estimate updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update estimate');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (file: File, caption: string) => {
    try {
      await api.uploadEstimatePhoto(estimateId, file, caption);
      fetchEstimate();
      showSuccess('Photo uploaded');
    } catch {
      setError('Failed to upload photo');
    }
  };

  const handlePhotoDelete = async (photoId: number) => {
    try {
      await api.deleteEstimatePhoto(estimateId, photoId);
      fetchEstimate();
    } catch {
      setError('Failed to delete photo');
    }
  };

  const handleConvertToQuote = async () => {
    if (!confirm('Convert this estimate to a quote?')) return;
    setActionLoading('convert');
    try {
      const quote = await api.convertEstimateToQuote(estimateId);
      showSuccess('Quote created successfully');
      router.push(`/admin/crm/quotes/${quote.id}`);
    } catch {
      setError('Failed to convert to quote');
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this estimate?')) return;
    setActionLoading('delete');
    try {
      await api.deleteEstimate(estimateId);
      router.push('/admin/crm/estimates');
    } catch {
      setError('Failed to delete estimate');
      setActionLoading(null);
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (v: number | string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(v));

  const visitStatusColors: Record<string, string> = {
    not_scheduled: 'bg-gray-100 text-gray-600',
    scheduled: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
  };

  if (isLoading) {
    return (
      <CrmLayout title="Estimate">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </CrmLayout>
    );
  }

  if (!estimate) {
    return (
      <CrmLayout title="Estimate Not Found">
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold mb-2">Estimate not found</h2>
          <Link href="/admin/crm/estimates" className="text-blue-600 hover:underline">Back to Estimates</Link>
        </div>
      </CrmLayout>
    );
  }

  if (isEditing) {
    return (
      <CrmLayout title="Edit Estimate">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button onClick={() => setIsEditing(false)} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" /> Cancel Editing
            </button>
          </div>
          {error && <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>}
          <EstimateForm
            estimate={estimate}
            onSubmit={handleUpdate}
            isLoading={isSaving}
            onPhotoUpload={handlePhotoUpload}
            onPhotoDelete={handlePhotoDelete}
          />
        </div>
      </CrmLayout>
    );
  }

  return (
    <CrmLayout title={`Estimate ${estimate.reference}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link href="/admin/crm/estimates" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" /> Back to Estimates
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Edit className="w-4 h-4" /> Edit
            </button>
            {!estimate.quote && (
              <button onClick={handleConvertToQuote} disabled={actionLoading === 'convert'} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                <FileText className="w-4 h-4" /> {actionLoading === 'convert' ? 'Converting...' : 'Convert to Quote'}
              </button>
            )}
            {estimate.quote && (
              <Link href={`/admin/crm/quotes/${estimate.quote}`} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Eye className="w-4 h-4" /> View Quote
              </Link>
            )}
          </div>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" /> {successMessage}
          </div>
        )}
        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visit Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Visit Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Title</p>
                <p className="font-medium text-gray-900">{estimate.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium text-gray-900">{estimate.customer.name}</p>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-gray-500">Scheduled Date</p>
                  <p className="font-medium text-gray-900">{formatDate(estimate.scheduled_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Visit Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-0.5 ${visitStatusColors[estimate.visit_status]}`}>
                    {estimate.visit_status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              {estimate.job_address && (
                <div>
                  <p className="text-sm text-gray-500">Job Address</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{estimate.job_address}</p>
                </div>
              )}
              {estimate.visit_notes && (
                <div>
                  <p className="text-sm text-gray-500">Visit Notes</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{estimate.visit_notes}</p>
                </div>
              )}
            </div>

            {/* Photos */}
            {estimate.photos && estimate.photos.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-3">Site Photos</p>
                <div className="grid grid-cols-2 gap-3">
                  {estimate.photos.map((photo) => (
                    <div key={photo.id}>
                      <img src={photo.image_url} alt={photo.caption} className="w-full h-32 object-cover rounded-lg" />
                      {photo.caption && <p className="text-xs text-gray-500 mt-1">{photo.caption}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cost Breakdown */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Cost Breakdown</h2>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                estimate.financial_status === 'approved' ? 'bg-green-100 text-green-700' :
                estimate.financial_status === 'sent' ? 'bg-blue-100 text-blue-700' :
                estimate.financial_status === 'rejected' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-600'
              }`}>{estimate.financial_status}</span>
            </div>

            {estimate.line_items.length > 0 && (
              <table className="w-full mb-4">
                <thead className="border-b">
                  <tr className="text-left text-sm text-gray-500">
                    <th className="pb-2 font-medium">Item</th>
                    <th className="pb-2 font-medium text-center">Qty</th>
                    <th className="pb-2 font-medium text-right">Price</th>
                    <th className="pb-2 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {estimate.line_items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2 text-sm text-gray-900">{item.name}</td>
                      <td className="py-2 text-sm text-center text-gray-600">{item.quantity}</td>
                      <td className="py-2 text-sm text-right text-gray-600">{formatCurrency(item.unit_price)}</td>
                      <td className="py-2 text-sm text-right font-medium text-gray-900">{formatCurrency(item.line_total ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatCurrency(estimate.subtotal)}</span>
              </div>
              {estimate.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(estimate.discount_amount)}</span>
                </div>
              )}
              {estimate.tax_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax ({estimate.tax_rate}%)</span>
                  <span>{formatCurrency(estimate.tax_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(estimate.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-red-200">
          <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
          <button onClick={handleDelete} disabled={actionLoading === 'delete'} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
            <Trash2 className="w-4 h-4" /> {actionLoading === 'delete' ? 'Deleting...' : 'Delete Estimate'}
          </button>
        </div>
      </div>
    </CrmLayout>
  );
}
