'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  FileDown,
  Send,
  Copy,
  Trash2,
  ExternalLink,
  CheckCircle,
  Edit,
  FileText,
  Eye,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import QuoteStatusBadge from '@/components/admin/quotes/QuoteStatusBadge';
import QuoteForm from '@/components/admin/quotes/QuoteForm';
import { api } from '@/lib/api';
import type { Quote, QuoteCreate, QuoteStatus } from '@/types/api';

export default function QuoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const quoteId = parseInt(params.id as string);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  useEffect(() => {
    fetchQuote();
  }, [quoteId]);

  const fetchQuote = async () => {
    setIsLoading(true);
    try {
      const data = await api.getQuote(quoteId);
      setQuote(data);
    } catch (err) {
      setError('Failed to load quote');
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleUpdateQuote = async (data: QuoteCreate) => {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await api.updateQuote(quoteId, data);
      setQuote(updated);
      setIsEditing(false);
      showSuccess('Quote updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update quote');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (status: QuoteStatus) => {
    setActionLoading('status');
    try {
      const updated = await api.updateQuoteStatus(quoteId, status);
      setQuote(updated);
      showSuccess(`Quote marked as ${status}`);
    } catch (err) {
      setError('Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleGeneratePdf = async () => {
    setActionLoading('pdf');
    try {
      await api.generateQuotePdf(quoteId);
      setPdfGenerated(true);
      showSuccess('PDF generated successfully');
      // Refresh after a delay to get the PDF URL
      setTimeout(fetchQuote, 2000);
    } catch (err) {
      setError('Failed to generate PDF');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendEmail = async () => {
    if (!quote?.customer?.email) {
      setError('Customer has no email address');
      return;
    }
    setActionLoading('email');
    try {
      await api.sendQuoteEmail(quoteId);
      showSuccess('Quote sent to customer');
      fetchQuote();
    } catch (err) {
      setError('Failed to send email');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async () => {
    setActionLoading('duplicate');
    try {
      const newQuote = await api.duplicateQuote(quoteId);
      router.push(`/admin/quotes/${newQuote.id}`);
    } catch (err) {
      setError('Failed to duplicate quote');
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this quote?')) return;
    setActionLoading('delete');
    try {
      await api.deleteQuote(quoteId);
      router.push('/admin/quotes');
    } catch (err) {
      setError('Failed to delete quote');
      setActionLoading(null);
    }
  };

  const handleConvertToInvoice = async () => {
    if (!confirm('Create an invoice from this quote?')) return;
    setActionLoading('invoice');
    try {
      const invoice = await api.convertQuoteToInvoice(quoteId);
      showSuccess('Invoice created successfully');
      router.push(`/admin/invoices/${invoice.id}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create invoice';
      setError(errorMessage);
      setActionLoading(null);
    }
  };

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
      currency: quote?.currency || 'USD',
    }).format(Number(amount));
  };

  if (isLoading) {
    return (
      <AdminLayout title="Loading...">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  if (!quote) {
    return (
      <AdminLayout title="Quote Not Found">
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Quote not found</h2>
          <p className="text-gray-500 mb-4">The quote you're looking for doesn't exist.</p>
          <Link href="/admin/quotes" className="text-blue-600 hover:underline">
            Back to Quotes
          </Link>
        </div>
      </AdminLayout>
    );
  }

  if (isEditing) {
    return (
      <AdminLayout title="Edit Quote">
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
          <QuoteForm quote={quote} onSubmit={handleUpdateQuote} isLoading={isSaving} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Quote ${quote.reference}`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/admin/quotes"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quotes
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            {quote.pdf_url ? (
              <button
                onClick={() => {
                  const pdfUrl = quote.pdf_url!.startsWith('http')
                    ? quote.pdf_url!
                    : `http://localhost:8000${quote.pdf_url}`;
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
                <FileDown className="w-4 h-4" />
                {actionLoading === 'pdf' ? 'Generating...' : 'Generate PDF'}
              </button>
            )}
            <button
              onClick={handleSendEmail}
              disabled={actionLoading === 'email' || !quote.customer?.email}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
              {actionLoading === 'email' ? 'Sending...' : 'Send Email'}
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Quote Header Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{quote.title}</h1>
                <QuoteStatusBadge status={quote.status} />
              </div>
              <p className="font-mono text-blue-600">{quote.reference}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">{formatCurrency(quote.total)}</div>
              <div className="text-sm text-gray-500">Total Amount</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Customer */}
            <div>
              <div className="text-sm text-gray-500 mb-1">Customer</div>
              <div className="font-medium text-gray-900">{quote.customer.name}</div>
              <div className="text-sm text-gray-600">{quote.customer.phone}</div>
              {quote.customer.email && (
                <div className="text-sm text-gray-600">{quote.customer.email}</div>
              )}
            </div>

            {/* Dates */}
            <div>
              <div className="text-sm text-gray-500 mb-1">Created</div>
              <div className="font-medium text-gray-900">{formatDate(quote.created_at)}</div>
              <div className="text-sm text-gray-500 mt-2">Expires</div>
              <div className="font-medium text-gray-900">{formatDate(quote.expires_at)}</div>
              {quote.timeline && (
                <>
                  <div className="text-sm text-gray-500 mt-2">Timeline</div>
                  <div className="font-medium text-gray-900">{quote.timeline}</div>
                </>
              )}
            </div>

            {/* Actions */}
            <div>
              <div className="text-sm text-gray-500 mb-2">Quick Actions</div>
              <div className="flex flex-wrap gap-2">
                {quote.status === 'draft' && (
                  <button
                    onClick={() => handleStatusChange('sent')}
                    disabled={actionLoading === 'status'}
                    className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
                  >
                    Mark as Sent
                  </button>
                )}
                {quote.status === 'sent' && (
                  <button
                    onClick={() => handleStatusChange('accepted')}
                    disabled={actionLoading === 'status'}
                    className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                  >
                    Mark as Accepted
                  </button>
                )}
                {quote.status === 'accepted' && (
                  <button
                    onClick={handleConvertToInvoice}
                    disabled={actionLoading === 'invoice'}
                    className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200"
                  >
                    <FileText className="w-3 h-3 inline mr-1" />
                    {actionLoading === 'invoice' ? 'Creating...' : 'Create Invoice'}
                  </button>
                )}
                <button
                  onClick={handleDuplicate}
                  disabled={actionLoading === 'duplicate'}
                  className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                >
                  <Copy className="w-3 h-3 inline mr-1" />
                  Duplicate
                </button>
              </div>
            </div>
          </div>

          {/* Public Link */}
          {quote.public_url && (
            <div className="mt-6 pt-6 border-t">
              <div className="text-sm text-gray-500 mb-2">Shareable Link</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm">
                  {typeof window !== 'undefined'
                    ? `${window.location.origin}${quote.public_url}`
                    : quote.public_url}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}${quote.public_url}`
                    );
                    showSuccess('Link copied to clipboard');
                  }}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Copy
                </button>
                <Link
                  href={quote.public_url}
                  target="_blank"
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Scope of Work */}
        {quote.comments_text && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Scope of Work</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{quote.comments_text}</p>
          </div>
        )}

        {/* Line Items */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Products & Services</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-gray-500">
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium text-center">Qty</th>
                  <th className="pb-3 font-medium text-right">Unit Price</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {quote.line_items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-4">
                      <div className="font-medium text-gray-900">
                        {item.name}
                        {item.is_service && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            Service
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <div className="text-sm text-gray-500 mt-1">{item.description}</div>
                      )}
                      {item.detail_lines?.map((detail, i) => (
                        <div key={i} className="text-sm text-gray-400 ml-4">
                          {detail}
                        </div>
                      ))}
                    </td>
                    <td className="py-4 text-center">
                      {item.is_service ? '—' : item.quantity}
                    </td>
                    <td className="py-4 text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="py-4 text-right font-medium">
                      {formatCurrency(item.line_total || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t mt-4 pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatCurrency(quote.subtotal)}</span>
                </div>
                {quote.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Discount{' '}
                      {quote.discount_percent > 0 && `(${quote.discount_percent}%)`}
                    </span>
                    <span>-{formatCurrency(quote.discount_amount)}</span>
                  </div>
                )}
                {quote.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax ({quote.tax_rate}%)</span>
                    <span>{formatCurrency(quote.tax_amount)}</span>
                  </div>
                )}
                {quote.shipping_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span>{formatCurrency(quote.shipping_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(quote.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terms */}
        {quote.terms && quote.terms.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Terms & Conditions</h2>
            <ul className="space-y-2">
              {quote.terms.map((term, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="text-blue-600 mt-1">&#8226;</span>
                  {term}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-red-200">
          <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
          <p className="text-gray-600 mb-4">
            Once you delete a quote, there is no going back. Please be certain.
          </p>
          <button
            onClick={handleDelete}
            disabled={actionLoading === 'delete'}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {actionLoading === 'delete' ? 'Deleting...' : 'Delete Quote'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
