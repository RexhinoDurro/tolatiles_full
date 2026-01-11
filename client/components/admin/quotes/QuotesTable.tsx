'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, Trash2, Copy, Send, FileDown, ChevronUp, ChevronDown, MoreVertical } from 'lucide-react';
import QuoteStatusBadge from './QuoteStatusBadge';
import type { QuoteListItem } from '@/types/api';
import { api } from '@/lib/api';

interface QuotesTableProps {
  quotes: QuoteListItem[];
  onRefresh: () => void;
}

type SortField = 'reference' | 'title' | 'customer_name' | 'status' | 'total' | 'created_at' | 'expires_at';
type SortDirection = 'asc' | 'desc';

export default function QuotesTable({ quotes, onRefresh }: QuotesTableProps) {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedQuotes = [...quotes].sort((a, b) => {
    let aVal: string | number = a[sortField] as string | number;
    let bVal: string | number = b[sortField] as string | number;

    if (sortField === 'total') {
      aVal = Number(aVal);
      bVal = Number(bVal);
    }

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = (bVal as string).toLowerCase();
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1" />
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
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

  const handleDuplicate = async (id: number) => {
    setActionLoading(id);
    try {
      await api.duplicateQuote(id);
      onRefresh();
    } catch (error) {
      console.error('Failed to duplicate quote:', error);
    } finally {
      setActionLoading(null);
      setOpenMenu(null);
    }
  };

  const handleGeneratePdf = async (id: number) => {
    setActionLoading(id);
    try {
      await api.generateQuotePdf(id);
      onRefresh();
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setActionLoading(null);
      setOpenMenu(null);
    }
  };

  const handleSendEmail = async (id: number) => {
    setActionLoading(id);
    try {
      await api.sendQuoteEmail(id);
      onRefresh();
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setActionLoading(null);
      setOpenMenu(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;
    setActionLoading(id);
    try {
      await api.deleteQuote(id);
      onRefresh();
    } catch (error) {
      console.error('Failed to delete quote:', error);
    } finally {
      setActionLoading(null);
      setOpenMenu(null);
    }
  };

  if (quotes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <FileDown className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes found</h3>
        <p className="text-gray-500 mb-4">Get started by creating your first quote.</p>
        <Link
          href="/admin/quotes/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Quote
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('reference')}
              >
                Reference <SortIcon field="reference" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('title')}
              >
                Title <SortIcon field="title" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('customer_name')}
              >
                Customer <SortIcon field="customer_name" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                Status <SortIcon field="status" />
              </th>
              <th
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('total')}
              >
                Total <SortIcon field="total" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('expires_at')}
              >
                Expires <SortIcon field="expires_at" />
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedQuotes.map((quote) => (
              <tr key={quote.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono text-sm text-blue-600">{quote.reference}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900 truncate max-w-xs">{quote.title}</div>
                  <div className="text-sm text-gray-500">{quote.line_item_count} items</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{quote.customer_name}</div>
                  <div className="text-sm text-gray-500">{quote.customer_phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <QuoteStatusBadge status={quote.status} size="sm" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="font-semibold text-gray-900">{formatCurrency(quote.total)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(quote.expires_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/quotes/${quote.id}`}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDuplicate(quote.id)}
                      disabled={actionLoading === quote.id}
                      className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSendEmail(quote.id)}
                      disabled={actionLoading === quote.id}
                      className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Send Email"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(quote.id)}
                      disabled={actionLoading === quote.id}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-200">
        {sortedQuotes.map((quote) => (
          <div key={quote.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="font-mono text-sm text-blue-600">{quote.reference}</span>
                <h3 className="font-medium text-gray-900">{quote.title}</h3>
              </div>
              <div className="relative">
                <button
                  onClick={() => setOpenMenu(openMenu === quote.id ? null : quote.id)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {openMenu === quote.id && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-10">
                    <Link
                      href={`/admin/quotes/${quote.id}`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4" /> View
                    </Link>
                    <button
                      onClick={() => handleDuplicate(quote.id)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Copy className="w-4 h-4" /> Duplicate
                    </button>
                    <button
                      onClick={() => handleSendEmail(quote.id)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Send className="w-4 h-4" /> Send Email
                    </button>
                    <button
                      onClick={() => handleDelete(quote.id)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{quote.customer_name}</span>
              <QuoteStatusBadge status={quote.status} size="sm" />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-lg font-semibold text-gray-900">{formatCurrency(quote.total)}</span>
              <span className="text-sm text-gray-500">Expires {formatDate(quote.expires_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
