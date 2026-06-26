'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { portalApi } from '@/lib/portalApi';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import PortalProtectedRoute from '@/components/quotes-portal/PortalProtectedRoute';
import type { QuoteListItem } from '@/types/api';
import { Plus, LogOut, FileText } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-700',
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function PortalQuotesContent() {
  const { logout, user } = usePortalAuth();
  const router = useRouter();
  const [quotes, setQuotes] = useState<QuoteListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    portalApi
      .getQuotes()
      .then(setQuotes)
      .catch(() => setError('Failed to load quotes'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900">TolaTiles Quotes Portal</h1>
            {user && (
              <p className="text-xs text-gray-500">
                {user.first_name || user.username}
              </p>
            )}
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Page title + create button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Quotes</h2>
          <Link
            href="/quotes-portal/quotes/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={15} />
            New Quote
          </Link>
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {!isLoading && !error && quotes.length === 0 && (
          <div className="text-center py-16">
            <FileText className="mx-auto mb-3 text-gray-300" size={40} />
            <p className="text-gray-500 text-sm">No quotes yet.</p>
            <Link
              href="/quotes-portal/quotes/new"
              className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
            >
              <Plus size={14} /> Create your first quote
            </Link>
          </div>
        )}

        {!isLoading && quotes.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Desktop table */}
            <table className="w-full hidden sm:table">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Reference</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Expires</th>
                  <th />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-600">{q.reference}</span>
                        {q.edited_by_admin && (
                          <span className="px-1.5 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 font-medium whitespace-nowrap">
                            Edited by Admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{q.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{q.portal_contact_name || q.customer_name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_STYLES[q.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(q.total, q.currency)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(q.expires_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => router.push(`/quotes-portal/quotes/${q.id}`)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-100">
              {quotes.map((q) => (
                <button
                  key={q.id}
                  onClick={() => router.push(`/quotes-portal/quotes/${q.id}`)}
                  className="w-full text-left p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{q.portal_contact_name || q.customer_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{q.title} · {q.reference}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_STYLES[q.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(q.total, q.currency)}
                      </span>
                    </div>
                  </div>
                  {q.edited_by_admin && (
                    <span className="mt-2 inline-block px-1.5 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 font-medium">
                      Edited by Admin
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PortalQuotesPage() {
  return (
    <PortalProtectedRoute>
      <PortalQuotesContent />
    </PortalProtectedRoute>
  );
}
