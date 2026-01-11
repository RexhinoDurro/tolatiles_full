'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Loader2, RefreshCw, Filter } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import QuotesTable from '@/components/admin/quotes/QuotesTable';
import { api } from '@/lib/api';
import type { QuoteListItem, QuoteStatus } from '@/types/api';

const statusFilters: { value: QuoteStatus | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All Quotes', color: 'gray' },
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'sent', label: 'Sent', color: 'blue' },
  { value: 'accepted', label: 'Accepted', color: 'green' },
  { value: 'expired', label: 'Expired', color: 'red' },
];

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteListItem[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<QuoteListItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getQuotes();
      setQuotes(data);
    } catch (err) {
      setError('Failed to load quotes. Please try again.');
      console.error('Failed to fetch quotes:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredQuotes(quotes);
    } else {
      setFilteredQuotes(quotes.filter((q) => q.status === statusFilter));
    }
  }, [quotes, statusFilter]);

  const getStatusCount = (status: QuoteStatus | 'all') => {
    if (status === 'all') return quotes.length;
    return quotes.filter((q) => q.status === status).length;
  };

  return (
    <AdminLayout title="Quotes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-gray-600">Create and manage customer quotes</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchQuotes}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/admin/quotes/new"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Quote
            </Link>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                statusFilter === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-white/20">
                {getStatusCount(filter.value)}
              </span>
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
            <button
              onClick={fetchQuotes}
              className="ml-4 text-red-600 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <QuotesTable quotes={filteredQuotes} onRefresh={fetchQuotes} />
        )}
      </div>
    </AdminLayout>
  );
}
