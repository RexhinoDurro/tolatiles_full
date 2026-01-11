'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import QuoteForm from '@/components/admin/quotes/QuoteForm';
import { api } from '@/lib/api';
import type { QuoteCreate } from '@/types/api';

export default function NewQuotePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: QuoteCreate) => {
    setIsLoading(true);
    setError(null);
    try {
      const quote = await api.createQuote(data);
      router.push(`/admin/quotes/${quote.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quote');
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout title="New Quote">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/admin/quotes"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quotes
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Quote Form */}
        <QuoteForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </AdminLayout>
  );
}
