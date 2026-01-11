'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Download, Phone, Mail, Calendar, Clock, AlertTriangle, CheckCircle, Building2, User, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import type { PublicQuote } from '@/types/api';

export default function PublicQuotePage() {
  const params = useParams();
  const reference = params.reference as string;

  const [quote, setQuote] = useState<PublicQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getPublicQuote(reference);
      setQuote(data);
    } catch (err) {
      setError('Quote not found or has expired');
    } finally {
      setIsLoading(false);
    }
  }, [reference]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

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

  const isExpired = quote?.status === 'expired';
  const isAccepted = quote?.status === 'accepted';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-slate-600 font-medium">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4 pt-24">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto text-center border border-slate-200">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Quote Not Found</h1>
          <p className="text-slate-600 leading-relaxed">
            This quote may have expired or the link is invalid. Please contact us for assistance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Spacer for any potential navbar */}
      <div className="h-6 sm:h-8"></div>

      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        {/* Status Banner */}
        {isExpired && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-900">This quote has expired</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Please contact us for an updated quote with current pricing.
              </p>
            </div>
          </div>
        )}

        {isAccepted && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-emerald-900">Quote Accepted</p>
              <p className="text-sm text-emerald-700 mt-0.5">
                Thank you for accepting this quote. We will be in touch shortly to proceed.
              </p>
            </div>
          </div>
        )}

        {/* Main Quote Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div>
                {quote.company.company_logo && (
                  <img
                    src={quote.company.company_logo}
                    alt={quote.company.company_name}
                    className="h-10 sm:h-12 w-auto mb-4 brightness-0 invert opacity-90"
                  />
                )}
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">{quote.title}</h1>
                <p className="text-blue-200 font-mono text-sm">Quote #{quote.reference}</p>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-3">
                <div className="text-right">
                  <p className="text-blue-200 text-sm mb-1">Total Amount</p>
                  <p className="text-3xl sm:text-4xl font-bold">{formatCurrency(quote.total)}</p>
                </div>
                {quote.pdf_url && (
                  <button
                    onClick={() => {
                      console.log('pdf_url from API:', quote.pdf_url);
                      const pdfUrl = quote.pdf_url!.startsWith('http')
                        ? quote.pdf_url!
                        : `http://localhost:8000${quote.pdf_url}`;
                      console.log('Redirecting to:', pdfUrl);
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
            {/* Quote To */}
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                <User className="w-4 h-4" />
                Quote To
              </div>
              <p className="font-semibold text-slate-900 text-xl mb-2">{quote.customer_name}</p>
              <div className="space-y-1.5 text-slate-600">
                <p>{quote.customer_phone}</p>
                {quote.customer_email && <p>{quote.customer_email}</p>}
              </div>
            </div>

            {/* Quote From */}
            <div className="p-6 sm:p-8 bg-slate-50/50">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                <Building2 className="w-4 h-4" />
                From
              </div>
              <p className="font-semibold text-slate-900 text-xl mb-2">{quote.company.company_name}</p>
              <div className="space-y-1.5 text-slate-600">
                <p>{quote.company.sender_name}</p>
                {quote.company.title && (
                  <p className="text-slate-500 text-sm">{quote.company.title}</p>
                )}
                {quote.company.company_address && (
                  <p className="text-sm whitespace-pre-wrap mt-2">{quote.company.company_address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 px-6 sm:px-8 py-4 bg-slate-100 border-y border-slate-200">
            <div className="flex items-center gap-2.5 text-slate-700">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-sm">
                <span className="text-slate-500">Issued:</span> <span className="font-medium">{formatDate(quote.created_at)}</span>
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-sm">
                <span className="text-slate-500">Valid Until:</span> <span className="font-medium">{formatDate(quote.expires_at)}</span>
              </span>
            </div>
          </div>

          {/* Comments/Scope */}
          {quote.comments_text && (
            <div className="p-6 sm:p-8 border-b border-slate-200">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                <FileText className="w-4 h-4" />
                Project Scope
              </div>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{quote.comments_text}</p>
              </div>
            </div>
          )}

          {/* Line Items */}
          <div className="p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Products & Services</h3>
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
                  {quote.line_items.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-900">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-slate-500 mt-1">{item.description}</div>
                        )}
                        {item.detail_lines && item.detail_lines.length > 0 && (
                          <ul className="mt-2 text-sm text-slate-500 space-y-1">
                            {item.detail_lines.map((detail, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-slate-300 mt-1">•</span>
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
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
                  <span className="font-medium text-slate-900">{formatCurrency(quote.subtotal)}</span>
                </div>
                {quote.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Discount</span>
                    <span className="font-medium">-{formatCurrency(quote.discount_amount)}</span>
                  </div>
                )}
                {quote.tax_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tax</span>
                    <span className="font-medium text-slate-900">{formatCurrency(quote.tax_amount)}</span>
                  </div>
                )}
                {quote.shipping_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Shipping</span>
                    <span className="font-medium text-slate-900">{formatCurrency(quote.shipping_amount)}</span>
                  </div>
                )}
                <div className="pt-3 border-t-2 border-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-900">Total</span>
                    <span className="text-2xl font-bold text-slate-900">
                      {formatCurrency(quote.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terms */}
          {quote.terms && quote.terms.length > 0 && (
            <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Terms & Conditions</h3>
              <ul className="space-y-2.5">
                {quote.terms.map((term, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-700">
                    <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold mt-0.5">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{term}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact Footer */}
          <div className="p-6 sm:p-10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="text-center max-w-xl mx-auto">
              <h3 className="text-xl font-semibold mb-3">Questions about this quote?</h3>
              <p className="text-slate-400 mb-6">We&apos;re here to help. Feel free to reach out anytime.</p>
              <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
                {quote.company.phone && (
                  <a
                    href={`tel:${quote.company.phone}`}
                    className="flex items-center gap-2.5 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10"
                  >
                    <Phone className="w-4 h-4 text-blue-400" />
                    <span>{quote.company.phone}</span>
                  </a>
                )}
                {quote.company.email && (
                  <a
                    href={`mailto:${quote.company.email}`}
                    className="flex items-center gap-2.5 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10"
                  >
                    <Mail className="w-4 h-4 text-blue-400" />
                    <span>{quote.company.email}</span>
                  </a>
                )}
              </div>
              <p className="text-slate-500 text-sm mt-8">
                {new Date().getFullYear()} {quote.company.company_name}. All rights reserved.
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
