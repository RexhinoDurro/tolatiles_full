'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Download, Phone, Mail, Calendar, Clock, AlertTriangle, CheckCircle, Building2, User, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import type { PublicInvoice } from '@/types/api';

export default function PublicInvoicePage() {
  const params = useParams();
  const reference = params.reference as string;

  const [invoice, setInvoice] = useState<PublicInvoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoice = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getPublicInvoice(reference);
      setInvoice(data);
    } catch (err) {
      setError('Invoice not found');
    } finally {
      setIsLoading(false);
    }
  }, [reference]);

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

  const isPaid = invoice?.status === 'paid';
  const isOverdue = invoice?.status === 'overdue';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-slate-600 font-medium">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100 flex items-center justify-center p-4 pt-24">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto text-center border border-slate-200">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Invoice Not Found</h1>
          <p className="text-slate-600 leading-relaxed">
            This invoice could not be found. Please contact us for assistance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100">
      {/* Spacer for any potential navbar */}
      <div className="h-6 sm:h-8"></div>

      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        {/* Status Banner */}
        {isPaid && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-emerald-900">Invoice Paid</p>
              <p className="text-sm text-emerald-700 mt-0.5">
                Thank you for your payment. This invoice has been marked as paid.
              </p>
            </div>
          </div>
        )}

        {isOverdue && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-red-900">Payment Overdue</p>
              <p className="text-sm text-red-700 mt-0.5">
                This invoice is past due. Please contact us to arrange payment.
              </p>
            </div>
          </div>
        )}

        {/* Main Invoice Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div>
                {invoice.company.company_logo && (
                  <img
                    src={invoice.company.company_logo}
                    alt={invoice.company.company_name}
                    className="h-10 sm:h-12 w-auto mb-4 brightness-0 invert opacity-90"
                  />
                )}
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">INVOICE</h1>
                <p className="text-emerald-200 font-mono text-sm">{invoice.reference}</p>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-3">
                <div className="text-right">
                  <p className="text-emerald-200 text-sm mb-1">{isPaid ? 'Paid in Full' : 'Amount Due'}</p>
                  <p className="text-3xl sm:text-4xl font-bold">
                    {formatCurrency(isPaid ? invoice.total : invoice.balance_due)}
                  </p>
                </div>
                {invoice.pdf_file && (
                  <button
                    onClick={() => {
                      const pdfUrl = invoice.pdf_file!.startsWith('http')
                        ? invoice.pdf_file!
                        : `http://localhost:8000${invoice.pdf_file}`;
                      window.location.href = pdfUrl;
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 rounded-xl transition-all text-white border border-white/20 backdrop-blur-sm"
                  >
                    <Download className="w-5 h-5" />
                    <span>View PDF</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-y lg:divide-y-0 divide-slate-200">
            {/* Bill To */}
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                <User className="w-4 h-4" />
                Bill To
              </div>
              <p className="font-semibold text-slate-900 text-xl mb-2">{invoice.customer.name}</p>
              <div className="space-y-1.5 text-slate-600">
                <p>{invoice.customer.phone}</p>
                {invoice.customer.email && <p>{invoice.customer.email}</p>}
                {invoice.customer.address && (
                  <p className="text-sm whitespace-pre-wrap mt-2">{invoice.customer.address}</p>
                )}
              </div>
            </div>

            {/* From */}
            <div className="p-6 sm:p-8 bg-slate-50/50">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                <Building2 className="w-4 h-4" />
                From
              </div>
              <p className="font-semibold text-slate-900 text-xl mb-2">{invoice.company.company_name}</p>
              <div className="space-y-1.5 text-slate-600">
                <p>{invoice.company.sender_name}</p>
                {invoice.company.sender_title && (
                  <p className="text-slate-500 text-sm">{invoice.company.sender_title}</p>
                )}
                {invoice.company.company_address && (
                  <p className="text-sm whitespace-pre-wrap mt-2">{invoice.company.company_address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 px-6 sm:px-8 py-4 bg-slate-100 border-y border-slate-200">
            <div className="flex items-center gap-2.5 text-slate-700">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-sm">
                <span className="text-slate-500">Issued:</span> <span className="font-medium">{formatDate(invoice.created_at)}</span>
              </span>
            </div>
            <div className={`flex items-center gap-2.5 ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>
              <Clock className={`w-4 h-4 ${isOverdue ? 'text-red-500' : 'text-slate-400'}`} />
              <span className="text-sm">
                <span className={isOverdue ? 'text-red-500' : 'text-slate-500'}>Due:</span>{' '}
                <span className="font-medium">{formatDate(invoice.due_date)}</span>
              </span>
            </div>
          </div>

          {/* Invoice Title / Description */}
          {invoice.title && (
            <div className="p-6 sm:p-8 border-b border-slate-200">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                <FileText className="w-4 h-4" />
                Description
              </div>
              <h2 className="text-xl font-semibold text-slate-900">{invoice.title}</h2>
            </div>
          )}

          {/* Line Items */}
          <div className="p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Invoice Items</h3>
            <div className="overflow-x-auto -mx-6 sm:-mx-8 px-6 sm:px-8">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="py-3 px-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider w-20">
                      Qty
                    </th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">
                      Unit Price
                    </th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.line_items.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-900">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-slate-500 mt-1">{item.description}</div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center text-slate-700">{item.quantity}</td>
                      <td className="py-4 px-4 text-right text-slate-700">
                        {formatCurrency(Number(item.unit_price))}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-slate-900">
                        {formatCurrency(item.line_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-8 flex justify-end">
              <div className="w-full sm:w-80 bg-slate-50 rounded-xl p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium text-slate-900">{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Discount</span>
                    <span className="font-medium">-{formatCurrency(invoice.discount_amount)}</span>
                  </div>
                )}
                {invoice.tax_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tax</span>
                    <span className="font-medium text-slate-900">{formatCurrency(invoice.tax_amount)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(invoice.total)}</span>
                  </div>
                </div>
                {invoice.amount_paid > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Paid</span>
                    <span className="font-medium">-{formatCurrency(invoice.amount_paid)}</span>
                  </div>
                )}
                <div className="pt-3 border-t-2 border-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-900">Balance Due</span>
                    <span className={`text-2xl font-bold ${isPaid ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {formatCurrency(invoice.balance_due)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Notes</h3>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{invoice.notes}</p>
            </div>
          )}

          {/* Contact Footer */}
          <div className="p-6 sm:p-10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="text-center max-w-xl mx-auto">
              <h3 className="text-xl font-semibold mb-3">Questions about this invoice?</h3>
              <p className="text-slate-400 mb-6">We&apos;re here to help. Feel free to reach out anytime.</p>
              <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
                {invoice.company.phone && (
                  <a
                    href={`tel:${invoice.company.phone}`}
                    className="flex items-center gap-2.5 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10"
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>{invoice.company.phone}</span>
                  </a>
                )}
                {invoice.company.email && (
                  <a
                    href={`mailto:${invoice.company.email}`}
                    className="flex items-center gap-2.5 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10"
                  >
                    <Mail className="w-4 h-4 text-emerald-400" />
                    <span>{invoice.company.email}</span>
                  </a>
                )}
              </div>
              <p className="text-slate-500 text-sm mt-8">
                {new Date().getFullYear()} {invoice.company.company_name}. All rights reserved.
              </p>
            </div>
          </div>
        </div>

        {/* Footer spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}
