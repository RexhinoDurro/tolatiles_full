'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Loader2, Download, Send, CheckCircle, Trash2,
  Calendar, User, Clock, Edit, ExternalLink, Copy, Eye, BadgeCheck,
} from 'lucide-react';
import CrmLayout from '@/components/admin/crm/CrmLayout';
import InvoiceStatusBadge from '@/components/admin/invoices/InvoiceStatusBadge';
import InvoiceForm from '@/components/admin/invoices/InvoiceForm';
import { api } from '@/lib/api';
import type { Invoice, InvoiceCreate, InvoiceStatus, InvoiceInstallment } from '@/types/api';

export default function CrmInvoiceDetailPage() {
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
  const [installmentActionLoading, setInstallmentActionLoading] = useState<number | null>(null);

  const fetchInvoice = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getInvoice(invoiceId);
      setInvoice(data);
    } catch {
      setError('Failed to load invoice');
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => { fetchInvoice(); }, [fetchInvoice]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const formatCurrency = (v: number | string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(v));

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleUpdateInvoice = async (data: InvoiceCreate) => {
    setIsSaving(true);
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
      showSuccess('PDF generated successfully');
      setTimeout(fetchInvoice, 2000);
    } catch {
      setError('Failed to generate PDF');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendEmail = async () => {
    if (!invoice?.customer.email) { setError('Customer has no email'); return; }
    setActionLoading('email');
    try {
      await api.sendInvoiceEmail(invoiceId);
      fetchInvoice();
    } catch {
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
    } catch {
      setError('Failed to mark as paid');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkInstallmentPaid = async (installmentId: number) => {
    setInstallmentActionLoading(installmentId);
    try {
      await api.markInstallmentPaid(invoiceId, installmentId);
      // Regenerate PDF so balance due reflects the new payment
      await api.generateInvoicePdf(invoiceId).catch(() => {});
      fetchInvoice();
    } catch {
      setError('Failed to mark installment as paid');
    } finally {
      setInstallmentActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure?')) return;
    setActionLoading('delete');
    try {
      await api.deleteInvoice(invoiceId);
      router.push('/admin/crm/invoices');
    } catch {
      setError('Failed to delete invoice');
      setActionLoading(null);
    }
  };

  const handleUpdateStatus = async (status: InvoiceStatus) => {
    setActionLoading('status');
    try {
      await api.updateInvoiceStatus(invoiceId, status);
      fetchInvoice();
    } catch {
      setError('Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <CrmLayout title="Invoice">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </CrmLayout>
    );
  }

  if (!invoice) {
    return (
      <CrmLayout title="Invoice">
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold text-gray-900">Invoice not found</h2>
          <Link href="/admin/crm/invoices" className="text-blue-600 hover:underline mt-2 inline-block">Back to Invoices</Link>
        </div>
      </CrmLayout>
    );
  }

  if (isEditing) {
    return (
      <CrmLayout title="Edit Invoice">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button onClick={() => setIsEditing(false)} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" /> Cancel Editing
            </button>
          </div>
          {error && <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>}
          <InvoiceForm invoice={invoice} onSubmit={handleUpdateInvoice} isLoading={isSaving} />
        </div>
      </CrmLayout>
    );
  }

  return (
    <CrmLayout title={`Invoice ${invoice.reference}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/admin/crm/invoices" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" /> Back to Invoices
          </Link>
          <InvoiceStatusBadge status={invoice.status} />
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" /> {successMessage}
          </div>
        )}

        {/* Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Edit className="w-4 h-4" /> Edit
            </button>
            {invoice.pdf_file ? (
              <button
                onClick={() => { const url = invoice.pdf_file!.startsWith('http') ? invoice.pdf_file! : `${process.env.NEXT_PUBLIC_SITE_URL || ''}${invoice.pdf_file}`; window.location.href = url; }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Eye className="w-4 h-4" /> View PDF
              </button>
            ) : (
              <button onClick={handleGeneratePdf} disabled={actionLoading === 'pdf'} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {actionLoading === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Generate PDF
              </button>
            )}
            <button onClick={handleSendEmail} disabled={actionLoading === 'email' || !invoice.customer.email} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
              {actionLoading === 'email' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Email
            </button>
            <div className="ml-auto">
              <button onClick={handleDelete} disabled={actionLoading === 'delete'} className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50">
                {actionLoading === 'delete' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{invoice.title}</h2>
                  <p className="text-sm text-gray-500 font-mono mt-1">{invoice.reference}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(invoice.total)}</p>
                  {invoice.amount_paid > 0 && <p className="text-sm text-green-600 mt-1">Paid: {formatCurrency(invoice.amount_paid)}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600"><Calendar className="w-4 h-4" /> Created: {formatDate(invoice.created_at)}</div>
                <div className="flex items-center gap-2 text-gray-600"><Clock className="w-4 h-4" /> Due: {formatDate(invoice.due_date)}</div>
              </div>
              <div className="mt-6 pt-6 border-t">
                <div className="text-sm text-gray-500 mb-2">Shareable Link</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm truncate">
                    {typeof window !== 'undefined' ? `${window.location.origin}/invoices/${invoice.reference}` : `/invoices/${invoice.reference}`}
                  </code>
                  <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/invoices/${invoice.reference}`); showSuccess('Link copied'); }} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded">
                    <Copy className="w-4 h-4" />
                  </button>
                  <Link href={`/invoices/${invoice.reference}`} target="_blank" className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Installments & Line Items */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b"><h3 className="font-semibold text-gray-900">Line Items</h3></div>
              {invoice.installments.map((inst, instIdx) => (
                <div key={inst.id} className={instIdx > 0 ? 'border-t' : ''}>
                  <div className={`px-6 py-3 bg-gray-50 flex items-center justify-between ${invoice.installments.length === 1 ? 'border-b' : ''}`}>
                    <div className="flex items-center gap-3">
                      {invoice.installments.length > 1 && (
                        <span className="text-sm font-semibold text-gray-700">{inst.title}</span>
                      )}
                      {inst.due_date && invoice.installments.length > 1 && (
                        <span className="text-xs text-gray-500">Due: {formatDate(inst.due_date)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {inst.due_date && invoice.installments.length === 1 && (
                        <span className="text-xs text-gray-500">Due: {formatDate(inst.due_date)}</span>
                      )}
                      {inst.status === 'paid' ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                          <BadgeCheck className="w-3.5 h-3.5" /> Paid
                        </span>
                      ) : (
                        <button
                          onClick={() => handleMarkInstallmentPaid(inst.id)}
                          disabled={installmentActionLoading === inst.id}
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          {installmentActionLoading === inst.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <CheckCircle className="w-3.5 h-3.5" />}
                          Mark as Paid
                        </button>
                      )}
                    </div>
                  </div>
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {inst.line_items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{item.name}</div>
                            {item.description && <div className="text-sm text-gray-500">{item.description}</div>}
                          </td>
                          <td className="px-6 py-4 text-center text-gray-900">{item.quantity}</td>
                          <td className="px-6 py-4 text-right text-gray-900">{formatCurrency(Number(item.unit_price))}</td>
                          <td className="px-6 py-4 text-right font-medium text-gray-900">{formatCurrency(item.line_total ?? 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
              <div className="px-6 py-4 bg-gray-50 border-t">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span className="font-medium">{formatCurrency(invoice.subtotal)}</span></div>
                    {invoice.discount_amount > 0 && (
                      <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>-{formatCurrency(invoice.discount_amount)}</span></div>
                    )}
                    {invoice.tax_amount > 0 && (
                      <div className="flex justify-between text-sm"><span className="text-gray-600">Tax</span><span className="font-medium">{formatCurrency(invoice.tax_amount)}</span></div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t"><span>Total</span><span>{formatCurrency(invoice.total)}</span></div>
                    {invoice.amount_paid > 0 && (
                      <>
                        <div className="flex justify-between text-sm text-green-600"><span>Paid</span><span>-{formatCurrency(invoice.amount_paid)}</span></div>
                        <div className="flex justify-between text-lg font-bold text-orange-600"><span>Balance Due</span><span>{formatCurrency(invoice.balance_due)}</span></div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><User className="w-4 h-4" /> Customer</h3>
              <div className="space-y-3">
                <div><p className="font-medium text-gray-900">{invoice.customer.name}</p><p className="text-sm text-gray-500">{invoice.customer.phone}</p></div>
                {invoice.customer.email && <p className="text-sm text-gray-600">{invoice.customer.email}</p>}
                {invoice.customer.address && <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.customer.address}</p>}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {invoice.status === 'draft' && (
                  <button onClick={() => handleUpdateStatus('sent')} disabled={actionLoading === 'status'} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                    <Send className="w-4 h-4" /> Mark as Sent
                  </button>
                )}
              </div>
            </div>

            {invoice.paid_at && (
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Payment Received</h3>
                <p className="text-sm text-green-700">Paid on {formatDate(invoice.paid_at)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </CrmLayout>
  );
}
