'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import CrmLayout from '@/components/admin/crm/CrmLayout';
import QuoteForm from '@/components/admin/quotes/QuoteForm';
import { api } from '@/lib/api';
import type { QuoteCreate, Customer } from '@/types/api';

function NewQuoteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dealId = searchParams.get('deal') ? Number(searchParams.get('deal')) : undefined;
  const customerId = searchParams.get('customer') ? Number(searchParams.get('customer')) : undefined;

  const [initialCustomer, setInitialCustomer] = useState<Customer | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customerId) {
      api.getCustomer(customerId).then(setInitialCustomer).catch(() => {});
    }
  }, [customerId]);

  const handleSubmit = async (data: QuoteCreate) => {
    setIsLoading(true);
    setError(null);
    try {
      const quote = await api.createQuote(data);
      const backUrl = dealId ? `/admin/crm/deals/${dealId}?tab=quote` : `/admin/crm/quotes/${quote.id}`;
      router.push(backUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quote');
      setIsLoading(false);
    }
  };

  const backHref = dealId ? `/admin/crm/deals/${dealId}` : '/admin/crm/quotes';

  return (
    <CrmLayout title="New Quote">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href={backHref} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />
            {dealId ? 'Back to Deal' : 'Back to Quotes'}
          </Link>
        </div>
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
        )}
        <QuoteForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          initialCustomer={initialCustomer}
          dealId={dealId}
        />
      </div>
    </CrmLayout>
  );
}

export default function CrmNewQuotePage() {
  return (
    <Suspense>
      <NewQuoteContent />
    </Suspense>
  );
}
