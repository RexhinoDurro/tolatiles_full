'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, AlertCircle, CheckCircle, Loader2,
  FileDown, Eye, Send, Copy, ExternalLink, Edit,
} from 'lucide-react';
import PortalProtectedRoute from '@/components/quotes-portal/PortalProtectedRoute';
import QuoteForm from '@/components/admin/quotes/QuoteForm';
import QuoteStatusBadge from '@/components/admin/quotes/QuoteStatusBadge';
import { portalApi } from '@/lib/portalApi';
import type { Quote, QuoteCreate } from '@/types/api';

// ─── helpers ───────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

function formatCurrency(amount: number | string, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(amount));
}

// ─── inner component ────────────────────────────────────────────────────────

function PortalQuoteDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const quoteId = Number(id);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ── fetch ──────────────────────────────────────────────────────────────
  const fetchQuote = () => {
    setIsLoading(true);
    portalApi
      .getQuote(quoteId)
      .then(setQuote)
      .catch(() => setError('Failed to load quote'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchQuote(); }, [quoteId]);

  // ── success toast ──────────────────────────────────────────────────────
  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // ── edit / save ────────────────────────────────────────────────────────
  const handleSubmit = async (data: QuoteCreate) => {
    setIsSaving(true);
    setError(null);
    try {
      await portalApi.updateQuote(quoteId, data);
      fetchQuote();
      setIsEditing(false);
      showSuccess('Quote updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save quote');
    } finally {
      setIsSaving(false);
    }
  };

  // ── generate PDF ───────────────────────────────────────────────────────
  const handleGeneratePdf = async () => {
    setActionLoading('pdf');
    setError(null);
    try {
      await portalApi.generateQuotePdf(quoteId);
      showSuccess('PDF generated successfully');
      setTimeout(fetchQuote, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setActionLoading(null);
    }
  };

  // ── send email ─────────────────────────────────────────────────────────
  const handleSendEmail = async () => {
    if (!quote?.customer?.email) {
      setError('Customer has no email address');
      return;
    }
    setActionLoading('email');
    setError(null);
    try {
      await portalApi.sendQuoteEmail(quoteId);
      showSuccess('Quote sent to customer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setActionLoading(null);
    }
  };

  // ── loading / error states ────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !quote) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
        <AlertCircle size={16} />
        {error}
      </div>
    );
  }

  if (!quote) return null;

  // ── edit mode ─────────────────────────────────────────────────────────
  if (isEditing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={15} />
              Cancel Editing
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Admin-edited banner */}
          {(quote as any).edited_by_admin && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-center gap-2">
              <AlertCircle size={15} />
              An admin has reviewed and edited this quote. Saving your changes will clear this notice.
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
          <QuoteForm
            quote={quote}
            onSubmit={handleSubmit}
            isLoading={isSaving}
            onCustomerSearch={(q) => portalApi.searchCustomers(q)}
            hideCustomerField
          />
        </div>
      </div>
    );
  }

  // ── view mode ─────────────────────────────────────────────────────────
  const pdfUrl = quote.pdf_url
    ? (quote.pdf_url.startsWith('http') ? quote.pdf_url : `${process.env.NEXT_PUBLIC_SITE_URL || ''}${quote.pdf_url}`)
    : null;

  const shareableLink = quote.public_url
    ? (typeof window !== 'undefined'
      ? `${window.location.origin}${quote.public_url}`
      : quote.public_url)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={15} />
            Back
          </button>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Edit size={14} />
              Edit
            </button>

            {pdfUrl ? (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Eye size={14} />
                View PDF
              </a>
            ) : (
              <button
                onClick={handleGeneratePdf}
                disabled={actionLoading === 'pdf'}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading === 'pdf'
                  ? <Loader2 size={14} className="animate-spin" />
                  : <FileDown size={14} />}
                {actionLoading === 'pdf' ? 'Generating…' : 'Generate PDF'}
              </button>
            )}

            <button
              onClick={handleSendEmail}
              disabled={actionLoading === 'email' || !quote.customer?.email}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {actionLoading === 'email'
                ? <Loader2 size={14} className="animate-spin" />
                : <Send size={14} />}
              {actionLoading === 'email' ? 'Sending…' : 'Send Email'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Toast messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 flex items-center gap-2 text-sm">
            <CheckCircle size={16} />
            {successMessage}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Admin-edited notice */}
        {(quote as any).edited_by_admin && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-center gap-2">
            <AlertCircle size={15} />
            An admin has reviewed and updated this quote.
          </div>
        )}

        {/* Quote header card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{quote.title}</h1>
                <QuoteStatusBadge status={quote.status} />
              </div>
              <p className="font-mono text-blue-600 text-sm">{quote.reference}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(quote.total, quote.currency)}
              </div>
              <div className="text-sm text-gray-500">Total Amount</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Customer</div>
              <div className="font-medium text-gray-900">{quote.portal_contact_name || quote.customer.name}</div>
              {quote.customer.phone && quote.customer.phone !== 'system' && <div className="text-sm text-gray-600">{quote.customer.phone}</div>}
              {quote.customer.email && <div className="text-sm text-gray-600">{quote.customer.email}</div>}
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Dates</div>
              <div className="text-sm">
                <span className="text-gray-500">Created: </span>
                <span className="font-medium text-gray-900">{formatDate(quote.created_at)}</span>
              </div>
              <div className="text-sm mt-1">
                <span className="text-gray-500">Expires: </span>
                <span className="font-medium text-gray-900">{formatDate(quote.expires_at)}</span>
              </div>
              {quote.timeline && (
                <div className="text-sm mt-1">
                  <span className="text-gray-500">Timeline: </span>
                  <span className="font-medium text-gray-900">{quote.timeline}</span>
                </div>
              )}
            </div>
          </div>

          {/* PDF row */}
          {pdfUrl && (
            <div className="mt-6 pt-6 border-t flex items-center gap-3 flex-wrap">
              <div className="text-sm text-gray-500">PDF</div>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-green-700 hover:text-green-800 font-medium"
              >
                <Eye size={14} />
                View PDF
              </a>
              <button
                onClick={handleGeneratePdf}
                disabled={actionLoading === 'pdf'}
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                {actionLoading === 'pdf'
                  ? <Loader2 size={13} className="animate-spin" />
                  : <FileDown size={13} />}
                Regenerate
              </button>
            </div>
          )}

          {/* Shareable link */}
          {shareableLink && (
            <div className="mt-6 pt-6 border-t">
              <div className="text-sm text-gray-500 mb-2">Shareable Link</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-xs break-all">
                  {shareableLink}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareableLink);
                    showSuccess('Link copied to clipboard');
                  }}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm flex items-center gap-1"
                >
                  <Copy size={13} />
                  Copy
                </button>
                <a
                  href={quote.public_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Summary / comments */}
        {quote.comments_text && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-base font-semibold mb-3">Summary</h2>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{quote.comments_text}</p>
          </div>
        )}

        {/* Line items */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-base font-semibold mb-4">Products &amp; Services</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left text-gray-500">
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium text-center">Qty</th>
                  <th className="pb-3 font-medium text-right">Unit Price</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {quote.line_items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-3">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                      )}
                    </td>
                    <td className="py-3 text-center text-gray-700">
                      {item.is_service ? '—' : item.quantity}
                    </td>
                    <td className="py-3 text-right text-gray-700">
                      {formatCurrency(item.unit_price, quote.currency)}
                    </td>
                    <td className="py-3 text-right font-medium text-gray-900">
                      {formatCurrency(item.line_total || 0, quote.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t mt-4 pt-4 flex justify-end">
            <div className="w-64 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatCurrency(quote.subtotal, quote.currency)}</span>
              </div>
              {quote.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>
                    Discount{' '}
                    {quote.discount_percent > 0 && `(${quote.discount_percent}%)`}
                  </span>
                  <span>-{formatCurrency(quote.discount_amount, quote.currency)}</span>
                </div>
              )}
              {quote.tax_amount > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Tax ({quote.tax_rate}%)</span>
                  <span>{formatCurrency(quote.tax_amount, quote.currency)}</span>
                </div>
              )}
              {quote.shipping_amount > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span>{formatCurrency(quote.shipping_amount, quote.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold border-t pt-2 mt-1">
                <span>Total</span>
                <span>{formatCurrency(quote.total, quote.currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms */}
        {quote.terms && quote.terms.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-base font-semibold mb-3">Terms &amp; Conditions</h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              {quote.terms.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── page export ────────────────────────────────────────────────────────────

export default function PortalQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  return (
    <PortalProtectedRoute>
      <PortalQuoteDetailContent id={unwrappedParams.id} />
    </PortalProtectedRoute>
  );
}

// Trigger rebuild
