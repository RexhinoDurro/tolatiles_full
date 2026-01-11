'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  Download,
  Send,
  CheckCircle,
  Trash2,
  Calendar,
  User,
  FileText,
  Clock,
  Edit,
  ExternalLink,
  Copy,
  Eye,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import InvoiceStatusBadge from '@/components/admin/invoices/InvoiceStatusBadge';
import InvoiceForm from '@/components/admin/invoices/InvoiceForm';
import { api } from '@/lib/api';
import type { Invoice, InvoiceCreate } from '@/types/api';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = Number(params.id);

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  const fetchInvoice = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getInvoice(invoiceId);
      setInvoice(data);
    } catch (err) {
      setError('Failed to load invoice');
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(amount));
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleUpdateInvoice = async (data: InvoiceCreate) => {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await api.updateInvoice(invoiceId, data);
      setInvoice(updated);
      setIsEditing(false);
      showSuccess('Invoice updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update invoice');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePdf = async () => {
    setActionLoading('pdf');
    try {
      await api.generateInvoicePdf(invoiceId);
      setPdfGenerated(true);
      showSuccess('PDF generated successfully');
      // Refresh to get the PDF URL
      setTimeout(fetchInvoice, 2000);
    } catch (err) {
      setError('Failed to generate PDF');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendEmail = async () => {
    if (!invoice?.customer.email) {
      setError('Customer does not have an email address');
      return;
    }
    setActionLoading('email');
    try {
      await api.sendInvoiceEmail(invoiceId);
      fetchInvoice();
    } catch (err) {
      setError('Failed to send email');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkPaid = async () => {
    setActionLoading('paid');
    try {
      await api.markInvoicePaid(invoiceId);
      fetchInvoice();
    } catch (err) {
      setError('Failed to mark as paid');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    setActionLoading('delete');
    try {
      await api.deleteInvoice(invoiceId);
      router.push('/admin/invoices');
    } catch (err) {
      setError('Failed to delete invoice');
      setActionLoading(null);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    setActionLoading('status');
    try {
      await api.updateInvoiceStatus(invoiceId, status);
      fetchInvoice();
    } catch (err) {
      setError('Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Invoice">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  if (!invoice) {
    return (
      <AdminLayout title="Invoice">
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold text-gray-900">Invoice not found</h2>
          <Link href="/admin/invoices" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to Invoices
          </Link>
        </div>
      </AdminLayout>
    );
  }

  if (isEditing) {
    return (
      <AdminLayout title="Edit Invoice">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Cancel Editing
            </button>
          </div>
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}
          <InvoiceForm invoice={invoice} onSubmit={handleUpdateInvoice} isLoading={isSaving} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Invoice ${invoice.reference}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/invoices"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Invoices
          </Link>
          <InvoiceStatusBadge status={invoice.status} />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {successMessage}
          </div>
        )}

        {/* Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>

            {invoice.pdf_file ? (
              <button
                onClick={() => {
                  const pdfUrl = invoice.pdf_file!.startsWith('http')
                    ? invoice.pdf_file!
                    : `http://localhost:8000${invoice.pdf_file}`;
                  window.location.href = pdfUrl;
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                View PDF
              </button>
            ) : (
              <button
                onClick={handleGeneratePdf}
                disabled={actionLoading === 'pdf'}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading === 'pdf' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Generate PDF
              </button>
            )}

            <button
              onClick={handleSendEmail}
              disabled={actionLoading === 'email' || !invoice.customer.email}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {actionLoading === 'email' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Email
            </button>

            {invoice.status !== 'paid' && (
              <button
                onClick={handleMarkPaid}
                disabled={actionLoading === 'paid'}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading === 'paid' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Mark as Paid
              </button>
            )}

            <div className="ml-auto">
              <button
                onClick={handleDelete}
                disabled={actionLoading === 'delete'}
                className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                {actionLoading === 'delete' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{invoice.title}</h2>
                  <p className="text-sm text-gray-500 font-mono mt-1">{invoice.reference}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(invoice.total)}
                  </p>
                  {invoice.amount_paid > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      Paid: {formatCurrency(invoice.amount_paid)}
                    </p>
                  )}
                  {Number(invoice.balance_due) > 0 && Number(invoice.amount_paid) > 0 && (
                    <p className="text-sm text-orange-600">
                      Balance: {formatCurrency(invoice.balance_due)}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Created: {formatDate(invoice.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Due: {formatDate(invoice.due_date)}</span>
                </div>
              </div>

              {/* Shareable Link */}
              <div className="mt-6 pt-6 border-t">
                <div className="text-sm text-gray-500 mb-2">Shareable Link</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm truncate">
                    {typeof window !== 'undefined'
                      ? `${window.location.origin}/invoices/${invoice.reference}`
                      : `/invoices/${invoice.reference}`}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/invoices/${invoice.reference}`
                      );
                      showSuccess('Link copied to clipboard');
                    }}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    title="Copy link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <Link
                    href={`/invoices/${invoice.reference}`}
                    target="_blank"
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="font-semibold text-gray-900">Line Items</h3>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Item
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Qty
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoice.line_items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-gray-500">{item.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-900">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-gray-900">
                        {formatCurrency(Number(item.unit_price))}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {formatCurrency(item.line_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="px-6 py-4 bg-gray-50 border-t">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    {invoice.discount_amount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-{formatCurrency(invoice.discount_amount)}</span>
                      </div>
                    )}
                    {invoice.tax_amount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax</span>
                        <span className="font-medium">{formatCurrency(invoice.tax_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total</span>
                      <span>{formatCurrency(invoice.total)}</span>
                    </div>
                    {invoice.amount_paid > 0 && (
                      <>
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Paid</span>
                          <span>-{formatCurrency(invoice.amount_paid)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-orange-600">
                          <span>Balance Due</span>
                          <span>{formatCurrency(invoice.balance_due)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900">{invoice.customer.name}</p>
                  <p className="text-sm text-gray-500">{invoice.customer.phone}</p>
                </div>
                {invoice.customer.email && (
                  <p className="text-sm text-gray-600">{invoice.customer.email}</p>
                )}
                {invoice.customer.address && (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {invoice.customer.address}
                  </p>
                )}
              </div>
            </div>

            {/* Status Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {invoice.status === 'draft' && (
                  <button
                    onClick={() => handleUpdateStatus('sent')}
                    disabled={actionLoading === 'status'}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    <Send className="w-4 h-4" />
                    Mark as Sent
                  </button>
                )}
                {invoice.status !== 'paid' && (
                  <button
                    onClick={handleMarkPaid}
                    disabled={actionLoading === 'paid'}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Paid
                  </button>
                )}
              </div>
            </div>

            {/* Payment Info */}
            {invoice.paid_at && (
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Payment Received
                </h3>
                <p className="text-sm text-green-700">Paid on {formatDate(invoice.paid_at)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </AdminLayout>
  );
}
